import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { AdminMenu } from '../component/AdminMenu';
import { SearchComponent } from '../component/SearchComponent';
import { PackageTravelContext } from '../context/PackageTravelContext';
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
    MapPin: () => <div data-testid="map-pin-icon" />,
    Calendar: () => <div data-testid="calendar-icon" />,
    ArrowRight: () => <div data-testid="arrow-right-icon" />,
    X: ({ onClick }) => <div data-testid="x-icon" onClick={onClick} />,
    ChevronLeft: () => <div data-testid="left-icon" />,
    ChevronRight: () => <div data-testid="right-icon" />,
    Search: () => <div data-testid="search-icon" />,
}));

const MOCK_PACKAGES_CONTEXT = [
    { id: 1, destination: 'Mendoza', name: 'Pack A' },
    { id: 2, destination: 'Mendoza', name: 'Pack B' },
    { id: 3, destination: 'Salta', name: 'Pack C' },
    { id: 4, destination: 'Buenos Aires', name: 'Pack D' },
];

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
            expect.any(String),
            'error'
        );
    });
});

describe('SearchComponent Logic and Interaction', () => {
    const mockOnFilter = jest.fn();
    const mockContextValue = { packageTravel: MOCK_PACKAGES_CONTEXT };

    const renderWithContext = (props) => {
        return render(
            <PackageTravelContext.Provider value={mockContextValue}>
                <SearchComponent {...props} />
            </PackageTravelContext.Provider>
        );
    };
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });
    afterEach(() => {
        cleanup();
        jest.useRealTimers();
    });

    it('should show unique suggestions (no duplicates) when focusing input', () => {
        renderWithContext({ onFilter: mockOnFilter });

        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);

        expect(screen.getByText('Mendoza')).toBeInTheDocument();
        expect(screen.getByText('Salta')).toBeInTheDocument();
        expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
        expect(screen.getAllByText('Mendoza')).toHaveLength(1);
    });

    it('should filter suggestions as the user types', () => {
        renderWithContext({ onFilter: mockOnFilter });

        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.change(searchInput, { target: { value: 'Sal' } });

        expect(screen.getByText('Salta')).toBeInTheDocument();
        expect(screen.queryByText('Mendoza')).not.toBeInTheDocument();
    });

    it('should close suggestion list and update input when a suggestion is clicked', () => {
        renderWithContext({ onFilter: mockOnFilter });

        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);

        const suggestion = screen.getByText('Mendoza');
        fireEvent.click(suggestion);

        expect(searchInput.value).toBe('Mendoza');
        expect(screen.queryByText('Salta')).not.toBeInTheDocument();
    });

    it('should call onFilter(null) when input is cleared', () => {
        renderWithContext({ onFilter: mockOnFilter });

        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.change(searchInput, { target: { value: 'M' } });

        const clearBtn = screen.getByTestId('x-icon');
        fireEvent.click(clearBtn);

        expect(mockOnFilter).toHaveBeenCalledWith(null);
        expect(searchInput.value).toBe('');
    });

    it('should hide suggestions after blur timeout', () => {
        renderWithContext({ onFilter: mockOnFilter });

        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);

        expect(screen.getByText('Mendoza')).toBeInTheDocument();

        act(() => {
            fireEvent.mouseDown(document.body);
        });

        expect(screen.queryByText('Mendoza')).not.toBeInTheDocument();
    });

    it('should call onFilter with typed destination when form is submitted (Enter)', () => {
        renderWithContext({ onFilter: mockOnFilter });

        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.change(searchInput, { target: { value: 'Bu' } });

        fireEvent.submit(searchInput.closest('form'));

        expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
            destination: 'Bu'
        }));
    });
});