import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AvailabilityCalendar } from '../component/AvailabilityCalendar';
import '@testing-library/jest-dom';


jest.mock('lucide-react', () => ({
    ChevronLeft: () => <div data-testid="chevron-left" />,
    ChevronRight: () => <div data-testid="chevron-right" />,
}));

describe('AvailabilityCalendar Component', () => {

    const mockToday = new Date(2026, 1, 1);

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockToday);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    afterEach(() => {
        cleanup();
    });

    const mockAvailabilityBlocks = [
        {
            startDate: "2026-02-10",
            endDate: "2026-02-12",
            available: false
        },
        {
            startDate: "2026-02-20",
            endDate: "2026-02-20",
            status: "booked"
        }
    ];

    it('should render correctly showing current and next month', () => {
        render(<AvailabilityCalendar availabilityBlocks={[]} />);

        expect(screen.getByText(/Disponible/i)).toBeInTheDocument();
        expect(screen.getByText(/Reservado/i)).toBeInTheDocument();

        expect(screen.getByText(/febrero/i)).toBeInTheDocument();
        expect(screen.getByText(/marzo/i)).toBeInTheDocument();
    });

    it('should mark past dates as past (opacity-30/bg-light)', () => {

        jest.setSystemTime(new Date(2026, 1, 15));

        render(<AvailabilityCalendar availabilityBlocks={[]} />);

        const day10 = screen.getAllByText('10')[0].parentElement;
        expect(day10).toHaveClass('opacity-30');
        expect(day10).toHaveAttribute('title', 'Fecha pasada');

        jest.setSystemTime(mockToday);
    });

    it('should highlight booked dates correctly', () => {
        render(<AvailabilityCalendar availabilityBlocks={mockAvailabilityBlocks} />);

        const day10 = screen.getAllByText('10')[0].parentElement;
        const day11 = screen.getAllByText('11')[0].parentElement;
        const day12 = screen.getAllByText('12')[0].parentElement;

        expect(day10).toHaveClass('text-danger');
        expect(day11).toHaveClass('text-danger');
        expect(day12).toHaveClass('text-danger');
        expect(day10).toHaveAttribute('title', 'No disponible (Reservado)');
    });

    it('should highlight available future dates with success style', () => {
        render(<AvailabilityCalendar availabilityBlocks={[]} />);

        const day15 = screen.getAllByText('15')[0].parentElement;

        expect(day15).toHaveClass('text-success');
        expect(day15.getAttribute('title')).toMatch(/Disponible/);
    });

    it('should navigate to next months when clicking next button', () => {
        render(<AvailabilityCalendar availabilityBlocks={[]} />);

        const nextBtn = screen.getByTestId('chevron-right').parentElement;
        fireEvent.click(nextBtn);

        expect(screen.getByText(/marzo/i)).toBeInTheDocument();
        expect(screen.getByText(/abril/i)).toBeInTheDocument();
        expect(screen.queryByText(/febrero/i)).not.toBeInTheDocument();
    });

    it('should disable prev button when at current month', () => {
        render(<AvailabilityCalendar availabilityBlocks={[]} />);

        const prevBtn = screen.getByTestId('chevron-left').parentElement;

        expect(prevBtn).toBeDisabled();
        expect(prevBtn).toHaveStyle('cursor: not-allowed');
    });

    it('should enable prev button after navigating forward', () => {
        render(<AvailabilityCalendar availabilityBlocks={[]} />);

        const nextBtn = screen.getByTestId('chevron-right').parentElement;
        fireEvent.click(nextBtn);

        const prevBtn = screen.getByTestId('chevron-left').parentElement;
        expect(prevBtn).not.toBeDisabled();
        expect(prevBtn).toHaveStyle('cursor: pointer');
    });

    it('should handle malformed or empty availability blocks gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const badBlocks = [{ startDate: "fecha-invalida", endDate: null }];
        render(<AvailabilityCalendar availabilityBlocks={badBlocks} />);

        expect(screen.getByText(/febrero/i)).toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});