import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { WhatsAppButton } from '../component/WhatsAppButton';
import * as PackageService from '../service/PackageTravelService';
import Swal from 'sweetalert2';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiGetContactConfig: jest.fn(),
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn().mockResolvedValue({}),
}));

const mockContact = {
    whatsapp: '5491112345678',
    message: 'Mensaje del backend que debe ignorarse',
};

describe('WhatsAppButton', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(cleanup);

    it('should NOT render the button if contact data is not available', async () => {
        PackageService.apiGetContactConfig.mockResolvedValue(null);
        const { container } = render(<WhatsAppButton />);
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('should NOT render if response has no whatsapp field', async () => {
        PackageService.apiGetContactConfig.mockResolvedValue({ email: 'info@test.com' });
        const { container } = render(<WhatsAppButton />);
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('should render the button after contact data loads successfully', async () => {
        PackageService.apiGetContactConfig.mockResolvedValue(mockContact);
        render(<WhatsAppButton />);
        const btn = await screen.findByRole('button', { name: /whatsapp/i });
        expect(btn).toBeInTheDocument();
    });

    it('should call Swal.fire when button is clicked', async () => {
        PackageService.apiGetContactConfig.mockResolvedValue(mockContact);
        render(<WhatsAppButton />);
        const btn = await screen.findByRole('button', { name: /whatsapp/i });
        fireEvent.click(btn);
        expect(Swal.fire).toHaveBeenCalledTimes(1);
    });

    it('should open WhatsApp URL with correct phone number via willClose', async () => {
        PackageService.apiGetContactConfig.mockResolvedValue(mockContact);

        let capturedConfig = null;
        Swal.fire.mockImplementation((config) => {
            capturedConfig = config;
            return Promise.resolve({});
        });

        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

        render(<WhatsAppButton />);
        const btn = await screen.findByRole('button', { name: /whatsapp/i });
        fireEvent.click(btn);

        expect(capturedConfig).not.toBeNull();
        capturedConfig.willClose();

        expect(openSpy).toHaveBeenCalledWith(
            expect.stringContaining('wa.me/5491112345678'),
            '_blank'
        );

        openSpy.mockRestore();
    });

    it('should use the frontend message (not the backend message) in the WhatsApp URL', async () => {
        PackageService.apiGetContactConfig.mockResolvedValue(mockContact);

        let capturedConfig = null;
        Swal.fire.mockImplementation((config) => {
            capturedConfig = config;
            return Promise.resolve({});
        });

        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

        render(<WhatsAppButton />);
        const btn = await screen.findByRole('button', { name: /whatsapp/i });
        fireEvent.click(btn);

        capturedConfig.willClose();

        const calledUrl = openSpy.mock.calls[0][0];
        expect(calledUrl).toContain('text=');
        expect(calledUrl).not.toContain(encodeURIComponent(mockContact.message));

        openSpy.mockRestore();
    });

    it('should not crash if apiGetContactConfig throws an error', async () => {
        PackageService.apiGetContactConfig.mockRejectedValue(new Error('Network error'));
        const { container } = render(<WhatsAppButton />);
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });
});
