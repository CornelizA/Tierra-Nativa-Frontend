import React, { useState } from 'react';
import { apiPostPackage, apiUpdatePackage } from '../service/PackageTravelService';
import '../style/AdminPackageForm.css';
import { Plus, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export const initialFormData = {
    name: '',
    shortDescription: '',
    basePrice: '',
    destination: '',
    category: 'GEOPAISAJES',
    itineraryDetail: {
        duration: '',
        lodgingType: '',
        transferType: '',
        dailyActivitiesDescription: '',
        foodAndHydrationNotes: '',
        generalRecommendations: ''
    },
    imageDetails: [{ url: '', principal: true }],
};

function mapPackageToFormData(pkg) {
    let imageDetails = [];

    if (Array.isArray(pkg.images) && pkg.images.length > 0) {
        imageDetails = pkg.images.map((img, i) => ({
            url: img.url || '',
            principal: i === 0
        }));
    } else {
        imageDetails = [{ url: '', principal: true }];
    }

    return {
        id: pkg.id,
        ...initialFormData,
        ...pkg,
        itineraryDetail: {
            ...initialFormData.itineraryDetail,
            ...(pkg.itineraryDetail || {})
        },
        imageDetails
    };
}

export const AdminPackageForm = ({ packageToEdit, onActionComplete }) => {

    const [formData, setFormData] = useState(() => {
        if (packageToEdit) {
            return mapPackageToFormData(packageToEdit);
        }
        return initialFormData;
    });

    const isEditing = formData.id != null;
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) { errors.name = 'El nombre del paquete es obligatorio.'; }
        if (!formData.shortDescription.trim()) { errors.shortDescription = 'La descripción corta es obligatoria.'; }
        const basePriceValue = parseFloat(formData.basePrice);
        if (!formData.basePrice || isNaN(basePriceValue) || basePriceValue <= 0) {
            errors.basePrice = 'El precio base es obligatorio y debe ser un número positivo.';
        }
        if (!formData.destination.trim()) { errors.destination = 'El destino es obligatorio.'; }

        const itinerary = formData.itineraryDetail;
        if (!itinerary.duration.trim()) { errors.duration = 'La duración del viaje es obligatoria.'; }
        if (!itinerary.lodgingType.trim()) { errors.lodgingType = 'El tipo de hospedaje es obligatorio.'; }
        if (!itinerary.transferType.trim()) { errors.transferType = 'El tipo de traslado es obligatorio.'; }
        if (!itinerary.dailyActivitiesDescription.trim()) { errors.dailyActivitiesDescription = 'La planificación día por día es obligatoria.'; }
        if (!itinerary.foodAndHydrationNotes.trim()) { errors.foodAndHydrationNotes = 'Las notas de alimentación son obligatorias.'; }
        if (!itinerary.generalRecommendations.trim()) { errors.generalRecommendations = 'Las recomendaciones generales son obligatorias.'; }

        const principalImage = (formData.imageDetails || []).find((img, i) => i === 0);
        if (!principalImage || !principalImage.url.trim()) {
            errors.imageDetails = 'Debe proporcionar la URL de la Imagen Principal.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in initialFormData.itineraryDetail) {
            setFormData(prev => ({
                ...prev,
                itineraryDetail: {
                    ...prev.itineraryDetail,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = (formData.imageDetails || []).map((img, i) => {
            if (i === index) {
                return {
                    ...img,
                    url: value,
                    principal: i === 0
                };
            }
            return img;
        });
        setFormData({ ...formData, imageDetails: newImages });
    };

    const handleAddImage = () => {
        const currentImages = formData.imageDetails || [];

        setFormData({
            ...formData,
            imageDetails: [
                ...currentImages,
                { url: '', principal: false }
            ]
        });
    };

    const handleRemoveImage = (index) => {
        if (index === 0) return;

        const newImages = formData.imageDetails.filter((_, i) => i !== index);
        setFormData({ ...formData, imageDetails: newImages });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (!isValid) {
            Swal.fire({
                icon: 'warning',
                title: 'Validación Incompleta',
                text: 'Por favor, revise y complete todos los campos obligatorios marcados.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        Swal.fire({
            title: isEditing ? 'Actualizando Paquete...' : 'Registrando Paquete...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { imageDetails, id, ...restOfFormData } = formData;

            const dataToSend = {
                ...(isEditing && { id: id }),
                ...restOfFormData,
                basePrice: parseFloat(restOfFormData.basePrice),
                images: (imageDetails || [])
                    .filter(img => img.url.trim() !== '')
                    .map(img => ({
                        url: img.url,
                        principal: img.principal
                    }))
            };

            let response;

            if (isEditing) {
                response = await apiUpdatePackage(dataToSend);
            } else {
                response = await apiPostPackage(dataToSend);
            }

            Swal.fire({
                icon: 'success',
                title: '¡Operación Exitosa!',
                text: `Paquete "${response.name}" ${isEditing ? 'actualizado' : 'registrado'} con éxito.`,
                showConfirmButton: false,
                timer: 2000
            });

            setTimeout(onActionComplete, 1500);
        }
        catch (error) {
            Swal.close();

            let displayErrorTitle = `Error al ${isEditing ? 'Actualizar' : 'Registrar'} Paquete`;
            let displayErrorMessage = `Ha ocurrido un error inesperado. Por favor, verifique el servidor o intente más tarde.`;

            const errorResponse = error.response;
            const status = errorResponse?.status;
            const errorBody = errorResponse?.data;

            if (status === 409) {

                const apiMessage = typeof errorBody === 'string' ? errorBody : (errorBody?.message || '');

                if (apiMessage.toLowerCase().includes('nombre') && apiMessage.toLowerCase().includes('ya está en uso')) {
                    displayErrorTitle = 'Nombre Duplicado (409)';
                    displayErrorMessage = `El nombre "${formData.name.trim()}" ya está en uso. Por favor, elija otro nombre para el paquete.`;

                    setValidationErrors(prevErrors => ({ ...prevErrors, name: displayErrorMessage }));
                } else {
                    displayErrorMessage = apiMessage || displayErrorMessage;
                }
            }

            else if (errorBody) {
                displayErrorMessage = typeof errorBody === 'string' ? errorBody : (errorBody.message || JSON.stringify(errorBody));
            }

            Swal.fire({
                icon: 'error',
                title: displayErrorTitle,
                text: displayErrorMessage,
                confirmButtonText: 'Entendido'
            });
        }
    };

    return (
        <div className="admin-form-container">

            <h2>{isEditing ? 'Editar Paquete Existente' : 'Registrar Nuevo Paquete de Viaje'}</h2>

            <button
                type="button"
                className="btn btn-back-to-list mb-3"
                onClick={onActionComplete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
                <ArrowLeft size={18} />
                Volver al Listado
            </button>

            <form onSubmit={handleSubmit} className="package-form">

                <h3>Información Básica</h3>
                <div className="form-group">
                    <label htmlFor="name">Nombre del Paquete</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Paquete" className={validationErrors.name ? 'input-error' : ''} />
                    {validationErrors.name && <p className="validation-error">{validationErrors.name}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="shortDescription">Descripción Corta</label>
                    <textarea id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Descripción Corta (máx 150 caracteres)" rows="2" className={validationErrors.shortDescription ? 'input-error' : ''} />
                    {validationErrors.shortDescription && <p className="validation-error">{validationErrors.shortDescription}</p>}
                </div>

                <div className="form-group-inline">
                    <div className="form-group-half">
                        <label htmlFor="basePrice">Precio Base ($)</label>
                        <input id="basePrice" name="basePrice" type="number" value={formData.basePrice} onChange={handleChange} placeholder="Precio Base ($)" className={validationErrors.basePrice ? 'input-error' : ''} />
                        {validationErrors.basePrice && <p className="validation-error">{validationErrors.basePrice}</p>}
                    </div>
                    <div className="form-group-half">
                        <label htmlFor="destination">Destino</label>
                        <input id="destination" name="destination" value={formData.destination} onChange={handleChange} placeholder="Destino (Ej: El Calafate, Jujuy)" className={validationErrors.destination ? 'input-error' : ''} />
                        {validationErrors.destination && <p className="validation-error">{validationErrors.destination}</p>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="category">Categoría</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className={validationErrors.category ? 'input-error' : ''} >
                        <option value="GEOPAISAJES">Geopaisajes</option>
                        <option value="AVENTURA">Aventura</option>
                        <option value="ECOTURISMO">Ecoturismo</option>
                        <option value="LITORAL">Litoral</option>
                        <option value="RELAJACION">Relajación</option>
                    </select>
                    {validationErrors.category && <p className="validation-error">{validationErrors.category}</p>}
                </div>

                <h3>Detalles del Itinerario </h3>
                <div className="form-group-inline">
                    <div className="form-group-half">
                        <label htmlFor="duration">Duración</label>
                        <input id="duration" name="duration" value={formData.itineraryDetail.duration} onChange={handleChange} placeholder="Duración (ej. 4 Días / 3 Noches)" className={validationErrors.duration ? 'input-error' : ''} />
                        {validationErrors.duration && <p className="validation-error">{validationErrors.duration}</p>}
                    </div>
                    <div className="form-group-half">
                        <label htmlFor="lodgingType">Tipo de Hospedaje</label>
                        <input id="lodgingType" name="lodgingType" value={formData.itineraryDetail.lodgingType} onChange={handleChange} placeholder="Tipo de Hospedaje" className={validationErrors.lodgingType ? 'input-error' : ''} />
                        {validationErrors.lodgingType && <p className="validation-error">{validationErrors.lodgingType}</p>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="transferType">Tipo de Traslados</label>
                    <input id="transferType" name="transferType" value={formData.itineraryDetail.transferType} onChange={handleChange} placeholder="Tipo de Traslados (Ej: Vuelo a IGR, Bus, 4x4)" className={validationErrors.transferType ? 'input-error' : ''} />
                    {validationErrors.transferType && <p className="validation-error">{validationErrors.transferType}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="dailyActivitiesDescription">Planificación día por día</label>
                    <textarea id="dailyActivitiesDescription" name="dailyActivitiesDescription" value={formData.itineraryDetail.dailyActivitiesDescription} onChange={handleChange} placeholder="Planificación día por día (Actividades diarias)" rows="5" className={validationErrors.dailyActivitiesDescription ? 'input-error' : ''} />
                    {validationErrors.dailyActivitiesDescription && <p className="validation-error">{validationErrors.dailyActivitiesDescription}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="foodAndHydrationNotes">Notas de Alimentación e Hidratación</label>
                    <textarea id="foodAndHydrationNotes" name="foodAndHydrationNotes" value={formData.itineraryDetail.foodAndHydrationNotes} onChange={handleChange} placeholder="Notas de Alimentación e Hidratación" rows="3" className={validationErrors.foodAndHydrationNotes ? 'input-error' : ''} />
                    {validationErrors.foodAndHydrationNotes && <p className="validation-error">{validationErrors.foodAndHydrationNotes}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="generalRecommendations">Recomendaciones Generales</label>
                    <textarea id="generalRecommendations" name="generalRecommendations" value={formData.itineraryDetail.generalRecommendations} onChange={handleChange} placeholder="Recomendaciones Generales (Ropa, Dificultad, entre otros.)" rows="3" className={validationErrors.generalRecommendations ? 'input-error' : ''} />
                    {validationErrors.generalRecommendations && <p className="validation-error">{validationErrors.generalRecommendations}</p>}
                </div>

                <h3>Imágenes del Paquete</h3>
                {(formData.imageDetails || []).map((img, index) => (
                    <div key={index} className="form-group-image">
                        <input
                            type="url"
                            value={img?.url || ''}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder={index === 0 ? "URL de Imagen Principal" : `URL de Imagen Secundaria #${index}`}
                            className={index === 0 && validationErrors.imageDetails ? 'input-error' : ''}
                        />
                        {index > 0 && (
                            <button type="button" onClick={() => handleRemoveImage(index)} className="btn-remove-image">
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}
                {validationErrors.imageDetails && <p className="validation-error">{validationErrors.imageDetails}</p>}

                <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn-add-image"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    <Plus size={18} />
                    Añadir Imagen
                </button>
                <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-success'} mt-4`}>
                    {isEditing ? 'Actualizar Paquete' : 'Registrar Producto'}
                </button>
            </form>
        </div>
    );
};