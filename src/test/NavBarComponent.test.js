import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NavBarComponent } from '../component/NavBarComponent';
import '@testing-library/jest-dom';

const mockCategories = [
    { id: 1, title: 'Aventura' },
    { id: 2, title: 'Ecoturismo' }
];

const renderWithRouter = (props) => {
    return render(
        <Router>
            <NavBarComponent categories={mockCategories} {...props} />
        </Router>
    );
};

describe('NavBarComponent Evolution', () => {

    it('should show transparent logo when not scrolled', () => {
        const { container } = renderWithRouter({ isScrolled: false, shouldBeSolid: false });
        const nav = container.querySelector('.tn-navbar');
        expect(nav).toHaveClass('navbar-transparent');
        
        const logo = screen.getByAltText(/Logo de Tierra Nativa/i);
        expect(logo).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA BLANCO.png');
    });

    it('should render categories from props correctly', () => {
        renderWithRouter({ isScrolled: true });
        
        expect(screen.getByText('Aventura')).toBeInTheDocument();
        expect(screen.getByText('Ecoturismo')).toBeInTheDocument();
        expect(screen.getByText('Aventura').closest('a')).toHaveAttribute('href', '/categories/categoria/aventura');
    });

    it('should show "Mi cuenta" dropdown when no user is logged in', () => {
        renderWithRouter({ user: null });
        
        expect(screen.getByRole('button', { name: /Mi cuenta/i })).toBeInTheDocument();
        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    });

    it('should render User Avatar with initials and Admin badge when user is ADMIN', () => {
        const adminUser = {
            firstName: 'Juan',
            lastName: 'Perez',
            role: 'ADMIN'
        };

        renderWithRouter({ user: adminUser });

        expect(screen.getByText('JP')).toBeInTheDocument();
        expect(screen.getByText('Juan')).toBeInTheDocument();
     
        const badge = screen.getByText('ADMIN');
        expect(badge).toHaveClass('bg-warning');
        expect(screen.getByText('Panel Admin')).toBeInTheDocument();
    });

    it('should call onLogout when clicking logout button', () => {
        const mockLogout = jest.fn();
        const user = { firstName: 'Juan', role: 'USER' };

        renderWithRouter({ user, onLogout: mockLogout });

        const logoutBtn = screen.getByText('Cerrar Sesión');
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should not show "Panel Admin" for regular USER role', () => {
        const regularUser = { firstName: 'Juan', role: 'USER' };
        renderWithRouter({ user: regularUser });

        expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
    });
});