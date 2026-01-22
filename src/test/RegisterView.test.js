import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterView } from '../component/RegisterView';
import { BrowserRouter as Router } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../service/PackageTravelService', () => ({
    apiRegister: jest.fn(),
    fireAlert: jest.fn(),
}));

const renderComponent = () => {
    return render(
        <Router>
            <RegisterView />
        </Router>
    );
};

describe('RegisterView Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show password validation requirements in red initially', () => {
        renderComponent();
        expect(screen.getByText(/Mínimo 8 caracteres/i)).toBeInTheDocument();
        
        const registerBtn = screen.getByRole('button', { name: /Registrarme/i });
        expect(registerBtn).toBeDisabled();
    });

    it('should enable the register button only when password meets all regex requirements', () => {
        renderComponent();
        const passwordInput = screen.getByPlaceholderText(/Mínimo 8 caracteres/i);
        const registerBtn = screen.getByRole('button', { name: /Registrarme/i });

        fireEvent.change(passwordInput, { target: { value: 'pass' } });
        expect(registerBtn).toBeDisabled();

        fireEvent.change(passwordInput, { target: { value: 'TierraNativa2026@' } });
        expect(registerBtn).not.toBeDisabled();
    });

    it('should correctly split fullName into firstName and lastName for the API', async () => {
        PackageService.apiRegister.mockResolvedValue({});
        renderComponent();

        fireEvent.change(screen.getByPlaceholderText(/Nombre Apellido/i), { target: { value: 'Juan Manuel Perez' } });
        fireEvent.change(screen.getByPlaceholderText(/tu.correo@ejemplo.com/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), { target: { value: 'Admin123#' } });

        const registerBtn = screen.getByRole('button', { name: /Registrarme/i });
        fireEvent.click(registerBtn);

        await waitFor(() => {
            expect(PackageService.apiRegister).toHaveBeenCalledWith({
                firstName: 'Juan',
                lastName: 'Manuel Perez', 
                email: 'juan@test.com',
                password: 'Admin123#'
            });
            expect(mockNavigate).toHaveBeenCalledWith('/verify-email', expect.any(Object));
        });
    });

    it('should show specialized error alert if email already exists (403)', async () => {
        PackageService.apiRegister.mockRejectedValue({
            response: { status: 403 }
        });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText(/Nombre Apellido/i), { target: { value: 'Juan Perez' } });
        fireEvent.change(screen.getByPlaceholderText(/tu.correo@ejemplo.com/i), { target: { value: 'existente@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), { target: { value: 'Valid123#' } });

        const registerBtn = screen.getByRole('button', { name: /Registrarme/i });
        fireEvent.click(registerBtn);

        await waitFor(() => {
            expect(PackageService.fireAlert).toHaveBeenCalledWith(
                'Cuenta Existente',
                expect.stringContaining('Ya existe una cuenta con este correo')
            );
        });
    });

    it('should redirect to login when clicking "Inicia Sesión"', () => {
        renderComponent();
        fireEvent.click(screen.getByText(/Inicia Sesión/i));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});