import { render, screen } from '@testing-library/react';
import { DestinationComponent } from '../component/DestinationComponent'; 

describe('DestinationComponent', () => {

    it('should render DestinationComponent without errors', () => {

        render(<DestinationComponent />);
        
        expect(screen.getByRole('heading', { level: 3, name: /Recorre el Alma de Argentina/i })).toBeInTheDocument();
    });

    it('should show main title "Recorre el Alma de Argentina"', () => {
        render(<DestinationComponent />);
        
        expect(screen.getByText('Recorre el Alma de Argentina')).toBeInTheDocument();
    });

    it('should show descriptive paragraph about Argentina', () => {
        render(<DestinationComponent />);
        
        const descriptiveText = /Argentina es un continente de culturas y paisajes esperando ser explorado/i;
        expect(screen.getByText(descriptiveText)).toBeInTheDocument();
    });

    it('should show component final invitation', () => {
        render(<DestinationComponent />);
        
        const invitationText = /Te invitamos a recorrer este país inmenso/i;
        expect(screen.getByText(invitationText)).toBeInTheDocument();
    });

    it('should have basic structure with container role', () => {
        const { container } = render(<DestinationComponent />);
    
        expect(container.firstChild).toHaveClass('destination-slider-container');
    });

});