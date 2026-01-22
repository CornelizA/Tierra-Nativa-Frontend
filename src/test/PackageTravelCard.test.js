import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackageTravelCard } from '../component/PackageTravelCard';
import { PackageTravelContext } from '../context/PackageTravelContext';
import '@testing-library/jest-dom';

jest.mock('../helpers/FormatCurrency', () => ({
    formatCurrency: jest.fn((price) => `$${Number(price).toFixed(2)}`),
}));

const mockCategoryMap = {
    "1": "AVENTURA",
    "2": "RELAX"
};

const mockProps = {
    name: 'Ruta de los 7 Lagos',
    shortDescription: 'Un recorrido escénico por la Patagonia.',
    basePrice: 1250.50,
    destination: 'Bariloche',
    categories: null, 
    categoryId: 1,
    imageUrl: 'https://example.com/lagos.jpg',
};

const renderWithContext = (props) => {
    return render(
        <PackageTravelContext.Provider value={{ categoryMap: mockCategoryMap }}>
            <PackageTravelCard {...props} />
        </PackageTravelContext.Provider>
    );
};

describe('PackageTravelCard Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render package name on both front and back sides', () => {
        renderWithContext(mockProps);
        const titles = screen.getAllByText(mockProps.name);
        expect(titles).toHaveLength(2);
    });

    it('should display the short description on the back side', () => {
        renderWithContext(mockProps);
        expect(screen.getByText(mockProps.shortDescription)).toBeInTheDocument();
    });

    it('should resolve and format categories using categoryMap and categoryId', () => {
        renderWithContext(mockProps);
        expect(screen.getByText(/Aventura/i)).toBeInTheDocument();
    });

    it('should show "Sin categoría" if no categories or categoryId are provided', () => {
        const propsWithoutCat = { ...mockProps, categories: null, categoryId: null };
        renderWithContext(propsWithoutCat);
        
        expect(screen.getByText(/Sin categoría/i)).toBeInTheDocument();
    });

    it('should format the price using the formatCurrency helper', () => {
        renderWithContext(mockProps);
        
        expect(screen.getByText('$1250.50')).toBeInTheDocument();
        expect(require('../helpers/FormatCurrency').formatCurrency).toHaveBeenCalledWith(1250.50);
    });

    it('should render the image with correct attributes', () => {
        renderWithContext(mockProps);
        
        const image = screen.getByAltText(mockProps.name);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProps.imageUrl);
    });

    it('should handle category arrays correctly', () => {
        const propsWithArray = { 
            ...mockProps, 
            categoryId: [1, 2] 
        };
        renderWithContext(propsWithArray);
        expect(screen.getByText(/Aventura, Relax/i)).toBeInTheDocument();
    });
});