import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { PackageDetailed } from '../pages/PackageDetailed';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const packagesContext = [
    {
        id: 10,
        name: 'Cataratas del Iguazú Completo',
        destination: 'Misiones',
        category: 'Litoral',
        basePrice: 700,
        itineraryDetail: {
            dailyActivitiesDescription: 'Día 1: Llegada y city tour. Día 2: Excursión Cataratas Lado Argentino. Día 3: Cataratas Lado Brasilero. Día 4: Actividad acuática. Día 5: Despedida.',
            generalRecommendations: 'Llevar repelente. Usar ropa cómoda y liviana. El clima es húmedo y caluroso. Usar protector solar.',
        },
        images: [
            { url: 'img1_principal.jpg', principal: true },
            { url: 'img2_secundaria.jpg', principal: false },
            { url: 'img3_secundaria.jpg', principal: false },
            { url: 'img4_secundaria.jpg', principal: false },
            { url: 'img5_secundaria.jpg', principal: false },
            { url: 'img6_adicional.jpg', principal: false },
        ],
    },
];

const renderWithContext = (packageId, packages) => {
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

describe('PackageDetailed Page', () => {

    it('should show basic package details', async () => {
        renderWithContext('10', packagesContext);

        await waitFor(() => {
            expect(screen.getByText('Cataratas del Iguazú Completo')).toBeInTheDocument();
            expect(screen.getByText('Resumen del Itinerario')).toBeInTheDocument();
            expect(screen.getByText('Planificación día por día')).toBeInTheDocument();
        });
    });

    it('should show up to 4 secondary images different from principal', async () => {
        const { container } = renderWithContext('10', packagesContext);

        await waitFor(() => {
            const mainImage = screen.getByRole('img', { name: 'Cataratas del Iguazú Completo' });
            expect(mainImage).toBeInTheDocument();
            expect(mainImage).toHaveAttribute('src', 'img1_principal.jpg');

            const secondaryImagesContainer = container.querySelector('.secondary-images-grid');
            expect(secondaryImagesContainer).toBeTruthy();
            
            const secondaryImages = secondaryImagesContainer.querySelectorAll('.secondary-image');

            expect(secondaryImages).toHaveLength(4); 
            expect(secondaryImages[0]).toHaveAttribute('src', 'img2_secundaria.jpg');
            expect(secondaryImages[3]).toHaveAttribute('src', 'img5_secundaria.jpg'); 
        });
    });

    it('should show full gallery modal when clicking "Ver más" and close it', async () => {
        const { container } = renderWithContext('10', packagesContext);

        const verMasButton = screen.getByRole('button', { name: 'Ver más' });
        fireEvent.click(verMasButton);

        await waitFor(() => {
            const modal = container.querySelector('.gallery-modal');
            expect(modal).toBeTruthy();
            
            const modalImagesInModal = modal.querySelectorAll('.modal-image');
            
            expect(modalImagesInModal).toHaveLength(6);
            expect(modalImagesInModal[0]).toHaveAttribute('src', 'img1_principal.jpg');
            expect(modalImagesInModal[5]).toHaveAttribute('src', 'img6_adicional.jpg');
        });

        fireEvent.click(screen.getByRole('button', { name: '×' }));

        await waitFor(() => {
            const modal = container.querySelector('.gallery-modal');
            expect(modal).not.toBeInTheDocument();
        });
    });

    it('should parse day-by-day planning correctly', async () => {
        const { container } = renderWithContext('10', packagesContext);

        await waitFor(() => {
            const daySection = screen.getByText('Planificación día por día').closest('.card')?.querySelector('.day-list');
            expect(daySection).toBeTruthy();
            
            const dayItems = daySection.querySelectorAll('li');

            expect(dayItems).toHaveLength(5);
            expect(dayItems[0].textContent).toMatch(/Día\s*1:.*Llegada y city tour/);
            expect(dayItems[4].textContent).toMatch(/Día\s*5:.*Despedida/);
        });
    });

    it('should show general recommendations as a list', async () => {
        const { container } = renderWithContext('10', packagesContext);

        await waitFor(() => {
            const recommendationHeader = screen.getByText('Recomendaciones Generales');
            expect(recommendationHeader).toBeInTheDocument();
            
            const recommendationSection = recommendationHeader.closest('.card')?.querySelector('.card-body');
            expect(recommendationSection).toBeTruthy();
            
            const recommendationItems = recommendationSection.querySelectorAll('.card-list-item');

            expect(recommendationItems).toHaveLength(4);
            expect(recommendationItems[0].textContent).toContain('Llevar repelente.');
        });
    });
});