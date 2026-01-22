import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminUserList } from '../component/AdminUserList';
import * as PackageService from '../service/PackageTravelService';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetAdminUsers: jest.fn(),
    apiUpdateUserRole: jest.fn(),
    apiHandleErrorAlert: jest.fn(),
    fireAlert: jest.fn(),
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

const mockUsers = [
    { id: 1, firstName: 'Admin', lastName: 'Tierra', email: 'admin@tierranativa.com', role: 'ADMIN' },
    { id: 2, firstName: 'Juan', lastName: 'Perez', email: 'juan@test.com', role: 'USER' },
    { id: 3, firstName: 'Marta', lastName: 'Gomez', email: 'marta@test.com', role: 'ADMIN' },
];

const renderComponent = (props = {}) => {
    return render(<AdminUserList onBackToMenu={jest.fn()} onLogout={jest.fn()} {...props} />);
};

describe('AdminUserList Security and Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        global.Swal = Swal;
        window.confirm = jest.fn(() => true);
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'jwtToken') return 'valid-token';
            if (key === 'user') return JSON.stringify({ email: 'admin@tierranativa.com', role: 'ADMIN' });
            return null;
        });
        PackageService.apiGetAdminUsers.mockResolvedValue(mockUsers);
        PackageService.fireAlert.mockResolvedValue({ isConfirmed: true });
    });

    afterAll(() => {
        delete global.Swal;
    });

    it('should load and display user list for Superuser', async () => {
        renderComponent();

        expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('juan@test.com')).toBeInTheDocument();
            expect(screen.getByText('Acceso Total (SUPERUSUARIO)')).toBeInTheDocument();
        });
    });

    it('should filter users when typing in search bar', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i);
        fireEvent.change(searchInput, { target: { value: 'Marta' } });

        expect(screen.getByText('Marta Gomez')).toBeInTheDocument();
        expect(screen.queryByText('Juan Perez')).not.toBeInTheDocument();
    });

    it('should allow Superuser to change a USER to ADMIN', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument());

        const adminButtons = screen.getAllByRole('button', { name: /Hacer Admin/i });
        fireEvent.click(adminButtons[0]);

        expect(PackageService.fireAlert).toHaveBeenCalledWith(
            'Confirmar cambio de rol',
            expect.stringContaining('Juan'),
            'warning',
            true
        );

        await waitFor(() => {
            expect(PackageService.apiUpdateUserRole).toHaveBeenCalledWith('juan@test.com', 'ADMIN');
        });
    });

    it('should prevent Superuser from self-revoking ADMIN role', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('admin@tierranativa.com')).toBeInTheDocument());

        const revokeButtons = screen.getAllByRole('button', { name: /Revocar Admin/i });
        fireEvent.click(revokeButtons[0]);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                'Permiso Restringido',
                expect.stringContaining('no puede auto-revocarse'),
                'warning'
            );
        });
        expect(PackageService.apiUpdateUserRole).not.toHaveBeenCalled();
    });

    it('should show "Permiso de lectura" and hide action buttons for normal ADMIN', async () => {
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'user') return JSON.stringify({ email: 'otro@admin.com', role: 'ADMIN' });
            if (key === 'jwtToken') return 'token';
            return null;
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Solo Lectura (ADMIN)')).toBeInTheDocument();
            expect(screen.getAllByText(/Permiso de lectura/i)).toHaveLength(3);
        });

        expect(screen.queryByRole('button', { name: /Hacer Admin/i })).not.toBeInTheDocument();
    });

    it('should call onLogout if API returns 403 (Token expired/Invalid)', async () => {
        const mockLogout = jest.fn();
        PackageService.apiGetAdminUsers.mockRejectedValue({
            response: { status: 403 }
        });

        renderComponent({ onLogout: mockLogout });

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
            expect(screen.getByText(/Cerrando sesión de administrador/i)).toBeInTheDocument();
        });
    });
});