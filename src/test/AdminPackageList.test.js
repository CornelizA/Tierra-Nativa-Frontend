import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AdminPackageList } from '../component/AdminPackageList';
import * as PackageTravelService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.mock('lucide-react', () => ({
    Pencil: () => <div data-testid="pencil-icon" />,
    X: () => <div data-testid="x-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    ArrowLeft: () => <div data-testid="left-icon" />,
    ArrowRight: () => <div data-testid="right-icon" />,
}));

jest.mock('../component/AdminPackageForm', () => ({
    AdminPackageForm: ({ packageToEdit, onActionComplete }) => (
        <div data-testid="admin-package-form">
            <p>Formulario de {packageToEdit?.id ? 'Edición' : 'Registro'}</p>
            <button onClick={onActionComplete}>Acción Formulario Completa</button>
        </div>
    ),
    initialFormData: { id: null },
}));

const mockSwalFire = jest.fn(() => Promise.resolve({ isConfirmed: true }));
global.Swal = { fire: mockSwalFire };

jest.mock('../service/PackageTravelService', () => ({
    apiGetPackages: jest.fn(),
    apiDeletePackage: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockPackagesList = [
    { id: 1, name: "Glaciar Perito Moreno", destination: "Calafate", basePrice: 600000 },
    { id: 2, name: "Cataratas Iguazú", destination: "Misiones", basePrice: 400000 },
    { id: 3, name: "Fitz Roy Trekking", destination: "Chaltén", basePrice: 800000 },
    { id: 4, name: "Esteros del Iberá", destination: "Corrientes", basePrice: 350000 },
    { id: 5, name: "Península Valdés", destination: "Chubut", basePrice: 500000 },
    { id: 6, name: "Salta Colonial", destination: "Salta", basePrice: 450000 },
    { id: 7, name: "Mendoza y Vinos", destination: "Mendoza", basePrice: 550000 },
    { id: 8, name: "Bariloche Nevado", destination: "Río Negro", basePrice: 700000 },
    { id: 9, name: "Ushuaia Fin del Mundo", destination: "Tierra del Fuego", basePrice: 900000 },
];

describe('AdminPackageList Component', () => {
    const mockOnBackToMenu = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        PackageTravelService.apiGetPackages.mockResolvedValue(mockPackagesList);
        PackageTravelService.apiDeletePackage.mockResolvedValue({});
        PackageTravelService.fireAlert.mockResolvedValue({ isConfirmed: true });
    });

    afterEach(() => {
        cleanup();
    });

    it('should load and display package list correctly', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        expect(screen.getByText(/Cargando lista/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Administración de Paquetes')).toBeInTheDocument();
            expect(screen.getByText(mockPackagesList[0].name)).toBeInTheDocument();
        });
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(9);
    });

    it('should show error message if API fails', async () => {
        PackageTravelService.apiGetPackages.mockRejectedValue(new Error('API error'));

        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar la lista de paquetes/i)).toBeInTheDocument();
        });
    });

    it('should handle pagination: show next items on "Siguiente"', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            expect(screen.getByText(mockPackagesList[0].name)).toBeInTheDocument();
        });
        expect(screen.queryByText(mockPackagesList[8].name)).not.toBeInTheDocument();

        const nextButton = screen.getByText(/Siguiente/i);
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(mockPackagesList[8].name)).toBeInTheDocument();
            expect(screen.queryByText(mockPackagesList[0].name)).not.toBeInTheDocument();
        });
    });

    it('should open registration form when clicking "Nuevo Paquete"', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            const newBtn = screen.getByText(/Nuevo Paquete/i);
            fireEvent.click(newBtn);
        });
        expect(screen.getByTestId('admin-package-form')).toBeInTheDocument();
        expect(screen.getByText('Formulario de Registro')).toBeInTheDocument();
    });

    it('should open edit form with package data', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(async () => {
            const editButtons = screen.getAllByText(/Editar/i);
            fireEvent.click(editButtons[0]);
        });
        expect(screen.getByTestId('admin-package-form')).toBeInTheDocument();
        expect(screen.getByText('Formulario de Edición')).toBeInTheDocument();
    });

    it('should call delete API after user confirmation', async () => {
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            const deleteButtons = screen.getAllByText(/Eliminar/i);
            fireEvent.click(deleteButtons[0]);
        });
        expect(PackageTravelService.fireAlert).toHaveBeenCalledWith(
            'Confirmar Eliminación',
            expect.stringContaining(mockPackagesList[0].name),
            'warning',
            true
        );
        await waitFor(() => {
            expect(PackageTravelService.apiDeletePackage).toHaveBeenCalledWith(mockPackagesList[0].id);
            expect(PackageTravelService.apiGetPackages).toHaveBeenCalledTimes(2);
        });
    });
});