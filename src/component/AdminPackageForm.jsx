import React, { useState } from 'react';
import { apiPostPackage, apiUpdatePackage } from '../service/PackageTravelService';
import '../style/AdminPackageForm.css';
import { Plus, ArrowLeft } from 'lucide-react';

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
        imageDetails = pkg.images.map(img => ({
            url: img.url || '',
            principal: !!img.principal
        }));
    }
    else if (pkg.imageUrl) {
        imageDetails = [{ url: pkg.imageUrl, principal: true }];
    }
    else {
        imageDetails = [{ url: '', principal: true }];
    }

    return {
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

    const [message, setMessage] = useState('');
    const isEditing = formData.id != null;
    const [validationErrors, setValidationErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'El nombre del paquete es obligatorio.';
        }
        if (!formData.shortDescription.trim()) {
            errors.shortDescription = 'La descripción corta es obligatoria.';
        }
        if (!formData.basePrice || isNaN(parseFloat(formData.basePrice))) {
            errors.basePrice = 'El precio base es obligatorio y debe ser un número.';
        }
        if (!formData.destination.trim()) {
            errors.destination = 'El destino es obligatorio.';
        }
        if (!formData.itineraryDetail.duration.trim()) {
            errors.duration = 'La duración del viaje es obligatoria.';
        }
        if (!formData.itineraryDetail.lodgingType.trim()) {
            errors.lodgingType = 'El tipo de hospedaje es obligatorio.';
        }
        if (!formData.itineraryDetail.transferType.trim()) {
            errors.transferType = 'El tipo de traslado es obligatorio.';
        }
        if (!formData.itineraryDetail.dailyActivitiesDescription.trim()) {
            errors.dailyActivitiesDescription = 'La planificación día por día es obligatoria.';
        }
        if (!formData.itineraryDetail.foodAndHydrationNotes.trim()) {
            errors.foodAndHydrationNotes = 'Las notas de alimentación son obligatorias.';
        }
        if (!formData.itineraryDetail.generalRecommendations.trim()) {
            errors.generalRecommendations = 'Las recomendaciones generales son obligatorias.';
        }

        const principalImage = (formData.imageDetails || []).find(img => img.principal);
        if (!principalImage || !principalImage.url.trim()) {
            errors.imageDetails = 'Debe proporcionar la URL de la Imagen Principal.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (formData.itineraryDetail && (name in formData.itineraryDetail)) {
            setFormData({
                ...formData,
                itineraryDetail: {
                    ...formData.itineraryDetail,
                    [name]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = formData.imageDetails.map((img, i) => {
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
            setMessage('Error de validación: Revise los campos marcados en rojo.');
            setShowModal(true);
            return;
        }
        setMessage(isEditing ? 'Actualizando...' : 'Registrando...');
        setValidationErrors({});
        setShowModal(false);


        try {

            const { imageDetails, ...restOfFormData } = formData;

            const dataToSend = {
                ...(isEditing && { id: restOfFormData.id }),
                ...restOfFormData,
                basePrice: parseFloat(restOfFormData.basePrice) || 0,
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
                setMessage(`Paquete "${response.name}" actualizado con éxito!`);
            } else {
                response = await apiPostPackage(dataToSend);
                setMessage(`Paquete "${response.name}" registrado con éxito!`);
            }
            setTimeout(onActionComplete, 1500);

        } catch (error) {
            setMessage(`Error al ${isEditing ? 'actualizar' : 'registrar'} el paquete. Verifique los datos o el servidor.`);
            const errorData = error.response?.data || error;

            if (errorData.message && errorData.message.includes('ya está en uso')) {
                errorMessage = `Error: El nombre "${formData.name.trim()}" ya está en uso. Por favor, elija otro.`;

                setValidationErrors(prevErrors => ({ ...prevErrors, name: errorMessage }));

            } else if (errorData.message) {
                errorMessage = `Error de API: ${errorData.message}`;
            }
            setMessage(errorMessage);
            setShowModal(true);
            console.error('Error de API:', error);
        }
    };

    return (
        <div className="admin-form-container">

            {showModal && (
                <div className="validation-modal-overlay">
                    <div className="validation-modal">
                        <div className={`message-status error-status`}>
                            {message}
                            <button className="close-modal-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                    </div>
                </div>
            )}
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
            {message && (
                <div className={`message-status ${message.startsWith('Error') ? 'error-status' : 'success-status'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} className="package-form">

                <h3>Información Básica</h3>
                <div className="form-group">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Paquete" className={validationErrors.name ? 'input-error' : ''} />
                </div>
                {validationErrors.name && <p className="validation-error">{validationErrors.name}</p>}
                <div className="form-group">
                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Descripción Corta (máx 150 caracteres)" rows="2" className={validationErrors.shortDescription ? 'input-error' : ''} />
                </div>
                {validationErrors.shortDescription && <p className="validation-error">{validationErrors.shortDescription}</p>}

                <div className="form-group-inline">
                    <input name="basePrice" type="number" value={formData.basePrice} onChange={handleChange} placeholder="Precio Base ($)" className={validationErrors.basePrice ? 'input-error' : ''} />
                    <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destino (Ej: El Calafate, Jujuy)" className={validationErrors.destination ? 'input-error' : ''} />
                </div>
                {validationErrors.basePrice && <p className="validation-error">{validationErrors.basePrice}</p>}
                {validationErrors.destination && <p className="validation-error">{validationErrors.destination}</p>}

                <div className="form-group">
                    <select name="category" value={formData.category} onChange={handleChange} >
                        <option value="GEOPAISAJES">Geopaisajes</option>
                        <option value="AVENTURA">Aventura</option>
                        <option value="ECOTURISMO">Ecoturismo</option>
                        <option value="LITORAL">Litoral</option>
                        <option value="RELAJACION">Relajación</option>
                    </select>
                </div>
                {validationErrors.category && <p className="validation-error">{validationErrors.category}</p>}

                <h3>Detalles del Itinerario </h3>
                <div className="form-group-inline">
                    <input name="duration" value={formData.itineraryDetail.duration} onChange={handleChange} placeholder="Duración (ej. 4 Días / 3 Noches)" className={validationErrors.duration ? 'input-error' : ''} />
                    <input name="lodgingType" value={formData.itineraryDetail.lodgingType} onChange={handleChange} placeholder="Tipo de Hospedaje" className={validationErrors.lodgingType ? 'input-error' : ''} />
                </div>
                {validationErrors.duration && <p className="validation-error">{validationErrors.duration}</p>}
                {validationErrors.lodgingType && <p className="validation-error">{validationErrors.lodgingType}</p>}

                <div className="form-group">
                    <input name="transferType" value={formData.itineraryDetail.transferType} onChange={handleChange} placeholder="Tipo de Traslados (Ej: Vuelo a IGR, Bus, 4x4)" className={validationErrors.transferType ? 'input-error' : ''} />
                </div>
                {validationErrors.transferType && <p className="validation-error">{validationErrors.transferType}</p>}

                <div className="form-group">
                    <textarea name="dailyActivitiesDescription" value={formData.itineraryDetail.dailyActivitiesDescription} onChange={handleChange} placeholder="Planificación día por día (Actividades diarias)" rows="5" className={validationErrors.dailyActivitiesDescription ? 'input-error' : ''} />
                </div>
                {validationErrors.dailyActivitiesDescription && <p className="validation-error">{validationErrors.dailyActivitiesDescription}</p>}
                <div className="form-group">
                    <textarea name="foodAndHydrationNotes" value={formData.itineraryDetail.foodAndHydrationNotes} onChange={handleChange} placeholder="Notas de Alimentación e Hidratación" rows="3" className={validationErrors.foodAndHydrationNotes ? 'input-error' : ''} />
                </div>
                {validationErrors.foodAndHydrationNotes && <p className="validation-error">{validationErrors.foodAndHydrationNotes}</p>}
                <div className="form-group">
                    <textarea name="generalRecommendations" value={formData.itineraryDetail.generalRecommendations} onChange={handleChange} placeholder="Recomendaciones Generales (Ropa, Dificultad, entre otros.)" rows="3" className={validationErrors.generalRecommendations ? 'input-error' : ''} />
                </div>
                {validationErrors.generalRecommendations && <p className="validation-error">{validationErrors.generalRecommendations}</p>}

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