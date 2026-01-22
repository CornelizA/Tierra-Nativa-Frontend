import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VerifyEmailView } from '../component/VerifyEmailView';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiVerifyEmail: jest.fn(),
    apiResendVerificationEmail: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderWithRouter = (initialEntries = ['/verify-email'], state = {}) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/verify-email" element={<VerifyEmailView />} />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('VerifyEmailView Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should display the email passed via location state', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/verify-email', state: { email: 'test@user.com' } }]}>
                <VerifyEmailView />
            </MemoryRouter>
        );
        expect(screen.getByText('test@user.com')).toBeInTheDocument();
    });

    it('should call apiVerifyEmail automatically if token is present in URL', async () => {
        PackageService.apiVerifyEmail.mockResolvedValue({});
        
        renderWithRouter(['/verify-email?token=valid-token-123']);

        await waitFor(() => {
            expect(PackageService.apiVerifyEmail).toHaveBeenCalledWith('valid-token-123');
            expect(screen.getByText(/¡Correo verificado con éxito!/i)).toBeInTheDocument();
        });

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should show error message if token verification fails', async () => {
        PackageService.apiVerifyEmail.mockRejectedValue(new Error('Invalid token'));
        
        renderWithRouter(['/verify-email?token=expired-token']);

        await waitFor(() => {
            expect(screen.getByText(/El enlace de verificación es inválido o ha expirado/i)).toBeInTheDocument();
        });
    });

    it('should handle manual resend email successfully', async () => {
        PackageService.apiResendVerificationEmail.mockResolvedValue({});
        renderWithRouter();

        const emailInput = screen.getByPlaceholderText(/tu.correo@ejemplo.com/i);
        const resendBtn = screen.getByRole('button', { name: /Reenviar Correo/i });

        fireEvent.change(emailInput, { target: { value: 'new@mail.com' } });
        fireEvent.click(resendBtn);

        expect(screen.getByText('Reenviando...')).toBeInTheDocument();

        await waitFor(() => {
            expect(PackageService.apiResendVerificationEmail).toHaveBeenCalledWith('new@mail.com');
            expect(screen.getByText(/Correo reenviado. Revisa tu bandeja de entrada/i)).toBeInTheDocument();
        });
    });

    it('should navigate back to login when clicking "Volver al Login"', () => {
        renderWithRouter();
        const backBtn = screen.getByRole('button', { name: /Volver al Login/i });
        fireEvent.click(backBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});