import { render, screen, fireEvent } from '@testing-library/react';
import { AdminMenu } from '../component/AdminMenu';

global.alert = jest.fn();

describe('AdminMenu Navigation and Responsiveness', () => {
    const mockOnViewChange = jest.fn();

    const setWindowWidth = (width) => {
        global.innerWidth = width;
        fireEvent(window, new Event('resize'));
    };

    beforeEach(() => {
        mockOnViewChange.mockClear();
        global.alert.mockClear();
        setWindowWidth(1024);
    });

    it('should render main menu in desktop mode', () => {
        render(<AdminMenu onViewChange={mockOnViewChange} />);

        expect(screen.getByText('Menú de Administrador')).toBeInTheDocument();
        expect(screen.getByText('Gestionar Paquetes')).toBeInTheDocument();
        expect(screen.getByText('Crear Nuevo Paquete')).toBeInTheDocument();
        expect(screen.queryByText('Acceso Restringido')).not.toBeInTheDocument();
    });

    it('should apply WIP style to "Configuración General" item and show alert on click', () => {
        render(<AdminMenu onViewChange={mockOnViewChange} />);
        const settingsButton = screen.getByRole('button', { name: /Configuración General/i });
        expect(settingsButton).toHaveClass('wip');
        expect(settingsButton).not.toBeDisabled();
        fireEvent.click(settingsButton);
        expect(global.alert).toHaveBeenCalledWith('Configuración General en desarrollo.');
    });

    it('should call onViewChange("LIST") when clicking "Gestionar Paquetes"', () => {
        render(<AdminMenu onViewChange={mockOnViewChange} />);

        fireEvent.click(screen.getByText('Gestionar Paquetes'));

        expect(mockOnViewChange).toHaveBeenCalledWith('LIST');
    });

    it('should call onViewChange("CREATE_FORM") when clicking "Crear Nuevo Paquete"', () => {
        render(<AdminMenu onViewChange={mockOnViewChange} />);

        fireEvent.click(screen.getByText('Crear Nuevo Paquete'));

        expect(mockOnViewChange).toHaveBeenCalledWith('CREATE_FORM');
    });

    it('should show "Acceso Restringido" card on start if mobile', () => {
        setWindowWidth(500);

        const { rerender } = render(<AdminMenu onViewChange={mockOnViewChange} />);

        expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
        expect(screen.queryByText('Gestionar Paquetes')).not.toBeInTheDocument();
    });

    it('should deny navigation and show restriction if in mobile mode', () => {
        setWindowWidth(500);
        render(<AdminMenu onViewChange={mockOnViewChange} />);

        const restrictedMessage = screen.getByText('Acceso Restringido');
        expect(restrictedMessage).toBeInTheDocument();
        expect(mockOnViewChange).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText('Aceptar'));

        expect(screen.queryByText('Acceso Restringido')).not.toBeInTheDocument();

        const managePackagesButton = screen.getByRole('button', { name: /Gestionar Paquetes/i });
        fireEvent.click(managePackagesButton);

        expect(mockOnViewChange).not.toHaveBeenCalled();
        expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
    });
});