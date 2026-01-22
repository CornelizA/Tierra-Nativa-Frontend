import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CategoryPackagesPage } from '../pages/CategoryPackagesPage';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetCategoriesByCategory: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockResponseSuccess = {
    categoryDetails: {
        title: 'Aventura Extrema',
        description: 'Explora los límites de la naturaleza.',
        imageUrl: 'http://image-aventura.jpg'
    },
    packages: [
        { id: 101, name: 'Trekking Fitz Roy', destination: 'El Chaltén', basePrice: 500, imageDetails: [] },
        { id: 102, name: 'Rafting Mendoza', destination: 'Potrerillos', basePrice: 300, imageDetails: [] }
    ]
};

const renderComponent = (slug = 'aventura') => {
    return render(
        <MemoryRouter initialEntries={[`/categories/categoria/${slug}`]}>
            <Routes>
                <Route path="/categories/categoria/:categorySlug" element={<CategoryPackagesPage />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('CategoryPackagesPage Integration', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should load and display category details and packages', async () => {
        PackageService.apiGetCategoriesByCategory.mockResolvedValue(mockResponseSuccess);
        
        renderComponent('aventura');
        expect(screen.getByText(/Cargando paquetes y detalles/i)).toBeInTheDocument();

        expect(
            await screen.findByRole('heading', { level: 1, name: /Aventura extrema/i })
        ).toBeInTheDocument();
        expect(screen.getByText('Explora los límites de la naturaleza.')).toBeInTheDocument();
        const packageTitles = screen.getAllByText('Trekking Fitz Roy');
        expect(packageTitles.length).toBeGreaterThan(0);
        expect(screen.getByText('Encontramos 2 experiencias para ti')).toBeInTheDocument();
    });

    it('should handle API returning only a list (Fallback logic)', async () => {
        PackageService.apiGetCategoriesByCategory.mockResolvedValue(mockResponseSuccess.packages);
        
        renderComponent('relax');

        expect(
            await screen.findByText(/El servicio solo devolvió la lista de paquetes para "Relax"/i, {}, { timeout: 3000 })
        ).toBeInTheDocument();
    });

    it('should show error message and login link on 401 Unauthorized', async () => {
        PackageService.apiGetCategoriesByCategory.mockRejectedValue({
            response: { status: 401 }
        });

        renderComponent('privado');

        await waitFor(() => {
            expect(screen.getByText(/Acceso no autorizado/i)).toBeInTheDocument();
            const loginLink = screen.getByRole('link', { name: /Ir a Iniciar Sesión/i });
            expect(loginLink).toHaveAttribute('href', '/login');
        });
    });

    it('should show "no packages" message when the list is empty', async () => {
        PackageService.apiGetCategoriesByCategory.mockResolvedValue({
            categoryDetails: { title: 'Vacio', description: 'Sin nada' },
            packages: []
        });

        renderComponent('vacio');

        await waitFor(() => {
            expect(screen.getByText(/¡Parece que aún no hay paquetes en la categoría/i)).toBeInTheDocument();
        });
    });

    it('should trigger fetchPackages again when clicking "Recargar Paquetes"', async () => {
        PackageService.apiGetCategoriesByCategory.mockResolvedValue(mockResponseSuccess);
        
        renderComponent('aventura');

        await waitFor(() => {
            const reloadBtn = screen.getByText('Recargar Paquetes');
            fireEvent.click(reloadBtn);
        });

        expect(PackageService.apiGetCategoriesByCategory).toHaveBeenCalledTimes(2);
    });
});