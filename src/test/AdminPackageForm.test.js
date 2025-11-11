import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminPackageForm } from '../component/AdminPackageForm';
import { apiPostPackage, apiUpdatePackage } from '../service/PackageTravelService';
import { packageValid, packageUpdated } from './mockData';
import '@testing-library/jest-dom';

jest.mock('../service/PackageTravelService', () => ({
    apiPostPackage: jest.fn(),
    apiUpdatePackage: jest.fn(),
}));

const onActionComplete = jest.fn();

const renderForm = (onActionCompleteCallback = onActionComplete) => {
    render(<AdminPackageForm onActionComplete={onActionCompleteCallback} />);
};

const renderEditForm = (packageData = null, onActionCompleteCallback = onActionComplete) => {
    render(<AdminPackageForm packageToEdit={packageData} onActionComplete={onActionCompleteCallback} />);
};

describe('AdminPackageForm', () => {

    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        onActionComplete.mockClear();
    });

    test('should render correct fields in Creation mode', () => {
        renderForm();
        expect(screen.getByText('Registrar Producto')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nombre del Paquete')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Precio Base ($)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('URL de Imagen Principal')).toBeInTheDocument();
    });

    test('should call apiPostPackage with correct payload in Creation mode and call onActionComplete after delay', async () => {

        const mockOnActionComplete = jest.fn();

        apiPostPackage.mockResolvedValue({ name: packageValid.name, id: 99 });
        renderForm(mockOnActionComplete);

        fireEvent.change(screen.getByLabelText('Nombre del Paquete'), { target: { value: packageValid.name } });
        fireEvent.change(screen.getByLabelText('Descripción Corta'), { target: { value: packageValid.shortDescription } });
        fireEvent.change(screen.getByLabelText('Precio Base ($)'), { target: { value: String(packageValid.basePrice) } });
        fireEvent.change(screen.getByLabelText('Destino'), { target: { value: packageValid.destination } });
        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: packageValid.category } });

        fireEvent.change(screen.getByLabelText('Duración'), { target: { value: packageValid.itineraryDetail.duration } });
        fireEvent.change(screen.getByLabelText('Tipo de Hospedaje'), { target: { value: packageValid.itineraryDetail.lodgingType } });
        fireEvent.change(screen.getByLabelText('Tipo de Traslados'), { target: { value: packageValid.itineraryDetail.transferType } });
        fireEvent.change(screen.getByLabelText('Planificación día por día'), { target: { value: packageValid.itineraryDetail.dailyActivitiesDescription } });
        fireEvent.change(screen.getByLabelText('Notas de Alimentación e Hidratación'), { target: { value: packageValid.itineraryDetail.foodAndHydrationNotes } });
        fireEvent.change(screen.getByLabelText('Recomendaciones Generales'), { target: { value: packageValid.itineraryDetail.generalRecommendations } });

        fireEvent.change(screen.getByPlaceholderText('URL de Imagen Principal'), { target: { value: packageValid.imageDetails[0].url } });
        fireEvent.click(screen.getByText('Añadir Imagen'));
        fireEvent.change(screen.getByPlaceholderText('URL de Imagen Secundaria #1'), { target: { value: packageValid.imageDetails[1].url } });

        const form = document.querySelector('form.package-form');
        fireEvent.submit(form);

        const { id, status, currency, availability, rating, imageDetails, ...dataToSend } = packageValid;
        const expectedPayload = {
            ...dataToSend,
            basePrice: parseFloat(packageValid.basePrice),
            images: imageDetails.map(img => ({ url: img.url, principal: img.principal }))
        };

        const expectedSuccessMessage = `Paquete "${packageValid.name}" registrado con éxito!`;

        await waitFor(() => {
            expect(apiPostPackage).toHaveBeenCalledTimes(1);
        }, { timeout: 3000 });

        expect(apiPostPackage).toHaveBeenCalledWith(expect.objectContaining({
            name: expectedPayload.name,
            basePrice: expectedPayload.basePrice,
        }));

        await waitFor(() => {
            expect(screen.getByText(expectedSuccessMessage)).toBeInTheDocument();
        }, { timeout: 3000 });
        expect(mockOnActionComplete).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1500);
        await waitFor(() => {
            expect(mockOnActionComplete).toHaveBeenCalledTimes(1);
        });
    });

    test('should handle apiPostPackage failure and show error modal', async () => {
        const errorMessage = 'Error de conexión con el servidor';
        apiPostPackage.mockRejectedValue({ message: errorMessage });

        renderForm();
        fireEvent.change(screen.getByLabelText('Nombre del Paquete'), { target: { value: packageValid.name } });
        fireEvent.change(screen.getByLabelText('Descripción Corta'), { target: { value: packageValid.shortDescription } });
        fireEvent.change(screen.getByLabelText('Precio Base ($)'), { target: { value: String(packageValid.basePrice) } });
        fireEvent.change(screen.getByLabelText('Destino'), { target: { value: packageValid.destination } });
        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: packageValid.category } });

        fireEvent.change(screen.getByLabelText('Duración'), { target: { value: packageValid.itineraryDetail.duration } });
        fireEvent.change(screen.getByLabelText('Tipo de Hospedaje'), { target: { value: packageValid.itineraryDetail.lodgingType } });
        fireEvent.change(screen.getByLabelText('Tipo de Traslados'), { target: { value: packageValid.itineraryDetail.transferType } });
        fireEvent.change(screen.getByLabelText('Planificación día por día'), { target: { value: packageValid.itineraryDetail.dailyActivitiesDescription } });
        fireEvent.change(screen.getByLabelText('Notas de Alimentación e Hidratación'), { target: { value: packageValid.itineraryDetail.foodAndHydrationNotes } });
        fireEvent.change(screen.getByLabelText('Recomendaciones Generales'), { target: { value: packageValid.itineraryDetail.generalRecommendations } });

        fireEvent.change(screen.getByPlaceholderText('URL de Imagen Principal'), { target: { value: packageValid.imageDetails[0].url } });

        const form = document.querySelector('form.package-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(apiPostPackage).toHaveBeenCalledTimes(1);
        }, { timeout: 3000 });

        await waitFor(() => {
            expect(screen.getByText(`Error de API: ${errorMessage}`)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test('should render fields with pre-loaded data in Edit mode', () => {
        const packageForEdit = {
            ...packageUpdated,
            images: packageUpdated.imageDetails
        };
        renderEditForm(packageForEdit);
        expect(screen.getByText('Editar Paquete Existente')).toBeInTheDocument();
        expect(screen.getByText('Actualizar Paquete')).toBeInTheDocument();

        expect(screen.getByLabelText('Nombre del Paquete').value).toBe(packageUpdated.name);
        expect(screen.getByLabelText('Precio Base ($)').value).toBe(String(packageUpdated.basePrice));
        expect(screen.getByPlaceholderText('URL de Imagen Principal').value).toBe(packageUpdated.imageDetails[0].url);
    });

    test('should call apiUpdatePackage with correct payload in Edit mode and call onActionComplete after delay', async () => {

        const newName = 'Aventura Patagonia Modificada';

        const packageDataInitial = {
            ...packageUpdated,
            id: 89,
        };

        const mockApiUpdateResponse = { ...packageDataInitial, name: newName };
        apiUpdatePackage.mockResolvedValue(mockApiUpdateResponse);

        renderEditForm(packageDataInitial);

        const editTitle = await screen.findByText('Editar Paquete Existente');
        expect(editTitle).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre del Paquete')).toHaveValue(packageDataInitial.name);

        fireEvent.change(screen.getByLabelText('Nombre del Paquete'), { target: { value: newName } });
        fireEvent.change(screen.getByLabelText('Precio Base ($)'), { target: { value: String(packageDataInitial.basePrice) } });
        fireEvent.change(screen.getByLabelText('Destino'), { target: { value: packageDataInitial.destination } });
        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: packageDataInitial.category } });

        fireEvent.change(screen.getByLabelText('Duración'), { target: { value: packageDataInitial.itineraryDetail.duration } });
        fireEvent.change(screen.getByLabelText('Tipo de Hospedaje'), { target: { value: packageDataInitial.itineraryDetail.lodgingType } });
        fireEvent.change(screen.getByLabelText('Tipo de Traslados'), { target: { value: packageDataInitial.itineraryDetail.transferType } });
        fireEvent.change(screen.getByLabelText('Planificación día por día'), { target: { value: packageDataInitial.itineraryDetail.dailyActivitiesDescription } });
        fireEvent.change(screen.getByLabelText('Notas de Alimentación e Hidratación'), { target: { value: packageDataInitial.itineraryDetail.foodAndHydrationNotes } });
        fireEvent.change(screen.getByLabelText('Recomendaciones Generales'), { target: { value: packageDataInitial.itineraryDetail.generalRecommendations } });

        fireEvent.change(screen.getByPlaceholderText('URL de Imagen Principal'), { target: { value: packageDataInitial.imageDetails[0].url } });
        try {
            const secondaryImageInput = screen.getByPlaceholderText('URL de Imagen Secundaria #1');
            if (secondaryImageInput) {
                fireEvent.change(secondaryImageInput, { target: { value: packageDataInitial.imageDetails[1].url } });
            }
        } catch (e) { }

        fireEvent.click(screen.getByText('Actualizar Paquete'));

        const { imageDetails, id, itineraryDetail, basePrice, ...restOfInitialData } = packageDataInitial;

        const expectedImageObjects = (imageDetails || [])
            .filter(img => img.url.trim() !== '')
            .map(img => ({ url: img.url, principal: img.principal }));
    });

});
