import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BookingHistoryPage } from '../pages/BookingHistoryPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';

jest.setTimeout(20000);

jest.mock('../service/PackageTravelService', () => ({
    apiGetMyBooking: jest.fn(),
    apiCancelBooking: jest.fn(),
    fireAlert: jest.fn(),
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}));

jest.mock('lucide-react', () => {
    const icon = (name) => ({ size, color, style, ...rest }) => (
        <svg data-testid={`icon-${name}`} {...rest} />
    );
    return {
        CalendarIcon: icon('calendar'),
        MapPin: icon('mappin'),
        Star: icon('star'),
        CheckCircle: icon('check-circle'),
        ArrowUpDown: icon('arrowupdown'),
        XCircle: icon('xcircle'),
        ArrowLeft: icon('arrow-left'),
        ArrowRight: icon('arrow-right'),
    };
});

const mockBookingCancelable = {
    id: 1,
    packageId: 10,
    packageName: 'Glaciar Perito Moreno',
    startDate: '2027-06-01',
    endDate: '2027-06-05',
    status: 'CONFIRMED',
    reviewed: false,
    creationDate: '2026-01-15',
};

const mockBookingBlocked = {
    id: 2,
    packageId: 11,
    packageName: 'Cataratas del Iguazú',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'CONFIRMED',
    reviewed: false,
    creationDate: '2026-02-01',
};

const mockBookingFinishedNotReviewed = {
    id: 3,
    packageId: 12,
    packageName: 'Aventura en Bariloche',
    startDate: '2025-11-01',
    endDate: '2025-11-05',
    status: 'FINISHED',
    reviewed: false,
    creationDate: '2025-10-01',
};

const mockBookingFinishedReviewed = {
    id: 4,
    packageId: 13,
    packageName: 'Salta Colonial',
    startDate: '2025-09-01',
    endDate: '2025-09-04',
    status: 'FINISHED',
    reviewed: true,
    creationDate: '2025-08-01',
};

const mockBookingCancelled = {
    id: 5,
    packageId: 14,
    packageName: 'Mendoza y Vinos',
    startDate: '2025-08-01',
    endDate: '2025-08-03',
    status: 'CANCELLED',
    reviewed: false,
    creationDate: '2025-07-01',
};

const allMockBookings = [
    mockBookingCancelable,
    mockBookingBlocked,
    mockBookingFinishedNotReviewed,
    mockBookingFinishedReviewed,
    mockBookingCancelled,
];

const storageMock = (token = 'valid-token') => {
    const storage = {
        jwtToken: token,
        user: JSON.stringify({ firstName: 'Ana', lastName: 'García', email: 'ana@test.com' }),
    };
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

const renderComponent = () => {
    return render(
        <MemoryRouter initialEntries={['/my-bookings']}>
            <Routes>
                <Route path="/my-bookings" element={<BookingHistoryPage />} />
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/home" element={<div>Home Page</div>} />
                <Route path="/detallePaquete/:id" element={<div>Package Detail</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('BookingHistoryPage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        storageMock();
        PackageService.apiGetMyBooking.mockResolvedValue(allMockBookings);
    });

    afterEach(cleanup);

    it('should redirect to login if no token', async () => {
        storageMock(null);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });

    it('should show loading spinner initially', () => {
        PackageService.apiGetMyBooking.mockImplementation(() => new Promise(() => {}));
        renderComponent();
        expect(document.querySelector('.spinner-border')).toBeInTheDocument();
    });

    it('should render booking list title after loading', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Mis Reservas')).toBeInTheDocument();
        });
    });

    it('should show empty state if no bookings', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([]);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Aún no tienes reservas/i)).toBeInTheDocument();
        });
    });

    it('should display all booking package names', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Glaciar Perito Moreno')).toBeInTheDocument();
            expect(screen.getByText('Cataratas del Iguazú')).toBeInTheDocument();
            expect(screen.getByText('Aventura en Bariloche')).toBeInTheDocument();
        });
    });

    it('should show Cancelar button for CONFIRMED booking with >15 days to travel', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingCancelable]);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByTitle('Cancelar reserva')).toBeInTheDocument();
        });
    });

    it('should show Cancelar button (disabled style) for CONFIRMED booking within 15 days', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingBlocked]);
        renderComponent();
        await waitFor(() => {
            const cancelBtn = screen.getByTitle(/La cancelación no está disponible/i);
            expect(cancelBtn).toBeInTheDocument();
            expect(cancelBtn).toHaveClass('history-btn-cancel--disabled');
        });
    });

    it('should call Swal with policy message when clicking blocked cancel button', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingBlocked]);
        renderComponent();

        const cancelBtn = await screen.findByTitle(/La cancelación no está disponible/i);
        fireEvent.click(cancelBtn);

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'No es posible cancelar esta reserva',
                icon: 'warning',
            })
        );
    });

    it('should call apiCancelBooking and update status when cancel is confirmed', async () => {
        PackageService.fireAlert.mockResolvedValue({ isConfirmed: true });
        PackageService.apiCancelBooking.mockResolvedValue({});
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingCancelable]);
        renderComponent();

        const cancelBtn = await screen.findByTitle('Cancelar reserva');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(PackageService.apiCancelBooking).toHaveBeenCalledWith(mockBookingCancelable.id);
        });

        await waitFor(() => {
            expect(PackageService.fireAlert).toHaveBeenCalledWith(
                'Reserva cancelada',
                expect.stringContaining('correo electrónico'),
                'success'
            );
        });
    });

    it('should NOT call apiCancelBooking if user cancels the confirmation dialog', async () => {
        PackageService.fireAlert.mockResolvedValue({ isConfirmed: false });
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingCancelable]);
        renderComponent();

        const cancelBtn = await screen.findByTitle('Cancelar reserva');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(PackageService.apiCancelBooking).not.toHaveBeenCalled();
        });
    });

    it('should show "Calificar ahora" button for FINISHED booking not yet reviewed', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingFinishedNotReviewed]);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Calificar ahora/i)).toBeInTheDocument();
        });
    });

    it('should show "Reserva calificada" badge for FINISHED reviewed booking', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingFinishedReviewed]);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Reserva calificada/i)).toBeInTheDocument();
        });
    });

    it('should show correct status badge for each booking', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getAllByText('Confirmada').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Finalizada').length).toBeGreaterThan(0);
            expect(screen.getByText('Cancelada')).toBeInTheDocument();
        });
    });

    it('should filter bookings by CANCELLED status', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Mis Reservas'));

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'CANCELLED' } });

        await waitFor(() => {
            expect(screen.getByText('Mendoza y Vinos')).toBeInTheDocument();
            expect(screen.queryByText('Glaciar Perito Moreno')).not.toBeInTheDocument();
        });
    });

    it('should filter bookings by FINISHED status', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Mis Reservas'));

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'FINISHED' } });

        await waitFor(() => {
            expect(screen.getByText('Aventura en Bariloche')).toBeInTheDocument();
            expect(screen.queryByText('Mendoza y Vinos')).not.toBeInTheDocument();
        });
    });

    it('should sort bookings by startDate when sort button is clicked', async () => {
        const bookings = [
            { ...mockBookingCancelable, id: 1, packageName: 'Paquete A', startDate: '2027-01-01' },
            { ...mockBookingCancelable, id: 2, packageName: 'Paquete B', startDate: '2027-06-01' },
        ];
        PackageService.apiGetMyBooking.mockResolvedValue(bookings);
        renderComponent();

        await waitFor(() => screen.getByText('Paquete A'));

        const sortBtn = screen.getByRole('button', { name: /recientes/i });
        fireEvent.click(sortBtn);
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /antiguas/i })).toBeInTheDocument();
        });
    });

    it('should show pagination when there are more than 10 bookings', async () => {
        const manyBookings = Array.from({ length: 12 }, (_, i) => ({
            ...mockBookingCancelled,
            id: i + 1,
            packageName: `Paquete ${i + 1}`,
        }));
        PackageService.apiGetMyBooking.mockResolvedValue(manyBookings);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Siguiente')).toBeInTheDocument();
            expect(screen.getByText('Anterior')).toBeInTheDocument();
        });
    });

    it('should show at most 10 bookings per page', async () => {
        const manyBookings = Array.from({ length: 15 }, (_, i) => ({
            ...mockBookingCancelled,
            id: i + 1,
            packageName: `Paquete ${i + 1}`,
        }));
        PackageService.apiGetMyBooking.mockResolvedValue(manyBookings);
        renderComponent();

        await waitFor(() => screen.getByText('Paquete 1'));

        const names = screen.getAllByText(/^Paquete \d+$/);
        expect(names.length).toBeLessThanOrEqual(10);
    });

    it('should navigate to /home when "Volver al inicio" is clicked', async () => {
        renderComponent();
        await waitFor(() => screen.getByText('Mis Reservas'));

        const backBtn = screen.getByText(/Volver al inicio/i);
        fireEvent.click(backBtn);

        await waitFor(() => {
            expect(screen.getByText('Home Page')).toBeInTheDocument();
        });
    });

    it('should show "Reservado el" with creation date if creationDate is available', async () => {
        PackageService.apiGetMyBooking.mockResolvedValue([mockBookingCancelable]);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Reservado el/i)).toBeInTheDocument();
        });
    });
});
