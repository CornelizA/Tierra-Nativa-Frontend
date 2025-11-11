import { render, screen, fireEvent } from '@testing-library/react';
import { PackageTravelCard } from '../component/PackageTravelCard';

jest.mock('../helpers/FormatCurrency', () => ({
    formatCurrency: jest.fn((price) => `$${price.toFixed(2)}`),
}));

const mockProps = {
    name: 'Ruta de los 7 Lagos',
    shortDescription: 'Un recorrido escénico por la Patagonia.',
    basePrice: 1250.50,
    destination: 'Bariloche',
    category: 'AVENTURA',
    imageUrl: 'https://example.com/lagos.jpg',
};

describe('PackageTravelCard', () => {

    it('should show package name on front and back', () => {
        render(<PackageTravelCard {...mockProps} />);
        
        expect(screen.getByText(mockProps.name, { selector: '.card-title' })).toBeInTheDocument();
        expect(screen.getByText(mockProps.name, { selector: '.back-title' })).toBeInTheDocument();
    });

    it('should show short description on back', () => {
        render(<PackageTravelCard {...mockProps} />);
        
        expect(screen.getByText(mockProps.shortDescription)).toBeInTheDocument();
    });

    it('should show destination and category', () => {
        render(<PackageTravelCard {...mockProps} />);
        
        expect(screen.getByText('Bariloche')).toBeInTheDocument();
        expect(screen.getByText('Aventura')).toBeInTheDocument();
    });

    it('should format price correctly using helper', () => {
        render(<PackageTravelCard {...mockProps} />);
    
        expect(screen.getByText('$1250.50')).toBeInTheDocument();
        expect(jest.requireMock('../helpers/FormatCurrency').formatCurrency).toHaveBeenCalledWith(1250.50);
    });

    it('should show image with correct alt text and URL', () => {
        render(<PackageTravelCard {...mockProps} />);
        
        const image = screen.getByAltText(mockProps.name);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProps.imageUrl);
    });

    it('should use fallback image when image fails to load', () => {
        render(<PackageTravelCard {...mockProps} />);
        
        const image = screen.getByAltText(mockProps.name);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProps.imageUrl);
        
        fireEvent.error(image);
        
        expect(image).toHaveAttribute('src', 'URL_DE_FALLBACK_DEFAULT');
    });
});