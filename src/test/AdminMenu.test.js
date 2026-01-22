import { render, screen, fireEvent, act } from '@testing-library/react';
import { AdminMenu } from '../component/AdminMenu';

global.alert = jest.fn();

describe('AdminMenu Navigation and Authorization', () => {
    const mockOnViewChange = jest.fn();

    const setWindowWidth = (width) => {
        global.innerWidth = width;
        fireEvent(window, new Event('resize'));
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setWindowWidth(1024);
        
        const adminUser = JSON.stringify({ email: 'tierranativa.dev@gmail.com', role: 'ADMIN' });
        Storage.prototype.getItem = jest.fn(() => adminUser);
    });

    it('should render all menu items including new ones (Users, Categories, Characteristics)', async () => {
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


    it('should show Access Denied if user role is not ADMIN', async () => {
  
        const normalUser = JSON.stringify({ email: 'user@test.com', role: 'USER' });
        Storage.prototype.getItem = jest.fn(() => normalUser);

        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });

        expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
        expect(screen.queryByText('Menú de Administrador')).not.toBeInTheDocument();
    });

    it('should redirect to login if no user is found in sessionStorage', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        Storage.prototype.getItem = jest.fn(() => null);

        await act(async () => {
            render(<AdminMenu onViewChange={mockOnViewChange} />);
        });

        expect(logSpy).toHaveBeenCalledWith("No hay usuario en sessionStorage, redirigiendo...");
        logSpy.mockRestore();
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
        expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
    });
});