import { render, screen } from '@testing-library/react';
import { PackageTravelCard } from '../component/PackageTravelCard';
import { PackageTravelContext } from '../context/PackageTravelContext';
import '@testing-library/jest-dom';

jest.mock('../helpers/FormatCurrency', () => ({
    formatCurrency: jest.fn((price) => `$${Number(price).toFixed(2)}`),
}));

jest.mock('../service/PackageTravelService', () => ({
    apiToggleFavorite: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockCategoryMap = {
    "1": "AVENTURA",
    "2": "RELAX"
};

const mockPkg = {
    id: 1,
    name: 'Ruta de los 7 Lagos',
    shortDescription: 'Un recorrido escénico por la Patagonia.',
    basePrice: 1250.50,
    destination: 'Bariloche',
    categories: null,
    categoryId: 1,
};

const mockImageUrl = 'https://example.com/lagos.jpg';

const renderWithContext = (pkg, imageUrl = mockImageUrl) => {
    return render(
        <PackageTravelContext.Provider value={{ categoryMap: mockCategoryMap, favoriteIds: new Set() }}>
            <PackageTravelCard pkg={pkg} imageUrl={imageUrl} />
        </PackageTravelContext.Provider>
    );
};

describe('PackageTravelCard Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render package name on both front and back sides', () => {
        renderWithContext(mockPkg);
        const titles = screen.getAllByText(mockPkg.name);
        expect(titles).toHaveLength(2);
    });

    it('should display the short description on the back side', () => {
        renderWithContext(mockPkg);
        expect(screen.getByText(mockPkg.shortDescription)).toBeInTheDocument();
    });

    it('should resolve and format categories using categoryMap and categoryId', () => {
        renderWithContext(mockPkg);
        expect(screen.getByText(/Aventura/i)).toBeInTheDocument();
    });

    it('should show "Sin categoría" if no categories or categoryId are provided', () => {
        const pkgWithoutCat = { ...mockPkg, categories: null, categoryId: null };
        renderWithContext(pkgWithoutCat);
        expect(screen.getByText(/Sin categoría/i)).toBeInTheDocument();
    });

    it('should format the price using the formatCurrency helper', () => {
        renderWithContext(mockPkg);
        expect(screen.getByText('$1250.50')).toBeInTheDocument();
        expect(require('../helpers/FormatCurrency').formatCurrency).toHaveBeenCalledWith(1250.50);
    });

    it('should render the image with correct attributes', () => {
        renderWithContext(mockPkg);
        const image = screen.getByAltText(mockPkg.name);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockImageUrl);
    });

    it('should handle category arrays correctly', () => {
        const pkgWithArray = { ...mockPkg, categoryId: [1, 2] };
        renderWithContext(pkgWithArray);
        expect(screen.getByText(/Aventura, Relax/i)).toBeInTheDocument();
    });
});
