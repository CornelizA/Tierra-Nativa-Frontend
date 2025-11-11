import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { Home } from '../pages/Home';
import { sampleArray } from '../helpers/arrayUtils';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { packagesContext } from './mockData';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
}));
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
        const imageStatus = imageUrl && imageUrl !== 'https://placehold.co/400x300/CCCCCC/000000?text=SIN+IMAGEN' ? 'IMG' : 'FB';

        return (
            <div data-testid="package-card">{name} - {imageStatus}</div>
        );
    },
}));

const renderWithContext = (packagesData) => {
    return render(
        <Router>
            <PackageTravelContext.Provider value={{ packageTravel: packagesData }}>
                <Home />
            </PackageTravelContext.Provider>
        </Router>
    );
};

describe('Home Page', () => {

    beforeEach(() => {
        sampleArray.mockClear(); 
    });

    it('should show loading message if context is empty', () => {
        renderWithContext([]);
        expect(screen.getByText('Cargando paquetes de Tierra Nativa...')).toBeInTheDocument();
    });

    it('should show 6 featured packages by default (using sampleArray)', async () => {
        renderWithContext(packagesContext);
        await waitFor(() => {
            expect(sampleArray).toHaveBeenCalledWith(packagesContext, 6); 
            expect(screen.getAllByTestId('package-card')).toHaveLength(6); 
        });

        expect(screen.getByText(/Paquetes Destacados \(\d+\)/)).toBeInTheDocument(); 
        expect(screen.getByTestId('search-component')).toBeInTheDocument();
        expect(screen.getByTestId('destination-component')).toBeInTheDocument();
    });

    it('should use principal image from images array', async () => {
        renderWithContext(packagesContext);

        await waitFor(() => {
            expect(screen.getByText('Patagonia - IMG')).toBeInTheDocument(); 
            expect(screen.getByText('Norte - IMG')).toBeInTheDocument(); 
        });
    });

    it('should use FALLBACK if no principal image is defined', async () => {
        renderWithContext(packagesContext);

        await waitFor(() => {
            expect(screen.getByText('Mendoza Wine - FB')).toBeInTheDocument(); 
            expect(screen.getByText('Iguazú - IMG')).toBeInTheDocument(); 
        });
    });

    it('should filter and show only packages from selected destination', async () => {
        renderWithContext(packagesContext);

        await waitFor(() => expect(screen.getAllByTestId('package-card')).toHaveLength(6));

        fireEvent.click(screen.getByText('Filtrar por Mendoza'));

        await waitFor(() => {
            const cards = screen.getAllByTestId('package-card');
            expect(cards).toHaveLength(2);
            expect(screen.getByText('Mendoza Wine - FB')).toBeInTheDocument();
            expect(screen.getByText('Mendoza Andes - IMG')).toBeInTheDocument();
            
            expect(screen.getByText('Paquetes Destacados (2)')).toBeInTheDocument(); 
        });
    });

    it('should return to 6 featured packages state when removing filter', async () => {
        renderWithContext(packagesContext);

        await waitFor(() => fireEvent.click(screen.getByText('Filtrar por Mendoza')));
        expect(screen.getAllByTestId('package-card')).toHaveLength(2);

        fireEvent.click(screen.getByText('Quitar Filtro'));

        await waitFor(() => {
            expect(screen.getAllByTestId('package-card')).toHaveLength(6); 
            expect(screen.getByText('Patagonia - IMG')).toBeInTheDocument();
            
            expect(sampleArray).toHaveBeenCalledWith(packagesContext, 6);
        });
    });

    it('should render "Ver Detalle" button with correct link for each card', async () => {
        renderWithContext(packagesContext);
        await waitFor(() => expect(screen.getAllByTestId('package-card')).toHaveLength(6));

        const detailLinks = screen.getAllByRole('link', { name: /Ver Detalle/i });

        expect(detailLinks[0]).toHaveAttribute('href', '/detallePaquete/1');
        expect(detailLinks[1]).toHaveAttribute('href', '/detallePaquete/2');
    });
});