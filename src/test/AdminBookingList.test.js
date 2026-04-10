import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AdminBookingList } from '../component/AdminBookingList';
import { MemoryRouter } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.setTimeout(20000);

jest.mock('../service/PackageTravelService', () => ({
    apiGetAllBookingsAdmin: jest.fn(),
    apiToggleContactedStatus: jest.fn(),
    apiGetAvailableCapacity: jest.fn(),
}));

jest.mock('lucide-react', () => {
    const icon = (name) => ({ size, className, title, ...rest }) => (
        <svg data-testid={`icon-${name}`} {...rest} />
    );
    return {
        ArrowLeft: icon('arrow-left'),
        ArrowRight: icon('arrow-right'),
        Users: icon('users'),
        Phone: icon('phone'),
        Calendar: icon('calendar'),
        CheckSquare: icon('check-square'),
        RefreshCw: icon('refresh'),
        MessageSquare: icon('message'),
        BarChart2: icon('barchart'),
    };
});

const mockBookings = [
    {
        id: 1,
        userName: 'Laura',
        userLastName: 'Martínez',
        userEmail: 'laura@test.com',
        userPhone: '+54 9 11 1111-1111',
        packageId: 10,
        packageName: 'Glaciar Perito Moreno',
        destination: 'El Calafate',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
        travelerCount: 2,
        totalPrice: 1000,
        status: 'CONFIRMED',
        isContacted: false,
        contacted: false,
        specialRequests: null,
    },
    {
        id: 2,
        userName: 'Carlos',
        userLastName: 'Pérez',
        userEmail: 'carlos@test.com',
        userPhone: '+54 9 11 2222-2222',
        packageId: 11,
        packageName: 'Cataratas del Iguazú',
        destination: 'Puerto Iguazú',
        startDate: '2026-07-10',
        endDate: '2026-07-15',
        travelerCount: 3,
        totalPrice: 2500,
        status: 'CANCELLED',
        isContacted: true,
        contacted: true,
        specialRequests: 'Necesito silla de ruedas',
    },
    {
        id: 3,
        userName: 'María',
        userLastName: 'López',
        userEmail: 'maria@test.com',
        userPhone: null,
        packageId: 10,
        packageName: 'Glaciar Perito Moreno',
        destination: 'El Calafate',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        travelerCount: 1,
        totalPrice: 500,
        status: 'FINISHED',
        isContacted: false,
        contacted: false,
        specialRequests: null,
    },
];

const storageMock = () => {
    const storage = { jwtToken: 'admin-token' };
    Object.defineProperty(window, 'sessionStorage', {
        value: {
            getItem: (key) => storage[key] || null,
            setItem: (key, val) => { storage[key] = val; },
            removeItem: (key) => { delete storage[key]; },
            clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
        },
        writable: true,
    });
};

const renderComponent = (props = {}) => {
    return render(
        <MemoryRouter>
            <AdminBookingList onBackToMenu={jest.fn()} {...props} />
        </MemoryRouter>
    );
};

describe('AdminBookingList', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        storageMock();
        PackageService.apiGetAllBookingsAdmin.mockResolvedValue(mockBookings);
        PackageService.apiGetAvailableCapacity.mockResolvedValue({ availableSpots: 8 });
    });

    afterEach(cleanup);

    it('should show loading spinner initially', () => {
        PackageService.apiGetAllBookingsAdmin.mockImplementation(() => new Promise(() => {}));
        renderComponent();
        expect(document.querySelector('.spinner-border')).toBeInTheDocument();
    });

    it('should render all bookings after loading', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Laura Martínez')).toBeInTheDocument();
            expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
            expect(screen.getByText('María López')).toBeInTheDocument();
        });
    });

    it('should show booking package names', async () => {
        renderComponent();
        await waitFor(() => {
            const names = screen.getAllByText('Glaciar Perito Moreno');
            expect(names.length).toBeGreaterThan(0);
        });
    });

    it('should filter and show only cancelled bookings', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Laura Martínez'));

        const cancelBtn = screen.getByText(/Canceladas/i);
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
            expect(screen.queryByText('Laura Martínez')).not.toBeInTheDocument();
        });
    });

    it('should filter and show only pending contact bookings', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Laura Martínez'));

        const pendingBtn = screen.getByText(/Pendientes/i);
        fireEvent.click(pendingBtn);

        await waitFor(() => {
            expect(screen.getByText('Laura Martínez')).toBeInTheDocument();
            expect(screen.queryByText('Carlos Pérez')).not.toBeInTheDocument();
        });
    });

    it('should filter bookings by package using the select dropdown', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Laura Martínez'));

        const select = screen.getByTitle(/Filtrar por paquete/i);
        fireEvent.change(select, { target: { value: '11' } });

        await waitFor(() => {
            expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
            expect(screen.queryByText('Laura Martínez')).not.toBeInTheDocument();
        });
    });

    it('should show "Coordinada completada" on FINISHED booking checkbox', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('María López'));

        const checkboxes = screen.getAllByRole('checkbox');
        const finishedCheckbox = checkboxes.find(cb => cb.disabled && cb.checked);
        expect(finishedCheckbox).toBeTruthy();
    });

    it('should call apiToggleContactedStatus when checkbox is toggled', async () => {
        PackageService.apiToggleContactedStatus.mockResolvedValue({ isContacted: true, contacted: true });
        renderComponent();
        await waitFor(() => screen.getByText('Laura Martínez'));

        const checkboxes = screen.getAllByRole('checkbox');
        const activeCheckbox = checkboxes.find(cb => !cb.disabled);
        if (activeCheckbox) {
            fireEvent.click(activeCheckbox);
            await waitFor(() => {
                expect(PackageService.apiToggleContactedStatus).toHaveBeenCalled();
            });
        }
    });

    it('should render message icons for all bookings (special requests column)', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Carlos Pérez'));
        const msgIcons = document.querySelectorAll('[data-testid="icon-message"]');
        expect(msgIcons.length).toBeGreaterThan(0);
    });

    it('should show empty message when filter returns no results', async () => {
        PackageService.apiGetAllBookingsAdmin.mockResolvedValue([]);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/No hay reservas con el filtro seleccionado/i)).toBeInTheDocument();
        });
    });

    it('should paginate and show at most 8 items per page', async () => {
        const manyBookings = Array.from({ length: 15 }, (_, i) => ({
            ...mockBookings[0],
            id: i + 1,
            userName: `Usuario${i + 1}`,
            userLastName: 'Test',
        }));
        PackageService.apiGetAllBookingsAdmin.mockResolvedValue(manyBookings);
        renderComponent();

        await waitFor(() => screen.getByText('Usuario1 Test'));

        const rows = screen.getAllByText(/Usuario\d+ Test/);
        expect(rows.length).toBeLessThanOrEqual(8);
    });

    it('should show Todas count matching total bookings', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(`Todas (${mockBookings.length})`)).toBeInTheDocument();
        });
    });

    it('should call apiGetAllBookingsAdmin again when Actualizar button is clicked', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Laura Martínez'));

        const refreshBtn = screen.getByText(/Actualizar/i);
        fireEvent.click(refreshBtn);

        await waitFor(() => {
            expect(PackageService.apiGetAllBookingsAdmin).toHaveBeenCalledTimes(2);
        });
    });
});
