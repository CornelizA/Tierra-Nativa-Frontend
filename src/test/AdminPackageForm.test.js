import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminPackageForm } from '../component/AdminPackageForm';
import { 
    apiPostPackage, 
    apiUpdatePackage, 
    apiGetCategoriesPublic, 
    apiGetCharacteristicsPublic 
} from '../service/PackageTravelService';
import { PackageTravelContext } from '../context/PackageTravelContext';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiPostPackage: jest.fn(),
    apiUpdatePackage: jest.fn(),
    apiGetCategoriesPublic: jest.fn(),
    apiGetCharacteristicsPublic: jest.fn(),
    fireAlert: jest.fn(),
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
    showLoading: jest.fn(),
    close: jest.fn(),
}));

const mockContextValue = {
    addPackageTravel: jest.fn(),
    updatePackageTravel: jest.fn(),
    fetchPackageTravel: jest.fn(),
};

const mockCategories = [
    { id: 1, title: 'Aventura' },
    { id: 2, title: 'Relax' }
];

const mockCharacteristics = [
    { id: 10, title: 'Wi-Fi', icon: 'Wifi' },
    { id: 11, title: 'Piscina', icon: 'Waves' }
];

const onActionComplete = jest.fn();

const renderComponent = (props = {}) => {
    return render(
        <PackageTravelContext.Provider value={mockContextValue}>
            <AdminPackageForm onActionComplete={onActionComplete} {...props} />
        </PackageTravelContext.Provider>
    );
};

describe('AdminPackageForm Updated', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        apiGetCategoriesPublic.mockResolvedValue(mockCategories);
        apiGetCharacteristicsPublic.mockResolvedValue(mockCharacteristics);
        storageMock();
        global.Swal = Swal;
    });

    afterAll(() => {
        delete global.Swal;
    });

    const storageMock = () => {
        const storage = { 'jwtToken': 'mock-token' };
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn((key) => storage[key] || null),
            },
            writable: true,
        });
    };

    test('should load categories and characteristics on mount', async () => {
        renderComponent();
        
        await waitFor(() => {
            expect(apiGetCategoriesPublic).toHaveBeenCalled();
            expect(apiGetCharacteristicsPublic).toHaveBeenCalled();
        });

        const categorySelect = await screen.findByRole('combobox');
        expect(categorySelect).toBeInTheDocument();
        expect(screen.getByText('Aventura')).toBeInTheDocument();
        expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    });

    test('should validate required fields and show Swal warning', async () => {
        renderComponent();
        
        const submitBtn = screen.getByText('Registrar Producto');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                icon: 'warning',
                title: 'Validación Incompleta'
            }));
        });
    });

    test('should submit successfully in creation mode', async () => {
        apiPostPackage.mockResolvedValue({ name: 'Nuevo Viaje', id: 123 });
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Nombre del Paquete/i), { target: { value: 'Nuevo Viaje' } });
        fireEvent.change(screen.getByLabelText(/Descripción Corta/i), { target: { value: 'Una descripción de más de diez caracteres' } });
        fireEvent.change(screen.getByLabelText(/Precio Base/i), { target: { value: '5000' } });
        fireEvent.change(screen.getByLabelText(/Destino/i), { target: { value: 'Bariloche' } });
        const categorySelect = await screen.findByRole('combobox');
        fireEvent.change(categorySelect, { target: { value: '1' } });

        await waitFor(() => {
            const charBtn = screen.getByText('Wi-Fi');
            fireEvent.click(charBtn);
        });

        fireEvent.change(screen.getByLabelText(/Duración/i), { target: { value: '3 días' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Hospedaje/i), { target: { value: 'Cabaña' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Traslados/i), { target: { value: 'Bus' } });
        fireEvent.change(screen.getByLabelText(/Planificación día por día/i), { target: { value: 'Día 1...' } });
        fireEvent.change(screen.getByLabelText(/Notas de Alimentación/i), { target: { value: 'Todo incluido' } });
        fireEvent.change(screen.getByLabelText(/Recomendaciones Generales/i), { target: { value: 'Llevar abrigo' } });
        fireEvent.change(screen.getByPlaceholderText(/URL de Imagen Principal/i), { target: { value: 'http://img.com/1.jpg' } });

        const submitBtn = screen.getByText('Registrar Producto');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(apiPostPackage).toHaveBeenCalled();
            expect(mockContextValue.addPackageTravel).toHaveBeenCalled();
        });

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            icon: 'success'
        }));
    });

    test('should call apiUpdatePackage in edit mode', async () => {
        const packageToEdit = {
            id: 88,
            name: 'Viaje Original',
            shortDescription: 'Descripción larga original',
            basePrice: 1000,
            destination: 'Salta',
            itineraryDetail: { duration: '1 día', lodgingType: 'Hotel', transferType: 'Auto', dailyActivitiesDescription: '...', foodAndHydrationNotes: '...', generalRecommendations: '...' },
            imageDetails: [{ url: 'http://old.jpg', principal: true }],
            categoryId: [1],
            characteristicIds: [10]
        };

        apiUpdatePackage.mockResolvedValue({ ...packageToEdit, name: 'Viaje Editado' });
        
        renderComponent({ packageToEdit });

        const nameInput = screen.getByLabelText(/Nombre del Paquete/i);
        fireEvent.change(nameInput, { target: { value: 'Viaje Editado' } });

        const updateBtn = screen.getByText('Actualizar Paquete');
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(apiUpdatePackage).toHaveBeenCalledWith(expect.objectContaining({
                id: 88,
                name: 'Viaje Editado'
            }));
            expect(mockContextValue.updatePackageTravel).toHaveBeenCalled();
        });
    });
});