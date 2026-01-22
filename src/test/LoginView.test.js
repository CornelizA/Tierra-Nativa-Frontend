import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginView } from '../component/LoginView';
import { BrowserRouter as Router } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../service/PackageTravelService', () => ({
    apiLogin: jest.fn(),
    fireAlert: jest.fn(),
}));

describe('LoginView Component', () => {
    const mockOnAuthSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render login form fields correctly', () => {
        render(
            <Router>
                <LoginView onAuthSuccess={mockOnAuthSuccess} />
            </Router>
        );

        expect(screen.getByPlaceholderText(/tu.correo@ejemplo.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeDisabled();
    });

    it('should enable the button only when form is valid', () => {
        render(
            <Router>
                <LoginView onAuthSuccess={mockOnAuthSuccess} />
            </Router>
        );

        const emailInput = screen.getByPlaceholderText(/tu.correo@ejemplo.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

        fireEvent.change(emailInput, { target: { value: 'test@mail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(submitBtn).not.toBeDisabled();
    });

    it('should call apiLogin and onAuthSuccess on successful login', async () => {
        const mockUserData = { email: 'test@mail.com', token: 'fake-jwt', role: 'USER' };
        PackageService.apiLogin.mockResolvedValue(mockUserData);

        render(
            <Router>
                <LoginView onAuthSuccess={mockOnAuthSuccess} />
            </Router>
        );

        fireEvent.change(screen.getByPlaceholderText(/tu.correo@ejemplo.com/i), { target: { value: 'test@mail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: '123456' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(PackageService.apiLogin).toHaveBeenCalledWith({
                email: 'test@mail.com',
                password: '123456'
            });
            expect(mockOnAuthSuccess).toHaveBeenCalledWith(mockUserData);
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    it('should show specialized error alert on 401/403 credentials error', async () => {
        const errorResponse = {
            response: { status: 401 }
        };
        PackageService.apiLogin.mockRejectedValue(errorResponse);

        render(
            <Router>
                <LoginView onAuthSuccess={mockOnAuthSuccess} />
            </Router>
        );

        fireEvent.change(screen.getByPlaceholderText(/tu.correo@ejemplo.com/i), { target: { value: 'wrong@mail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(PackageService.fireAlert).toHaveBeenCalledWith(
                'Credenciales Inválidas',
                expect.stringContaining('correo o la contraseña son incorrectos')
            );
        });
    });

    it('should change button text to "Cargando..." while waiting for API', async () => {
        PackageService.apiLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(
            <Router>
                <LoginView onAuthSuccess={mockOnAuthSuccess} />
            </Router>
        );

        fireEvent.change(screen.getByPlaceholderText(/tu.correo@ejemplo.com/i), { target: { value: 'test@mail.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should navigate to register page when link is clicked', () => {
        render(
            <Router>
                <LoginView onAuthSuccess={mockOnAuthSuccess} />
            </Router>
        );

        const registerLink = screen.getByText(/Regístrate aquí/i);
        fireEvent.click(registerLink);

        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});