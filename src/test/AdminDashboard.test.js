import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '../component/AdminDashboard';

jest.mock('../component/AdminMenu', () => ({
    AdminMenu: ({ onViewChange }) => (
        <div data-testid="admin-menu">
            <button onClick={() => onViewChange('LIST')}>Gestionar Paquetes</button>
            <button onClick={() => onViewChange('CREATE_FORM')}>Crear Nuevo Paquete</button>
            <button onClick={() => onViewChange('LIST_USERS')}>Gestionar Usuarios</button>
            <button onClick={() => onViewChange('LIST_CATEGORY')}>Gestionar Categorías</button>
            <button onClick={() => onViewChange('LIST_CHARACTERISTICS')}>Gestionar Características</button>
        </div>
    ),
}));

jest.mock('../component/AdminPackageList', () => ({
    AdminPackageList: ({ onBackToMenu }) => (
        <div data-testid="admin-list">
            <p>Lista de Paquetes</p>
            <button onClick={onBackToMenu}>Volver al Menú</button>
        </div>
    ),
}));

jest.mock('../component/AdminPackageForm', () => ({
    AdminPackageForm: ({ onActionComplete }) => (
        <div data-testid="admin-form">
            <p>Formulario</p>
            <button onClick={onActionComplete}>Completar</button>
        </div>
    ),
    initialFormData: {},
}));

jest.mock('../component/AdminUserList', () => ({
    AdminUserList: ({ onBackToMenu }) => (
        <div data-testid="admin-users">
            <p>Panel de Usuarios</p>
            <button onClick={onBackToMenu}>Volver al Menú</button>
        </div>
    ),
}));

jest.mock('../component/AdminCategory', () => ({
    AdminCategory: ({ onBackToMenu }) => (
        <div data-testid="admin-categories">
            <p>Panel de Categorías</p>
            <button onClick={onBackToMenu}>Volver al Menú</button>
        </div>
    ),
}));

jest.mock('../component/AdminCharacteristic', () => ({
    AdminCharacteristic: ({ onBackToMenu }) => (
        <div data-testid="admin-characteristics">
            <p>Panel de Características</p>
            <button onClick={onBackToMenu}>Volver al Menú</button>
        </div>
    ),
}));


describe('AdminDashboard Navigation and State', () => {

    it('should render AdminMenu by default', () => {
        render(<AdminDashboard />);
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
    });

    it('should change to AdminUserList when selecting "Gestionar Usuarios"', () => {
        render(<AdminDashboard />);
        fireEvent.click(screen.getByText('Gestionar Usuarios'));
        expect(screen.getByTestId('admin-users')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-menu')).not.toBeInTheDocument();
    });

    it('should change to AdminCategory when selecting "Gestionar Categorías"', () => {
        render(<AdminDashboard />);
        fireEvent.click(screen.getByText('Gestionar Categorías'));
        expect(screen.getByTestId('admin-categories')).toBeInTheDocument();
    });

    it('should change to AdminCharacteristic when selecting "Gestionar Características"', () => {
        render(<AdminDashboard />);
        fireEvent.click(screen.getByText('Gestionar Características'));
        expect(screen.getByTestId('admin-characteristics')).toBeInTheDocument();
    });

    it('should return to AdminMenu from AdminUserList', () => {
        render(<AdminDashboard />);
        fireEvent.click(screen.getByText('Gestionar Usuarios'));
        
        const backBtn = screen.getByText('Volver al Menú');
        fireEvent.click(backBtn);
        
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-users')).not.toBeInTheDocument();
    });

    it('should return to AdminPackageList from AdminPackageForm (onActionComplete)', () => {
        render(<AdminDashboard />);
        fireEvent.click(screen.getByText('Crear Nuevo Paquete'));
        
        fireEvent.click(screen.getByText('Completar'));
        expect(screen.getByTestId('admin-list')).toBeInTheDocument();
    });
});