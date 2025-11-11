import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../component/AdminDashboard';

jest.mock('../component/AdminMenu', () => ({
    AdminMenu: ({ onViewChange }) => (
        <div data-testid="admin-menu">
            <p>Menú Principal</p>
            <button onClick={() => onViewChange('LIST')}>Gestionar Paquetes</button>
            <button onClick={() => onViewChange('CREATE_FORM')}>Crear Nuevo Paquete</button>
        </div>
    ),
}));

jest.mock('../component/AdminPackageList', () => ({
    AdminPackageList: ({ onBackToMenu }) => {
        const mockHandleEdit = () => { };

        return (
            <div data-testid="admin-list">
                <p>Panel de Administración de Paquetes</p>
                <button onClick={onBackToMenu}>Volver al Menú Principal</button>
                <button onClick={mockHandleEdit}>Registrar Nuevo Paquete</button>
            </div>
        );
    },
}));

jest.mock('../component/AdminPackageForm', () => ({
    AdminPackageForm: ({ onActionComplete }) => (
        <div data-testid="admin-form">
            <p>Formulario de Paquete</p>
            <button onClick={onActionComplete}>Volver al Listado</button>
        </div>
    ),
    initialFormData: {},
}));


describe('AdminDashboard State Management', () => {

    it('should render AdminMenu ("MENU") by default', () => {
        render(<AdminDashboard />);
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-list')).not.toBeInTheDocument();
    });

    it('should change to AdminPackageList when selecting "Gestionar Paquetes"', () => {
        render(<AdminDashboard />);

        fireEvent.click(screen.getByText('Gestionar Paquetes'));
        expect(screen.getByTestId('admin-list')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-menu')).not.toBeInTheDocument();
        expect(screen.getByText('Panel de Administración de Paquetes')).toBeInTheDocument();
    });

    it('should change to AdminPackageForm when selecting "Crear Nuevo Paquete"', () => {
        render(<AdminDashboard />);

        fireEvent.click(screen.getByText('Crear Nuevo Paquete'));
        expect(screen.getByTestId('admin-form')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-menu')).not.toBeInTheDocument();
        expect(screen.getByText('Formulario de Paquete')).toBeInTheDocument();
    });

    it('should return to AdminMenu from AdminPackageList (onBackToMenu)', () => {
        render(<AdminDashboard />);

        fireEvent.click(screen.getByText('Gestionar Paquetes'));
        expect(screen.getByTestId('admin-list')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Volver al Menú Principal'));
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-list')).not.toBeInTheDocument();
    });

    it('should return to AdminPackageList from AdminPackageForm (onActionComplete)', () => {
        render(<AdminDashboard />);

        fireEvent.click(screen.getByText('Crear Nuevo Paquete'));
        expect(screen.getByTestId('admin-form')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Volver al Listado'));
        expect(screen.getByTestId('admin-list')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-form')).not.toBeInTheDocument();
    });
});