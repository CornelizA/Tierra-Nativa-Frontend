import { render, screen } from '@testing-library/react';
import { FooterComponent } from '../component/FooterComponent'; 

describe('FooterComponent', () => {
    
    const currentYear = new Date().getFullYear();

    it('should render "Tierra Nativa" brand title', () => {
        render(<FooterComponent />);
        
        expect(screen.getByText('Tierra Nativa')).toBeInTheDocument();
    });

    it('should show copyright text with current year', () => {
        render(<FooterComponent />);
        
        const copyrightText = `© ${currentYear} Tierra Nativa. Todos los derechos reservados.`;
    
        expect(screen.getByText(copyrightText)).toBeInTheDocument();
    });
    
    it('should render logo image with correct alt attribute', () => {
        render(<FooterComponent />);
        
        const logoImage = screen.getByAltText('Logo Tierra Nativa');
        expect(logoImage).toBeInTheDocument();

        expect(logoImage).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA.png');
    });

    it('should show Contact section with subtitle', () => {
        render(<FooterComponent />);
        
        expect(screen.getByText('Contacto')).toBeInTheDocument();
    });
    
    it('should show contact email address', () => {
        render(<FooterComponent />);
        
        expect(screen.getByText('Email: info@tierranativa.com')).toBeInTheDocument();
    });

    it('should show contact phone number', () => {
        render(<FooterComponent />);
        
        expect(screen.getByText('Teléfono: +54 9 11 5555-5555')).toBeInTheDocument();
    });

    it('should show "Síguenos" subtitle', () => {
        render(<FooterComponent />);
        
        expect(screen.getByText('Síguenos')).toBeInTheDocument();
    });

    it('should contain Facebook link with correct aria-label', () => {
        render(<FooterComponent />);
        
        const facebookLink = screen.getByLabelText('Facebook');
        
        expect(facebookLink).toBeInTheDocument();
        expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
    });

    it('should contain Instagram link with correct aria-label', () => {
        render(<FooterComponent />);
    
        const instagramLink = screen.getByLabelText('Instagram');
        
        expect(instagramLink).toBeInTheDocument();
        expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
    });
});