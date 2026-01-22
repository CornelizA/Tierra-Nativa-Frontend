import { render, screen } from '@testing-library/react';
import { FooterComponent } from '../component/FooterComponent';
import '@testing-library/jest-dom';

describe('FooterComponent', () => {
    
    const currentYear = new Date().getFullYear();

    it('should render brand title and logo with correct attributes', () => {
        render(<FooterComponent />);
        expect(screen.getByText('Tierra Nativa')).toBeInTheDocument();
    
        const logo = screen.getByAltText('Logo Tierra Nativa');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA.png');
    });

    it('should show copyright text with current year dynamically', () => {
        render(<FooterComponent />);
        
        const copyrightText = `© ${currentYear} Tierra Nativa. Todos los derechos reservados.`;
        expect(screen.getByText(copyrightText)).toBeInTheDocument();
    });

    it('should show correct contact information', () => {
        render(<FooterComponent />);
        expect(screen.getByText(/Email: tierranativa.dev@gmail.com/i)).toBeInTheDocument();
        expect(screen.getByText(/Teléfono: \+54 9 11 5555-5555/i)).toBeInTheDocument();
    });

    it('should render social media links with correct aria-labels and hrefs', () => {
        render(<FooterComponent />);
        
        const facebookLink = screen.getByLabelText('Facebook');
        const instagramLink = screen.getByLabelText('Instagram');
        
        expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
        expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
    });

    it('should have semantic footer tag and correct layout classes', () => {
        const { container } = render(<FooterComponent />);
        
        const footerTag = container.querySelector('footer');
        expect(footerTag).toBeInTheDocument();
        expect(footerTag).toHaveClass('footer-tn');
    });
});