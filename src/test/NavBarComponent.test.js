import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NavBarComponent } from '../component/NavBarComponent';

const mockContextValue = {
    packageTravel: [{ id: 1, name: 'Test Package' }], 
};
const PackageTravelContext = React.createContext(mockContextValue);

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: (context) => {
        if (context.displayName === 'PackageTravelContext') {
            return mockContextValue;
        }
        return jest.requireActual('react').useContext(context);
    },
}));

jest.mock('../context/PackageTravelContext', () => ({
    PackageTravelContext: { displayName: 'PackageTravelContext' },
}));

const renderWithContext = (props) => {
    return render(
        <Router>
            <NavBarComponent {...props} />
        </Router>
    );
};

describe('NavBarComponent', () => {

    it('should be transparent by default when there is no scroll or forced solidity', () => {
        const { container } = renderWithContext({ isScrolled: false, shouldBeSolid: false });
        
        const navElement = container.querySelector('.tn-navbar');
  
        expect(navElement).toHaveClass('navbar-transparent');

        const logo = screen.getByAltText('Logo de Tierra Nativa');
        expect(logo).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA BLANCO.png');
    });

    it('should be solid when isScrolled is true', () => {
        const { container } = renderWithContext({ isScrolled: true, shouldBeSolid: false });
        
        const navElement = container.querySelector('.tn-navbar');

        expect(navElement).toHaveClass('navbar-solid');

        const logo = screen.getByAltText('Logo de Tierra Nativa');
        expect(logo).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA.png');
    });

    it('should be solid when shouldBeSolid is true, ignoring isScrolled', () => {
 
        const { container } = renderWithContext({ isScrolled: false, shouldBeSolid: true });
        
        const navElement = container.querySelector('.tn-navbar');
        expect(navElement).toHaveClass('navbar-solid');
        
        const logo = screen.getByAltText('Logo de Tierra Nativa');
        expect(logo).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA.png');
    });
    
    it('should render "Tierra Nativa" brand as a link to root', () => {
        renderWithContext({ isScrolled: false, shouldBeSolid: false });
        
        const brandLink = screen.getByText('Tierra Nativa').closest('a');
        expect(brandLink).toHaveAttribute('href', '/');
        expect(brandLink).toHaveClass('navbar-brand');
    });

    it('should render all category navigation elements', () => {
        renderWithContext({ isScrolled: false, shouldBeSolid: false });
        
        const categories = ['Aventura', 'Ecoturismo', 'Relajación', 'Geopaisajes', 'Litoral'];
        
        categories.forEach(category => {
            expect(screen.getByText(category)).toBeInTheDocument();
        });
    });

    it('should render "Mi cuenta" dropdown menu', () => {
        renderWithContext({ isScrolled: false, shouldBeSolid: false });
        
        const accountButton = screen.getByRole('button', { name: /Mi cuenta/i });
        expect(accountButton).toBeInTheDocument();
        
        const loginItem = screen.getByText('Iniciar Sesión').closest('a');
        const createAccountItem = screen.getByText('Crear Cuenta').closest('a');

        expect(loginItem).toBeInTheDocument();
        expect(createAccountItem).toBeInTheDocument();
    });
});