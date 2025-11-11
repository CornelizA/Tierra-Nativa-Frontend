import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchComponent } from '../component/SearchComponent';
import { PackageTravelContext } from '../context/PackageTravelContext';

const MOCK_PACKAGES_CONTEXT = [
    { id: 1, destination: 'Mendoza', name: 'A' },
    { id: 2, destination: 'Mendoza', name: 'B' }, 
    { id: 3, destination: 'Salta', name: 'C' },
    { id: 4, destination: 'Buenos Aires', name: 'D' },
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

const setErrorMessage = jest.fn(); 

describe('SearchComponent', () => {
    const mockOnFilter = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render search field', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        expect(screen.getByPlaceholderText('Selecciona tu destino')).toBeInTheDocument();
    });

    it('should show all unique suggestions when focusing input', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);

        expect(screen.getByText('Mendoza')).toBeInTheDocument();
        expect(screen.getByText('Salta')).toBeInTheDocument();
        expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('should filter suggestions when typing in input', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);
        fireEvent.change(searchInput, { target: { value: 'm' } });

        expect(screen.getByText('Mendoza')).toBeInTheDocument();
        expect(screen.queryByText('Salta')).not.toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });
    
    it('should call onFilter with selected destination when clicking a suggestion', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);
        fireEvent.click(screen.getByText('Salta'));

        expect(mockOnFilter).toHaveBeenCalledWith('Salta');
        expect(searchInput).toHaveValue('Salta');
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('should hide suggestions after delay when losing focus (onBlur)', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        fireEvent.focus(searchInput);
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        
        fireEvent.blur(searchInput);
        expect(screen.getAllByRole('listitem')).toHaveLength(3);

        act(() => {
            jest.runOnlyPendingTimers();
        });
        
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('should call onFilter(null) if input is manually cleared', () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');
        
        fireEvent.change(searchInput, { target: { value: 'salta' } });
        fireEvent.change(searchInput, { target: { value: '' } });

        expect(mockOnFilter).toHaveBeenCalledWith(null);
    });
    
    it('should call onFilter with first result when pressing Enter', async () => {
        renderWithContext({ onFilter: mockOnFilter });
        
        const searchInput = screen.getByPlaceholderText('Selecciona tu destino');

        fireEvent.change(searchInput, { target: { value: 'men' } });
        
        await waitFor(() => {
            expect(screen.getByText('Mendoza')).toBeInTheDocument();
        });

        const form = screen.getByRole('search');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockOnFilter).toHaveBeenCalledWith('Mendoza');
        });
        
        expect(searchInput).toHaveValue('');
    });
});