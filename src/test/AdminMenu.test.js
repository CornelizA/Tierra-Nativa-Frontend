import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { AdminMenu } from '../component/AdminMenu';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    fireAlert: jest.fn(),
}));

jest.mock('lucide-react', () => ({
    Plane: () => <div data-testid="plane-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
    Users: () => <div data-testid="users-icon" />,
    Tags: () => <div data-testid="tags-icon" />,
    Settings2: () => <div data-testid="settings-icon" />,
    ShieldAlert: () => <div data-testid="shield-icon" />,
    Laptop: () => <div data-testid="laptop-icon" />,
    BookMarked: () => <div data-testid="bookmarked-icon" />,
}));

describe('AdminMenu Navigation and Authorization', () => {
    const mockOnViewChange = jest.fn();
    const setWindowWidth = (width) => {
        global.innerWidth = width;
        fireEvent(window, new Event('resize'));
    };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        setWindowWidth(1024);

        window.history.pushState({}, '', '/');
        global.fireAlert = PackageService.fireAlert;

        const storage = {};
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn((key) => storage[key] || null),
                setItem: jest.fn((key, val) => { storage[key] = val; }),
                removeItem: jest.fn((key) => { delete storage[key]; }),
                clear: jest.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
            },
            configurable: true,
            writable: true
        });
        const adminUser = JSON.stringify({
            email: 'tierranativa.dev@gmail.com',
            role: 'ADMIN'
        });
        window.sessionStorage.setItem('user', adminUser);
    });

    afterEach(() => {
        cleanup();
        jest.useRealTimers();
    });

    it('should render all menu items including new ones', async () => {
        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });
        expect(screen.getByText('Gestionar Paquetes')).toBeInTheDocument();
        expect(screen.getByText('Gestionar Permisos de Usuarios')).toBeInTheDocument();
        expect(screen.getByText('Gestionar Categorías')).toBeInTheDocument();
        expect(screen.getByText('Gestionar Características')).toBeInTheDocument();
    });

    it('should call onViewChange with "LIST_USERS" when clicking user management', async () => {
        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });

        fireEvent.click(screen.getByText('Gestionar Permisos de Usuarios'));
        expect(mockOnViewChange).toHaveBeenCalledWith('LIST_USERS');
    });

    it('should show Access Denied and redirect if user role is not ADMIN', async () => {
        const normalUser = JSON.stringify({ email: 'user@test.com', role: 'USER' });
        window.sessionStorage.setItem('user', normalUser);

        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });

        expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
        expect(PackageService.fireAlert).toHaveBeenCalledWith(
            'Acceso Denegado',
            'No tienes permisos de administrador para ver esta sección.',
            'error'
        );
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(PackageService.fireAlert).toHaveBeenCalledTimes(1);
    });

    it('should redirect to login if no user is found in sessionStorage', async () => {
        window.sessionStorage.removeItem('user');

        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });
        expect(screen.queryByText('Gestionar Paquetes')).not.toBeInTheDocument();
        expect(screen.queryByText('Acceso Denegado')).not.toBeInTheDocument();
    });

    it('should show mobile restriction and block navigation on small screens', async () => {
        setWindowWidth(500);

        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });

        expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Aceptar'));

        const packageBtn = screen.getByText('Gestionar Paquetes');
        fireEvent.click(packageBtn);

        expect(mockOnViewChange).not.toHaveBeenCalled();
    });
});