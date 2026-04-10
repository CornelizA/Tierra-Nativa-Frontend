import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BookingPage } from '../pages/BookingPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PackageTravelContext } from '../context/PackageTravelContext';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.setTimeout(20000);

jest.mock('../service/PackageTravelService', () => ({
    apiGetPackageById: jest.fn(),
    apiPostBooking: jest.fn(),
    apiGetAvailableCapacity: jest.fn(),
    fireAlert: jest.fn(),
}));

jest.mock('../helpers/FormatCurrency', () => ({
    formatCurrency: (amount) => `$${amount}`,
}));

jest.mock('lucide-react', () => {
    const icon = (name) => () => <div data-testid={`icon-${name}`} />;
    return {
        CalendarIcon: icon('calendar'),
        MapPin: icon('mappin'),
        Clock: icon('clock'),
        AlertCircle: icon('alert'),
        ArrowLeft: icon('arrow-left'),
        UserIcon: icon('user'),
        ShieldAlert: icon('shield'),
        MessageSquare: icon('message'),
        Plane: icon('plane'),
        Mail: icon('mail'),
        Users: icon('users'),
        MinusCircle: icon('minus'),
        PlusCircle: icon('plus'),
    };
});

const mockPackage = {
    id: 5,
    name: 'Aventura en Bariloche',
    destination: 'Bariloche',
    basePrice: 500,
    numberOfDays: 5,
    capacity: 20,
    imageDetails: [{ url: 'http://img.com/bari.jpg', principal: true }],
    availabilityBlocks: [],
};

const mockContextValue = {
    packageTravel: [mockPackage],
    favoriteIds: new Set(),
    updateFavoriteInContext: jest.fn(),
};

const storageMock = (token = 'valid-token', user = { firstName: 'Ana', lastName: 'García', email: 'ana@test.com' }) => {
    const storage = {
        jwtToken: token,
        user: JSON.stringify(user),
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

const renderBookingPage = (packageId = '5', start = '2026-05-01', end = '2026-05-06') => {
    return render(
        <MemoryRouter initialEntries={[`/booking/${packageId}?start=${start}&end=${end}`]}>
            <PackageTravelContext.Provider value={mockContextValue}>
                <Routes>
                    <Route path="/booking/:id" element={<BookingPage />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/home" element={<div>Home Page</div>} />
                    <Route path="/detallePaquete/:id" element={<div>Package Detail</div>} />
                </Routes>
            </PackageTravelContext.Provider>
        </MemoryRouter>
    );
};

describe('BookingPage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        storageMock();
        PackageService.apiGetPackageById.mockResolvedValue(mockPackage);
        PackageService.apiGetAvailableCapacity.mockResolvedValue({ availableSpots: 10 });
    });

    afterEach(cleanup);

    it('should redirect to login if no token', async () => {
        storageMock(null, null);
        renderBookingPage();
        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });

    it('should display package name and destination after loading', async () => {
        renderBookingPage();
        await waitFor(() => {
            expect(screen.getByText('Aventura en Bariloche')).toBeInTheDocument();
            expect(screen.getByText('Bariloche')).toBeInTheDocument();
        });
    });

    it('should display user data from sessionStorage in read-only fields', async () => {
        renderBookingPage();
        await waitFor(() => {
            expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
            expect(screen.getByDisplayValue('García')).toBeInTheDocument();
            expect(screen.getByDisplayValue('ana@test.com')).toBeInTheDocument();
        });
    });

    const getSubmitBtn = () =>
        screen.getByRole('button', { name: 'Confirmar Reserva' });

    it('should have the confirm button disabled when terms are not accepted', async () => {
        renderBookingPage();
        const phoneInput = await screen.findByPlaceholderText(/\+54/i);
        fireEvent.change(phoneInput, { target: { value: '+54 9 11 1234-5678' } });

        expect(getSubmitBtn()).toBeDisabled();
    });

    it('should have the confirm button disabled when phone is empty', async () => {
        renderBookingPage();
        const checkbox = await screen.findByRole('checkbox');
        fireEvent.click(checkbox);

        expect(getSubmitBtn()).toBeDisabled();
    });

    it('should enable confirm button when terms accepted and phone filled', async () => {
        renderBookingPage();

        const phoneInput = await screen.findByPlaceholderText(/\+54/i);
        fireEvent.change(phoneInput, { target: { value: '+54 9 11 1234-5678' } });

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(getSubmitBtn()).not.toBeDisabled();
    });

    it('should show sold-out warning and disable button when availableSpots is 0', async () => {
        PackageService.apiGetAvailableCapacity.mockResolvedValue({ availableSpots: 0 });
        renderBookingPage();

        await waitFor(() => {
            expect(screen.getByText(/No hay cupos disponibles/i)).toBeInTheDocument();
        });

        expect(getSubmitBtn()).toBeDisabled();
    });

    it('should update total price when traveler count changes', async () => {
        renderBookingPage();

        await waitFor(() => {
            expect(screen.getByText('Total estimado')).toBeInTheDocument();
        });

        const plusButtons = screen.getAllByRole('button').filter(b =>
            b.querySelector('[data-testid="icon-plus"]')
        );
        expect(plusButtons.length).toBeGreaterThan(0);
        fireEvent.click(plusButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('$1000')).toBeInTheDocument();
        });
    });

    it('should call apiPostBooking with correct data on submit', async () => {
        PackageService.apiPostBooking.mockResolvedValue({ id: 99 });
        renderBookingPage();

        const phoneInput = await screen.findByPlaceholderText(/\+54/i);
        fireEvent.change(phoneInput, { target: { value: '+54 9 11 9999-8888' } });

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        const submitBtn = screen.getByRole('button', { name: 'Confirmar Reserva' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(PackageService.apiPostBooking).toHaveBeenCalledWith(
                expect.objectContaining({
                    packageId: 5,
                    startDate: '2026-05-01',
                    endDate: '2026-05-06',
                    phoneNumber: '+54 9 11 9999-8888',
                    travelerCount: 1,
                })
            );
        });
    });

    it('should show success screen after successful booking', async () => {
        PackageService.apiPostBooking.mockResolvedValue({ id: 99 });
        renderBookingPage();

        const phoneInput = await screen.findByPlaceholderText(/\+54/i);
        fireEvent.change(phoneInput, { target: { value: '+54 9 11 9999-8888' } });

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        const submitBtn = screen.getByRole('button', { name: 'Confirmar Reserva' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('¡Reserva Confirmada!')).toBeInTheDocument();
        });
    });

    it('should show error banner when booking fails', async () => {
        PackageService.apiPostBooking.mockRejectedValue({
            response: { data: { error: 'No hay cupos suficientes.' } }
        });
        renderBookingPage();

        const phoneInput = await screen.findByPlaceholderText(/\+54/i);
        fireEvent.change(phoneInput, { target: { value: '+54 9 11 9999-8888' } });

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        const submitBtn = screen.getByRole('button', { name: 'Confirmar Reserva' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('No hay cupos suficientes.')).toBeInTheDocument();
        });
    });

    it('should redirect to /detallePaquete if startDate or endDate is missing', async () => {
        render(
            <MemoryRouter initialEntries={['/booking/5']}>
                <PackageTravelContext.Provider value={mockContextValue}>
                    <Routes>
                        <Route path="/booking/:id" element={<BookingPage />} />
                        <Route path="/detallePaquete/:id" element={<div>Package Detail</div>} />
                    </Routes>
                </PackageTravelContext.Provider>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText('Package Detail')).toBeInTheDocument();
        });
    });
});
