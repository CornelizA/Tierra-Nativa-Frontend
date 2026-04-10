import { render, screen, cleanup } from '@testing-library/react';
import ErrorBoundary from '../component/ErrorBoundary';
import '@testing-library/jest-dom';

jest.mock('lucide-react', () => ({
  ShieldAlert: () => <div data-testid="shield-alert-icon" />,
}));

const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Bomba de prueba');
  }
  return <div>Contenido Seguro</div>;
};

describe('ErrorBoundary Component', () => {

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    console.error.mockRestore();
    cleanup();
  });

  it('should render children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Contenido Seguro')).toBeInTheDocument();

    expect(screen.queryByText(/Ocurrió un error inesperado/i)).not.toBeInTheDocument();
  });

  it('should display the fallback UI when a child component crashes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ocurrió un error inesperado.')).toBeInTheDocument();

    expect(screen.getByText(/Por favor, recarga la página o vuelve más tarde/i)).toBeInTheDocument();

    expect(screen.getByTestId('shield-alert-icon')).toBeInTheDocument();

    expect(screen.queryByText('Contenido Seguro')).not.toBeInTheDocument();
  });

  it('should call console.error when catching an error (componentDidCatch)', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
});