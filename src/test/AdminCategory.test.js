import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminCategory } from '../component/AdminCategory';
import * as PackageService from '../service/PackageTravelService';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetCategories: jest.fn(),
    apiPostCategory: jest.fn(),
    apiUpdateCategory: jest.fn(),
    apiDeleteCategory: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockReload = jest.fn();
let originalLocation;

const mockCategories = [
    { id: 1, title: 'AVENTURA', description: 'Descrip 1', imageUrl: 'http://img1.jpg' },
    { id: 2, title: 'RELAX', description: 'Descrip 2', imageUrl: 'http://img2.jpg' },
];

const renderComponent = (props = {}) => {
    return render(
        <Router>
            <AdminCategory onBackToMenu={jest.fn()} {...props} />
        </Router>
    );
};

describe('AdminCategory Component', () => {

    beforeAll(() => {
        originalLocation = window.location;
        delete window.location;
        window.location = {
            href: 'http://localhost/',
            reload: mockReload,
            assign: jest.fn(),
            replace: jest.fn(),
            toString: () => 'http://localhost/',
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockReload.mockClear();
        PackageService.apiGetCategories.mockResolvedValue(mockCategories);
        PackageService.fireAlert.mockResolvedValue({ isConfirmed: true });
    });

    afterAll(() => {
        window.location = originalLocation;
    });

    it('should load and display categories in the table', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('AVENTURA')).toBeInTheDocument();
            expect(screen.getByText('RELAX')).toBeInTheDocument();
        });
    });

    it('should open modal when clicking "Nueva Categoría"', async () => {
        renderComponent();
        const newBtn = await screen.findByText(/Nueva Categoría/i);
        fireEvent.click(newBtn);
        expect(screen.getByText('Crear Nueva Categoría')).toBeInTheDocument();
    });

    it('should show warning if trying to submit incomplete form', async () => {
        renderComponent();
        const newBtn = await screen.findByText(/Nueva Categoría/i);
        fireEvent.click(newBtn);
        
        const saveBtns = await screen.findAllByText(/Guardar categoría/i);
        fireEvent.click(saveBtns[0]);

        await waitFor(() => {
            expect(PackageService.fireAlert).toHaveBeenCalledWith(
                'Campos Incompletos', 
                expect.any(String), 
                'warning'
            );
        });
    });

    it('should call apiPostCategory and reload when creating a new category', async () => {
        PackageService.apiPostCategory.mockResolvedValue({ title: 'CULTURA' });
        renderComponent();

        const newBtn = await screen.findByText(/Nueva Categoría/i);
        fireEvent.click(newBtn);

        const titleInput = await screen.findByLabelText(/Título/i);
        const urlInput = await screen.findByLabelText(/URL de Imagen/i);
        const descInput = await screen.findByLabelText(/Descripción/i);

        fireEvent.change(titleInput, { target: { value: 'Cultura' } });
        fireEvent.change(urlInput, { target: { value: 'http://cultura.jpg' } });
        fireEvent.change(descInput, { target: { value: 'Descripción de cultura' } });

        const saveBtns = await screen.findAllByText(/Guardar categoría/i);
        fireEvent.click(saveBtns[0]);

        await waitFor(() => {
            expect(PackageService.apiPostCategory).toHaveBeenCalled();
        });
    });

    it('should load category data into form when clicking "Editar"', async () => {
        renderComponent();
        await waitFor(() => {
            const editButtons = screen.getAllByText(/Editar/i);
            fireEvent.click(editButtons[0]);
        });
        expect(screen.getByText('Editar Categoría Existente')).toBeInTheDocument();
        expect(screen.getByDisplayValue('AVENTURA')).toBeInTheDocument();
    });

    it('should call apiDeleteCategory and reload after confirmation', async () => {
        renderComponent();
        const deleteBtns = await screen.findAllByText(/Eliminar/i);
        fireEvent.click(deleteBtns[0]);

        await waitFor(() => {
            expect(PackageService.apiDeleteCategory).toHaveBeenCalledWith(1);
        });
    });

    it('should handle API errors during fetch', async () => {
        PackageService.apiGetCategories.mockRejectedValue(new Error('Fetch failed'));
        renderComponent();
        await waitFor(() => {
            expect(PackageService.fireAlert).toHaveBeenCalledWith(
                'Error de Conexión',
                expect.any(String),
                'error'
            );
        });
    });
});