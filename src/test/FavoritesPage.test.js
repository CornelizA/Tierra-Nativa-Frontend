import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { FavoritesPage } from '../pages/FavoritesPage';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../service/PackageTravelService', () => ({
    apiGetMyFavorites: jest.fn(),
    fireAlert: jest.fn(),
}));

jest.mock('../component/PackageTravelCard', () => ({
    PackageTravelCard: ({ pkg }) => (
        <div data-testid="package-card">
            <h4>{pkg.name}</h4>
        </div>
    )
}));

jest.mock('lucide-react', () => ({
    Heart: () => <div data-testid="heart-icon" />,
    ArrowLeft: () => <div data-testid="arrow-icon" />,
    Bookmark: () => <div data-testid="bookmark-icon" />,
    Loader2: () => <div data-testid="loader-icon" />,
}));

const mockFavoritesData = [
    { id: 1, name: 'Glaciar Perito Moreno', destination: 'Calafate', basePrice: 500000 },
    { id: 2, name: 'Cataratas del Iguazú', destination: 'Misiones', basePrice: 300000 }
];

const mockContextValue = {
    setFavoriteIds: jest.fn(),
};

const renderWithContext = (isLoggedIn = true) => {
    if (isLoggedIn) {
        sessionStorage.setItem('jwtToken', 'valid-token');
    } else {
        sessionStorage.removeItem('jwtToken');
    }

    return render(
        <MemoryRouter initialEntries={['/favorites']}>
            <PackageTravelContext.Provider value={mockContextValue}>
                <Routes>
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/home" element={<div>Home Page Mock</div>} />
                </Routes>
            </PackageTravelContext.Provider>
        </MemoryRouter>
    );
};

describe('FavoritesPage Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    afterEach(() => {
        cleanup();
    });

    it('should redirect to /home if user is not logged in', async () => {
        renderWithContext(false);

        await waitFor(() => {

            expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
        });
    });

    it('should show loader while fetching favorites', () => {
        PackageService.apiGetMyFavorites.mockReturnValue(new Promise(() => { }));
        renderWithContext(true);

        expect(screen.getByText(/Cargando tus deseos/i)).toBeInTheDocument();
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('should display empty message if favorites list is empty', async () => {
        PackageService.apiGetMyFavorites.mockResolvedValue([]);
        renderWithContext(true);

        const emptyMessage = await screen.findByText(/Tu lista está vacía/i);
        expect(emptyMessage).toBeInTheDocument();
        expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('should render the list of favorite packages correctly', async () => {
        PackageService.apiGetMyFavorites.mockResolvedValue(mockFavoritesData);
        renderWithContext(true);

        const cards = await screen.findAllByTestId('package-card');
        expect(cards).toHaveLength(2);

        expect(screen.getByText('Glaciar Perito Moreno')).toBeInTheDocument();
        expect(screen.getByText('Cataratas del Iguazú')).toBeInTheDocument();

        expect(mockContextValue.setFavoriteIds).toHaveBeenCalledWith(expect.any(Set));
        const setCall = mockContextValue.setFavoriteIds.mock.calls[0][0];
        expect(setCall.has(1)).toBe(true);
        expect(setCall.has(2)).toBe(true);
    });

    it('should call fireAlert on API error', async () => {
        PackageService.apiGetMyFavorites.mockRejectedValue(new Error('Fetch error'));
        renderWithContext(true);

        await waitFor(() => {
            expect(PackageService.fireAlert).toHaveBeenCalledWith(
                'Operación Fallida',
                'No se pudo actualizar el listado de favoritos.',
                'error'
            );
        });
    });
});