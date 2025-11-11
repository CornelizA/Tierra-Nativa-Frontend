import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminPackageList } from '../component/AdminPackageList';
import Swal from 'sweetalert2';
import * as PackageTravelService from '../service/PackageTravelService';
import { packagesList } from './mockData';

jest.mock('../service/PackageTravelService', () => {
    const { packagesList } = require('./mockData');
    return {
        apiGetPackages: jest.fn(),
        apiDeletePackage: jest.fn(),
        apiGetPackageById: jest.fn(id => Promise.resolve(packagesList.find(p => p.id === id) || null)),
        apiPostPackage: jest.fn(packageData => Promise.resolve({ ...packageData, id: 99 })),
        apiUpdatePackage: jest.fn(packageData => Promise.resolve(packageData)),
        apiGetPackageByCategory: jest.fn(category => Promise.resolve(packagesList.filter(p => p.category === category))),
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


describe('AdminPackageList', () => {
    const mockOnBackToMenu = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        PackageTravelService.apiGetPackages.mockResolvedValue(packagesList);
        PackageTravelService.apiDeletePackage.mockResolvedValue({});
    });

    it('should handle initial flow (load/error)', async () => {
            PackageTravelService.apiGetPackages.mockRejectedValueOnce(new Error('forced failure')); 

            render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

            await waitFor(() => {
                expect(screen.getByText('Error al cargar la lista de paquetes.')).toBeInTheDocument();
                expect(screen.queryByText(/Cargando lista de paquetes/i)).not.toBeInTheDocument();
            });
        });

    it('should load and display package list after loading', async () => {
        PackageTravelService.apiGetPackages.mockResolvedValue(packagesList);
        
        render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

        await waitFor(() => {
            expect(screen.getByText('Panel de Administración de Paquetes')).toBeInTheDocument();
            expect(screen.getByText('Aventura Patagonia 7 Días')).toBeInTheDocument();
            expect(screen.getByText('Relax en Caribe Todo Incluido')).toBeInTheDocument();
            expect(screen.queryByText(/Cargando lista de paquetes/i)).not.toBeInTheDocument();
        }, { timeout: 3000 });

        const rows = screen.getAllByRole('row');
        expect(rows.length).toBe(5);
    });

    it('should show error message if loading fails', async () => {
            PackageTravelService.apiGetPackages.mockRejectedValue(new Error('API error'));

            render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

            await waitFor(() => {
                expect(screen.getByText('Error al cargar la lista de paquetes.')).toBeInTheDocument();
                expect(screen.queryByText(/Cargando lista de paquetes/i)).not.toBeInTheDocument();
            });
        });

    it('should handle pagination correctly', async () => {
            PackageTravelService.apiGetPackages.mockResolvedValue(packagesList); 
            render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

            await waitFor(() => {
                expect(screen.getByText('Aventura Patagonia 7 Días')).toBeInTheDocument();
                expect(screen.getByText('Safari Fotográfico Kenia')).toBeInTheDocument();
                expect(screen.queryByText('Luces y Moda en París')).not.toBeInTheDocument();
            });

            const nextButton = screen.getByText(/Siguiente/i).closest('a');
            fireEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.queryByText('Safari Fotográfico Kenia')).not.toBeInTheDocument();
                expect(screen.getByText('Luces y Moda en París')).toBeInTheDocument();
                expect(screen.getByText('Termas y Relax en el Sur')).toBeInTheDocument();
            });

            const prevButton = screen.getByText(/Anterior/i).closest('a');
            fireEvent.click(prevButton);

            await waitFor(() => {
                expect(screen.getByText('Safari Fotográfico Kenia')).toBeInTheDocument();
                expect(screen.queryByText('Luces y Moda en París')).not.toBeInTheDocument();
            });
        });

    it('should show registration form when clicking "Registrar Nuevo Paquete"', async () => {
            PackageTravelService.apiGetPackages.mockResolvedValue(packagesList); 
            render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

            await waitFor(() => {
                expect(screen.getByText('Panel de Administración de Paquetes')).toBeInTheDocument();
            });

            const registerButton = screen.getByRole('button', { name: /Registrar Nuevo Paquete/i });
            fireEvent.click(registerButton);

            expect(screen.getByTestId('admin-package-form')).toBeInTheDocument();
            expect(screen.getByText('Formulario de Registro')).toBeInTheDocument();

            expect(screen.queryByText('Panel de Administración de Paquetes')).not.toBeInTheDocument();
        });

    it('should show edit form when clicking "Editar"', async () => {
            PackageTravelService.apiGetPackages.mockResolvedValue(packagesList); 
            render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

            await waitFor(() => {
                expect(screen.getByText('Aventura Patagonia 7 Días')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole('button', { name: /Editar/i });
            fireEvent.click(editButtons[0]); 

            expect(screen.getByTestId('admin-package-form')).toBeInTheDocument();
            expect(screen.getByText('Formulario de Edición')).toBeInTheDocument(); 
        });

    it('should delete a package when confirming SweetAlert', async () => {
            PackageTravelService.apiGetPackages.mockResolvedValue(packagesList); 
            render(<AdminPackageList onBackToMenu={mockOnBackToMenu} />);

            await waitFor(() => {
                expect(screen.getByText('Aventura Patagonia 7 Días')).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                    html: expect.stringContaining('Aventura Patagonia 7 Días'),
                }));
            });

            await waitFor(() => {
                expect(PackageTravelService.apiDeletePackage).toHaveBeenCalledWith(1);
            });

            await waitFor(() => {
                expect(PackageTravelService.apiGetPackages).toHaveBeenCalledTimes(2);
            });

            await waitFor(() => {
                 const successCall = Swal.fire.mock.calls.find(call => call[0].icon === 'success');
                 expect(successCall).toBeDefined();
            });
        });

});