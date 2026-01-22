import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchComponent } from '../component/SearchComponent';
import { PackageTravelContext } from '../context/PackageTravelContext';
import '@testing-library/jest-dom';

const MOCK_PACKAGES_CONTEXT = [
    { id: 1, destination: 'Mendoza', name: 'Pack A' },
    { id: 2, destination: 'Mendoza', name: 'Pack B' },
    { id: 3, destination: 'Salta', name: 'Pack C' },
    { id: 4, destination: 'Buenos Aires', name: 'Pack D' },
];

const mockContextValue = {
    packageTravel: MOCK_PACKAGES_CONTEXT,
};

const renderWithContext = (props) => {
    return render(
        <PackageTravelContext.Provider value={mockContextValue}>
            <SearchComponent {...props} />
        </PackageTravelContext.Provider>
    );
};

describe('SearchComponent Logic and Interaction', () => {
    const mockOnFilter = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should show unique suggestions (no duplicates) when focusing input', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(3); 
        expect(screen.getByText('Mendoza')).toBeInTheDocument();
        expect(screen.getByText('Salta')).toBeInTheDocument();
        expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
    });

    it('should filter suggestions as the user types', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.change(searchInput, { target: { value: 'Sal' } });

        expect(screen.getByText('Salta')).toBeInTheDocument();
        expect(screen.queryByText('Mendoza')).not.toBeInTheDocument();
    });

    it('should call onFilter and close list when a suggestion is clicked', async () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);
        
        const suggestion = screen.getByText('Mendoza');
        fireEvent.click(suggestion);

        expect(mockOnFilter).toHaveBeenCalledWith('Mendoza');
        expect(searchInput.value).toBe('Mendoza');
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('should call onFilter(null) when input is cleared', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.change(searchInput, { target: { value: 'M' } });
        fireEvent.change(searchInput, { target: { value: '' } });

        expect(mockOnFilter).toHaveBeenCalledWith(null);
    });

    it('should hide suggestions after blur timeout', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);

        const items = screen.getAllByRole('listitem');
        expect(items.length).toBeGreaterThan(0);

        fireEvent.blur(searchInput);
        
        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('should select the first suggestion when form is submitted (Enter)', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.change(searchInput, { target: { value: 'Bu' } });

        const form = screen.getByRole('search');
        fireEvent.submit(form);

        expect(mockOnFilter).toHaveBeenCalledWith('Buenos Aires');
        expect(searchInput.value).toBe('');
    });
});