import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AdminPackageForm } from '../component/AdminPackageForm';
import { apiPostPackage, apiUpdatePackage, apiGetCategories, apiGetCharacteristics 
} from '../service/PackageTravelService';
import { PackageTravelContext } from '../context/PackageTravelContext';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';

jest.setTimeout(20000);


jest.mock('../service/PackageTravelService', () => ({
    apiPostPackage: jest.fn(),
    apiUpdatePackage: jest.fn(),
    apiGetCategories: jest.fn(),
    apiGetCharacteristics: jest.fn(),
    fireAlert: jest.fn(),
}));

jest.mock('lucide-react', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    ArrowLeft: () => <div data-testid="arrow-left-icon" />,
    Star: () => <div data-testid="star-icon" />,
    Check: () => <div data-testid="check-icon" />,
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
    { id: 10, title: 'Wi-Fi', icon: 'wifi' },
    { id: 11, title: 'Piscina', icon: 'star' }
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
        apiGetCategories.mockResolvedValue(mockCategories);
        apiGetCharacteristics.mockResolvedValue(mockCharacteristics);
        storageMock();
        global.Swal = Swal;
    });

    afterEach(() => {
        cleanup();
    });

    const storageMock = () => {
        const storage = { 'jwtToken': 'mock-token' };
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn((key) => storage[key] || null),
                setItem: jest.fn((key, value) => { storage[key] = value; }),
                removeItem: jest.fn((key) => { delete storage[key]; }),
                clear: jest.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
            },
            writable: true,
        });
    };

    test('should load categories and characteristics on mount', async () => {
        renderComponent();
        
        await waitFor(() => {
            expect(apiGetCategories).toHaveBeenCalled();
            expect(apiGetCharacteristics).toHaveBeenCalled();
        });

        const categorySelect = await screen.findByRole('combobox');
        expect(categorySelect).toBeInTheDocument();
        expect(await screen.findByText('Aventura')).toBeInTheDocument();
        expect(await screen.findByText('Wi-Fi')).toBeInTheDocument();
    });

    test('should validate required fields and show Swal warning', async () => {
        renderComponent();

        await screen.findByText(/Información Básica/i);

        const submitBtn = screen.getByText(/Registrar Producto/i);
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

        await screen.findByText('Wi-Fi');

        fireEvent.change(screen.getByLabelText(/Nombre del Paquete/i), { target: { value: 'Nuevo Viaje' } });
        fireEvent.change(screen.getByLabelText(/Descripción Corta/i), { target: { value: 'Descripción de más de diez caracteres para que la validación pase satisfactoriamente' } });
        fireEvent.change(screen.getByLabelText(/Precio Base/i), { target: { value: '5000' } });
        fireEvent.change(screen.getByLabelText(/Capacidad/i), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/Destino/i), { target: { value: 'Bariloche' } });
        
        const categorySelect = screen.getByRole('combobox');
        fireEvent.change(categorySelect, { target: { value: '1' } });
        
        const charSpan = screen.getByText('Wi-Fi');
        fireEvent.click(charSpan.closest('button'));

        fireEvent.change(screen.getByLabelText(/Duración/i), { target: { value: '3 días' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Hospedaje/i), { target: { value: 'Cabaña' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Traslados/i), { target: { value: 'Bus' } });
        fireEvent.change(screen.getByLabelText(/Planificación día por día/i), { target: { value: 'Día 1: Llegada a destino. Día 2: Excursión al Cerro Catedral.' } });
        fireEvent.change(screen.getByLabelText(/Notas de Alimentación/i), { target: { value: 'Todo incluido en el hotel' } });
        fireEvent.change(screen.getByLabelText(/Recomendaciones Generales/i), { target: { value: 'Llevar abrigo pesado y calzado cómodo para trekking' } });
        fireEvent.change(screen.getByPlaceholderText(/URL de Imagen Principal/i), { target: { value: 'http://img.com/1.jpg' } });

        const submitBtn = screen.getByText(/Registrar Producto/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(apiPostPackage).toHaveBeenCalled();
            expect(mockContextValue.addPackageTravel).toHaveBeenCalled();
        }, { timeout: 10000 });
    }, 20000); 

    test('should call apiUpdatePackage in edit mode', async () => {
        const packageToEdit = {
            id: 88,
            name: 'Viaje Original',
            shortDescription: 'Descripción larga original requerida para que no falle la validación inicial del formulario',
            basePrice: "1000",
            capacity: 15,
            destination: 'Salta',
            itineraryDetail: { 
                duration: '1 día', 
                lodgingType: 'Hotel', 
                transferType: 'Auto', 
                dailyActivitiesDescription: 'Día 1: Arribo y descanso en el hotel céntrico.', 
                foodAndHydrationNotes: 'Pensión completa incluida en restaurante.', 
                generalRecommendations: 'Traer protector solar y gorra.' 
            },
            imageDetails: [{ url: 'http://old.jpg', principal: true }],
            categoryId: [1],
            characteristicIds: [10]
        };

        apiUpdatePackage.mockResolvedValue({ ...packageToEdit, name: 'Viaje Editado' });
        
        renderComponent({ packageToEdit });

        const nameInput = await screen.findByLabelText(/Nombre del Paquete/i);
        fireEvent.change(nameInput, { target: { value: 'Viaje Editado' } });

        const updateBtn = screen.getByText(/Actualizar Paquete/i);
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(apiUpdatePackage).toHaveBeenCalledWith(
                88, 
                expect.objectContaining({ name: 'Viaje Editado' })
            );
            expect(mockContextValue.updatePackageTravel).toHaveBeenCalled();
        }, { timeout: 10000 });
    }, 20000); 
});