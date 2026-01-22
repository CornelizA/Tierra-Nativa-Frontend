import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminCharacteristic } from '../component/AdminCharacteristic';
import * as PackageService from '../service/PackageTravelService';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetCharacteristics: jest.fn(),
    apiPostCharacteristic: jest.fn(),
    apiUpdateCharacteristic: jest.fn(),
    apiDeleteCharacteristic: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockCharacteristics = [
    { id: 1, title: 'Wifi Gratis', icon: 'wifi' },
    { id: 2, title: 'Desayuno', icon: 'utensils' },
];

describe('AdminCharacteristic Component', () => {
    const mockOnBackToMenu = jest.fn();
    const originalOnClose = global.onclose;

    beforeEach(() => {
        jest.clearAllMocks();
        global.onclose = jest.fn();

        const sessionStore = { 'jwtToken': 'fake-jwt-token' };
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn((key) => sessionStore[key] || null),
            },
            writable: true
        });

        PackageService.apiGetCharacteristics.mockResolvedValue(mockCharacteristics);
        PackageService.fireAlert.mockResolvedValue({ isConfirmed: true });
    });

    afterAll(() => {
        global.onclose = originalOnClose;
    });

    const setup = () => render(
        <Router>
            <AdminCharacteristic onBackToMenu={mockOnBackToMenu} />
        </Router>
    );

    it('should load and display characteristics list', async () => {
        setup();
        expect(await screen.findByText('Wifi Gratis')).toBeInTheDocument();
        expect(screen.getByText('Desayuno')).toBeInTheDocument();
    });

    it('should auto-assign icon based on title typing (WIP Logic)', async () => {
        setup();

        await screen.findByText('Wifi Gratis');

        const newBtn = screen.getByText(/Nueva Característica/i);
        fireEvent.click(newBtn);

        const titleInput = await screen.findByPlaceholderText('Ej: WiFi Gratis');

        fireEvent.change(titleInput, { target: { value: 'Hotel' } });

        await waitFor(() => {
            expect(screen.getByText('hotel')).toBeInTheDocument();
        });
    });

    it('should allow manual icon selection and disable auto-assignment', async () => {
        setup();
        await screen.findByText('Wifi Gratis');
        fireEvent.click(screen.getByText(/Nueva Característica/i));

        const toggleBtn = await screen.findByText('ASIGNACIÓN AUTOMÁTICA');
        fireEvent.click(toggleBtn);

        const titleInput = await screen.findByPlaceholderText('Ej: WiFi Gratis');
        fireEvent.change(titleInput, { target: { value: 'Wifi' } });
        expect(screen.getByText('star')).toBeInTheDocument();
    });

    it('should call apiPostCharacteristic with formatted title (Capitalized)', async () => {
        setup();
        await screen.findByText('Wifi Gratis');
        fireEvent.click(screen.getByText(/Nueva Característica/i));

        const titleInput = await screen.findByPlaceholderText('Ej: WiFi Gratis');
        fireEvent.change(titleInput, { target: { value: 'piscina climatizada' } });

        const saveBtn = screen.getByText('Guardar característica');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(PackageService.apiPostCharacteristic).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Piscina climatizada' })
            );
        });
    });

    it('should prevent deletion if no JWT token is present', async () => {
        window.sessionStorage.getItem.mockReturnValue(null);
        setup();

        const deleteBtns = await screen.findAllByText('Eliminar');
        expect(deleteBtns[0]).toBeDisabled();
    });

    it('should call apiDeleteCharacteristic after confirmation', async () => {
        setup();
        const deleteBtns = await screen.findAllByText('Eliminar');
        fireEvent.click(deleteBtns[0]);

        await waitFor(() => {
            expect(PackageService.apiDeleteCharacteristic).toHaveBeenCalledWith(1);
        });
    });
});
