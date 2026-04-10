import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { PackageDetailed } from '../pages/PackageDetailed';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetCharacteristics: jest.fn(),
    apiGetPackageById: jest.fn(),
    apiGetReviews: jest.fn(),
    apiPostReview: jest.fn(),
    apiUpdateReview: jest.fn(),
    apiDeleteReview: jest.fn(),
    apiToggleFavorite: jest.fn(),
    apiGetMyBooking: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockCharacteristics = [
    { id: 1, title: 'Wi-Fi', icon: 'wifi' },
    { id: 3, title: 'Hospedaje', icon: 'tent' }
];

const mockPackage = {
    id: 1,
    name: "Glaciar Perito Moreno: Hielo Milenario",
    shortDescription: "Descripción breve del glaciar.",
    averageRating: 4.8,
    itineraryDetail: {
        duration: "4 Días / 3 Noches",
        lodgingType: "Hotel 4 estrellas",
        transferType: "Vuelo a FTE",
        dailyActivitiesDescription: "Día 1: Arribo. Día 2: Glaciar.",
        foodAndHydrationNotes: "Incluye comidas.",
        generalRecommendations: "Llevar abrigo. Usar lentes."
    },
    imageDetails: [
        { id: 1, url: "p1.jpg", principal: true },
        { id: 2, url: "p2.jpg", principal: false },
        { id: 3, url: "p3.jpg", principal: false },
        { id: 4, url: "p4.jpg", principal: false },
        { id: 5, url: "p5.jpg", principal: false }
    ],
    characteristicIds: [1, 3],
    availabilityBlocks: []
};

const mockReviews = [
    { id: 10, score: 5, comment: "Excelente viaje", userName: "Juan Pérez", date: new Date().toISOString() }
];

const renderWithContext = (packageId, packages = [mockPackage], favoriteIds = new Set()) => {
    return render(
        <MemoryRouter initialEntries={[`/detallePaquete/${packageId}`]}>
            <PackageTravelContext.Provider value={{
                packageTravel: packages,
                favoriteIds: favoriteIds,
                updateFavoriteInContext: jest.fn()
            }}>
                <Routes>
                    <Route path="/detallePaquete/:id" element={<PackageDetailed />} />
                </Routes>
            </PackageTravelContext.Provider>
        </MemoryRouter>
    );
};

describe('PackageDetailed Page Integration', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        storageMock();
        PackageService.apiGetCharacteristics.mockResolvedValue(mockCharacteristics);
        PackageService.apiGetPackageById.mockResolvedValue(mockPackage);
        PackageService.apiGetReviews.mockResolvedValue(mockReviews);
        PackageService.apiGetMyBooking.mockResolvedValue([
            { id: 99, packageId: 1, status: 'FINISHED' }
        ]);
    });

    afterEach(cleanup);

    const storageMock = (token = 'valid-token') => {
        const storage = {
            'jwtToken': token,
            'user': JSON.stringify({ firstName: 'Juan', lastName: 'Pérez' })
        };
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: (key) => storage[key] || null,
                setItem: (key, val) => { storage[key] = val },
                removeItem: (key) => { delete storage[key] },
                clear: () => { for (let k in storage) delete storage[k] }
            },
            writable: true
        });
    };

    it('should load and display main information and title', async () => {
        renderWithContext('1');
        const title = await screen.findByText(/Glaciar Perito Moreno/i);
        expect(title).toBeInTheDocument();
        expect(screen.getByText('4 Días / 3 Noches')).toBeInTheDocument();
    });

    it('should render characteristics with their icons and titles', async () => {
        renderWithContext('1');
        const wifiLabel = await screen.findByText('Wi-Fi');
        const hospLabel = await screen.findByText('Hospedaje');

        expect(wifiLabel).toBeInTheDocument();
        expect(hospLabel).toBeInTheDocument();
    });

    it('should call apiToggleFavorite when heart is clicked', async () => {
        PackageService.apiToggleFavorite.mockResolvedValue({ isFavorite: true });
        renderWithContext('1');

        const heartBtn = await screen.findByTitle(/favoritos/i);
        fireEvent.click(heartBtn);

        await waitFor(() => {
            expect(PackageService.apiToggleFavorite).toHaveBeenCalledWith(1);
        });
    });

    it('should open review form and call apiPostReview', async () => {
        PackageService.apiPostReview.mockResolvedValue({ success: true });
        renderWithContext('1');

        const openFormBtn = await screen.findByText(/\+ Publicar mi experiencia/i);
        fireEvent.click(openFormBtn);

        const textarea = screen.getByPlaceholderText(/Cuéntanos los detalles\.\.\./i);
        fireEvent.change(textarea, { target: { value: 'Una experiencia inolvidable de prueba.' } });

        const starButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
        fireEvent.click(starButtons[4]);

        const submitBtn = screen.getByText(/Guardar mi Valoración/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(PackageService.apiPostReview).toHaveBeenCalled();
        });
    });


    it('should call apiDeleteReview when trash icon is clicked and confirmed', async () => {
        PackageService.fireAlert.mockResolvedValue({ isConfirmed: true });
        PackageService.apiDeleteReview.mockResolvedValue({ success: true });

        const { container } = renderWithContext('1');

        await screen.findAllByText(/Juan Pérez/i);

        const trashIcon = container.querySelector('.lucide-trash2');
        fireEvent.click(trashIcon.closest('button'));

        await waitFor(() => {
            expect(PackageService.apiDeleteReview).toHaveBeenCalled();
            expect(PackageService.apiGetPackageById).toHaveBeenCalled();
        });
    });


    it('should navigate to home if user logs out while on the page', async () => {
        const { rerender } = renderWithContext('1');
        storageMock(null);
        rerender(
            <MemoryRouter initialEntries={[`/detallePaquete/1`]}>
                <PackageTravelContext.Provider value={{ packageTravel: [mockPackage], favoriteIds: new Set() }}>
                    <Routes>
                        <Route path="/detallePaquete/:id" element={<PackageDetailed />} />
                        <Route path="/home" element={<div>Home Page</div>} />
                    </Routes>
                </PackageTravelContext.Provider>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(window.location.pathname).toBe('/');
        });
    });

    it('should call apiGetPackageById if package is not in context list', async () => {
        renderWithContext('1', []);
        await waitFor(() => {
            expect(PackageService.apiGetPackageById).toHaveBeenCalledWith('1');
        });
    });
});