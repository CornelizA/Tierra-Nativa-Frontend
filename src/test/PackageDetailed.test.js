import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { PackageDetailed } from '../pages/PackageDetailed';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as PackageService from '../service/PackageTravelService';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetCharacteristicsPublic: jest.fn(),
    apiGetPackageById: jest.fn(),
    fireAlert: jest.fn(),
}));

const mockCharacteristics = [
    { id: 1, title: 'Wi-Fi', icon: 'wifi' },
    { id: 3, title: 'Hospedaje', icon: 'tent' }
];

const mockPackage = {
    id: 1,
    name: "Glaciar Perito Moreno: Hielo Milenario",
    itineraryDetail: {
        duration: "4 Días / 3 Noches",
        lodgingType: "Hotel 4 estrellas",
        transferType: "Vuelo a FTE",
        dailyActivitiesDescription: "Día 1: Llegada. Día 2: Glaciar.",
        foodAndHydrationNotes: "Incluye comidas.",
        generalRecommendations: "Llevar abrigo. Usar lentes."
    },
    imageDetails: [
        { id: 1, url: "p1.jpg", principal: true },
        { id: 2, url: "p2.jpg", principal: false },
        { id: 3, url: "p3.jpg", principal: false },
        { id: 4, url: "p4.jpg", principal: false },
        { id: 5, url: "p5.jpg", principal: false },
        { id: 6, url: "p6.jpg", principal: false }
    ],
    characteristicIds: [1, 3]
};

const renderWithContext = (packageId, packages = []) => {
    return render(
        <MemoryRouter initialEntries={[`/detallePaquete/${packageId}`]}>
            <Routes>
                <Route
                    path="/detallePaquete/:id"
                    element={
                        <PackageTravelContext.Provider value={{ packageTravel: packages }}>
                            <PackageDetailed />
                        </PackageTravelContext.Provider>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('PackageDetailed Page Integration', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        PackageService.apiGetCharacteristicsPublic.mockResolvedValue(mockCharacteristics);
        PackageService.apiGetPackageById.mockResolvedValue(mockPackage);
    });

    it('should load and display main information and title', async () => {
        renderWithContext('1');

        await waitFor(() => {
            expect(screen.getByText(/Glaciar Perito Moreno/i)).toBeInTheDocument();
            expect(screen.getByText('4 Días / 3 Noches')).toBeInTheDocument();
        });
    });

    it('should render the gallery with 1 main image and 4 secondary images', async () => {
        const { container } = renderWithContext('1');

        await waitFor(() => {
            const mainImg = screen.getByAltText("Glaciar Perito Moreno: Hielo Milenario");
            expect(mainImg).toHaveAttribute('src', 'p1.jpg');

            const secondaryGrid = container.querySelector('.secondary-images-grid');
            const images = secondaryGrid.querySelectorAll('.secondary-image');
            expect(images).toHaveLength(4);
            expect(images[0]).toHaveAttribute('src', 'p2.jpg');
        });
    });

    it('should show and hide the gallery modal when "Ver más" is clicked', async () => {
        renderWithContext('1');

        const verMas = await screen.findByText('Ver más');
        fireEvent.click(verMas);

        expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
        
        const modalImages = document.querySelectorAll('.modal-image');
        expect(modalImages.length).toBe(6); 

        fireEvent.click(screen.getByText('×'));
        expect(screen.queryByText('×')).not.toBeInTheDocument();
    });

    it('should render characteristics with their icons and titles', async () => {
        renderWithContext('1');

        await waitFor(() => {
            expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
            expect(screen.getByText('Hospedaje')).toBeInTheDocument();
        });
    });

    it('should parse and format recommendations into list items', async () => {
        renderWithContext('1');

        await waitFor(() => {
            const recommendationItems = screen.getAllByRole('listitem').filter(
                li => li.className.includes('card-list-item')
            );
            expect(recommendationItems.length).toBe(2);
            expect(recommendationItems[0]).toHaveTextContent('Llevar abrigo.');
        });
    });

    it('should call apiGetPackageById if package is not in context list', async () => {
        renderWithContext('1', []);

        await waitFor(() => {
            expect(PackageService.apiGetPackageById).toHaveBeenCalledWith('1');
        });
    });
});