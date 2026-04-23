import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NavBarComponent } from '../component/NavBarComponent';
import '@testing-library/jest-dom';
import { PackageTravelContext } from '../context/PackageTravelContext';

jest.mock('sweetalert2', () => ({
    fire: jest.fn().mockResolvedValue({}),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const mockCategories = [
    { id: 1, title: 'Aventura' },
    { id: 2, title: 'Ecoturismo' }
];

const buildContext = (overrides = {}) => ({
    auth: { user: null, token: null, isAuthenticated: false },
    logout: jest.fn(),
    categories: mockCategories,
    ...overrides,
});

const renderWithRouter = (props = {}, contextOverrides = {}) => {
    return render(
        <Router>
            <PackageTravelContext.Provider value={buildContext(contextOverrides)}>
                <NavBarComponent {...props} />
            </PackageTravelContext.Provider>
        </Router>
    );
};

beforeEach(() => {
    mockNavigate.mockClear();
});

describe('NavBarComponent Evolution', () => {

    it('should show transparent logo when not scrolled', () => {
        const { container } = renderWithRouter({ isScrolled: false, shouldBeSolid: false });
        const nav = container.querySelector('.tn-navbar');
        expect(nav).toHaveClass('navbar-transparent');

        const logo = screen.getByAltText(/Logo de Tierra Nativa/i);
        expect(logo).toHaveAttribute('src', '/images/LOGO TIERRA NATIVA BLANCO.png');
    });

    it('should render categories from context correctly', () => {
        renderWithRouter({ isScrolled: true });

        expect(screen.getByText('Aventura')).toBeInTheDocument();
        expect(screen.getByText('Ecoturismo')).toBeInTheDocument();
        expect(screen.getByText('Aventura').closest('a')).toHaveAttribute('href', '/categories/categoria/aventura');
    });

    it('should show "Mi cuenta" dropdown when no user is logged in', () => {
        renderWithRouter({});

        expect(screen.getByRole('button', { name: /Mi cuenta/i })).toBeInTheDocument();
        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    });

    it('should render User Avatar with initials and Admin badge when user is ADMIN', () => {
        const adminUser = { firstName: 'Juan', lastName: 'Perez', role: 'ADMIN' };

        renderWithRouter({}, {
            auth: { user: adminUser, token: 'tok', isAuthenticated: true },
        });

        expect(screen.getByText('JP')).toBeInTheDocument();
        expect(screen.getByText('Juan')).toBeInTheDocument();

        const badge = screen.getByText('ADMIN');
        expect(badge).toHaveClass('bg-warning');
        expect(screen.getByText('Panel Admin')).toBeInTheDocument();
    });

    it('should call logout from context when clicking logout button', () => {
        const mockLogout = jest.fn();
        const user = { firstName: 'Juan', lastName: 'Lopez', role: 'USER' };

        renderWithRouter({}, {
            auth: { user, token: 'tok', isAuthenticated: true },
            logout: mockLogout,
        });

        fireEvent.click(screen.getByText('Cerrar Sesión'));

        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('should not show "Panel Admin" for regular USER role', () => {
        const regularUser = { firstName: 'Juan', lastName: 'Lopez', role: 'USER' };

        renderWithRouter({}, {
            auth: { user: regularUser, token: 'tok', isAuthenticated: true },
        });

        expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
    });
});
