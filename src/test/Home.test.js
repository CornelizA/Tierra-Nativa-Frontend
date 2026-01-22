import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Home } from '../pages/Home';
import { sampleArray } from '../helpers/arrayUtils';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { packagesContext } from './mockData';
import '@testing-library/jest-dom';

jest.mock('../helpers/arrayUtils', () => ({
    sampleArray: jest.fn((arr, count) => arr.slice(0, count)),
}));

jest.mock('../component/SearchComponent', () => ({
    SearchComponent: ({ onFilter }) => (
        <div data-testid="search-component">
            <button onClick={() => onFilter('Mendoza')}>Filtrar por Mendoza</button>
            <button onClick={() => onFilter(null)}>Quitar Filtro</button>
        </div>
    ),
}));

jest.mock('../component/DestinationComponent', () => ({
    DestinationComponent: () => <div data-testid="destination-component" />,
}));

jest.mock('../component/PackageTravelCard', () => ({
    PackageTravelCard: ({ name, imageUrl }) => {
        const status = imageUrl.includes('placehold.co') ? 'FB' : 'IMG';
        return <div data-testid="package-card">{name} - {status}</div>;
    },
}));

const renderWithContext = (packagesData, isLoaded = true) => {
    return render(
        <Router>
            <PackageTravelContext.Provider value={{ packageTravel: packagesData, isLoaded }}>
                <Home />
            </PackageTravelContext.Provider>
        </Router>
    );
};

describe('Home Page Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show loading message when isLoaded is false', () => {
        renderWithContext([], false);
        expect(screen.getByText(/Cargando paquetes de Tierra Nativa/i)).toBeInTheDocument();
    });

    it('should show 6 featured packages by default and render main components', async () => {
        renderWithContext(packagesContext, true);
        expect(sampleArray).toHaveBeenCalledWith(expect.any(Array), 6);
        
        const cards = screen.getAllByTestId('package-card');
        expect(cards).toHaveLength(6);
        
        expect(screen.getByTestId('search-component')).toBeInTheDocument();
        expect(screen.getByTestId('destination-component')).toBeInTheDocument();
        expect(screen.getByAltText(/Mapa de Argentina/i)).toBeInTheDocument();
    });

    it('should apply fallback image logic correctly', () => {
        const customData = [
            { id: 1, name: 'Sin Fotos', destination: 'Narnia', imageDetails: [] },
            ...packagesContext.slice(1)
        ];
        
        renderWithContext(customData, true);
        
        expect(screen.getByText('Sin Fotos - FB')).toBeInTheDocument();
    });

    it('should filter packages when a destination is selected in SearchComponent', async () => {
        renderWithContext(packagesContext, true);

        const filterBtn = screen.getByText('Filtrar por Mendoza');
        fireEvent.click(filterBtn);

        await waitFor(() => {
            const filteredCards = screen.getAllByTestId('package-card');
            expect(filteredCards.length).toBeLessThan(6);
        });
        
        expect(screen.getByText(/Experiencias imperdibles/i)).toBeInTheDocument();
    });

    it('should render "Ver Detalle" buttons with correct IDs', () => {
        renderWithContext(packagesContext, true);

        const links = screen.getAllByRole('link', { name: /Ver Detalle/i });
        expect(links[0].getAttribute('href')).toMatch(/\/detallePaquete\/\d+/);
    });
});