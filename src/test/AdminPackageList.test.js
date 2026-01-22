import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminPackageList } from '../component/AdminPackageList';
import Swal from 'sweetalert2';
import * as PackageTravelService from '../service/PackageTravelService';
import { packagesList } from './mockData';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => {
    const { packagesList } = require('./mockData');
    return {
        apiGetPackagesAdmin: jest.fn(),
        apiDeletePackage: jest.fn(),
        fireAlert: jest.fn(),
    };
});

jest.mock('../component/AdminPackageForm', () => ({
    AdminPackageForm: ({ packageToEdit, onActionComplete }) => (
        <div data-testid="admin-package-form">
            <p>Formulario de {packageToEdit?.id ? 'Edición' : 'Registro'}</p>
            <button onClick={onActionComplete}>Acción Formulario Completa</button>
        </div>
    ),
    initialFormData: { id: null },
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

describe('AdminPackageList Component', () => {
    const mockOnBackToMenu = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        global.Swal = Swal;
        PackageTravelService.apiGetPackagesAdmin.mockResolvedValue(packagesList);
        PackageTravelService.apiDeletePackage.mockResolvedValue({});
        PackageTravelService.fireAlert.mockResolvedValue({ isConfirmed: true });
    });

    afterAll(() => {
        delete global.Swal;
    });

    it('should load and display package list correctly', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        expect(screen.getByText(/Cargando lista de paquetes/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Administración de Paquetes')).toBeInTheDocument();
            expect(screen.getByText(packagesList[0].name)).toBeInTheDocument();
            expect(screen.queryByText(/Cargando lista de paquetes/i)).not.toBeInTheDocument();
        });

        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(5); 
    });

    it('should show error message if API fails', async () => {
        PackageTravelService.apiGetPackagesAdmin.mockRejectedValue(new Error('API error'));

        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            expect(screen.getByText('Error al cargar la lista de paquetes.')).toBeInTheDocument();
        });
    });

    it('should handle pagination: show next items on "Siguiente"', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            expect(screen.getByText(packagesList[0].name)).toBeInTheDocument();
        });

        expect(screen.queryByText(packagesList[4].name)).not.toBeInTheDocument();

        const nextButton = screen.getByText(/Siguiente/i);
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(packagesList[4].name)).toBeInTheDocument();
            expect(screen.queryByText(packagesList[0].name)).not.toBeInTheDocument();
        });
    });

    it('should open registration form when clicking "Nuevo Paquete"', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            const newBtn = screen.getByRole('button', { name: /Nuevo Paquete/i });
            fireEvent.click(newBtn);
        });

        expect(screen.getByTestId('admin-package-form')).toBeInTheDocument();
        expect(screen.getByText('Formulario de Registro')).toBeInTheDocument();
    });

    it('should open edit form with package data', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            const editButtons = screen.getAllByRole('button', { name: /Editar/i });
            fireEvent.click(editButtons[0]);
        });

        expect(screen.getByTestId('admin-package-form')).toBeInTheDocument();
        expect(screen.getByText('Formulario de Edición')).toBeInTheDocument();
    });

    it('should call delete API after user confirmation', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
            fireEvent.click(deleteButtons[0]);
        });
        
        expect(PackageTravelService.fireAlert).toHaveBeenCalledWith(
            'Confirmar Eliminación',
            expect.stringContaining(packagesList[0].name),
            'warning',
            true
        );

        await waitFor(() => {
            expect(PackageTravelService.apiDeletePackage).toHaveBeenCalledWith(packagesList[0].id);
            expect(PackageTravelService.apiGetPackagesAdmin).toHaveBeenCalledTimes(2);
        });
    });
});