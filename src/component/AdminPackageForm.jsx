import React, { useState } from 'react';
import { apiPostPackage, apiUpdatePackage } from '../service/PackageTravelService';
import '../style/AdminPackageForm.css';

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
    if (Array.isArray(pkg.images)) {
        imageDetails = pkg.images.map(img => ({
            url: img.url || img.imageUrl || '',
            principal: !!img.principal
        }));
    } else if (pkg.imageUrl) {
        imageDetails = [{ url: pkg.imageUrl, principal: true }];
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

    console.log('packageToEdit:', packageToEdit);

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
        setMessage(isEditing ? 'Actualizando...' : 'Registrando...');

        if (!formData.name || !formData.basePrice || !formData.destination) {
            setMessage('Error: Rellene al menos los campos principales.');
            return;
        }

        try {
            const dataToSend = {
                ...(isEditing && { id: formData.id }),
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                images: (formData.imageDetails || []).filter(img => img.url.trim() !== '')
            };
            delete dataToSend.imageDetails;
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
            setMessage(`Error al ${isEditing ? 'actualizar' : 'registrar'} el paquete.`);
            console.error('Error:', error);
        }
    };

    return (
        <div className="admin-form-container">

            <h2>{isEditing ? 'Editar Paquete Existente' : 'Registrar Nuevo Paquete de Viaje'}</h2>

            <button className="btn btn-secondary mb-3" onClick={onActionComplete}>
                &larr; Volver al Listado
            </button>

            {message && <p className="message-status">{message}</p>}

            <form onSubmit={handleSubmit} className="package-form">

                <h3>Información Básica</h3>
                <div className="form-group">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Paquete" required />
                </div>

                <div className="form-group">
                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Descripción Corta (máx 150 caracteres)" rows="2" required />
                </div>

                <div className="form-group-inline">
                    <input name="basePrice" type="number" value={formData.basePrice} onChange={handleChange} placeholder="Precio Base ($)" required />

                    <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destino (Ej: El Calafate, Jujuy)" required />
                </div>

                <div className="form-group">
                    <select name="category" value={formData.category} onChange={handleChange} required>
                        <option value="GEOPAISAJES">Geopaisajes</option>
                        <option value="AVENTURA">Aventura</option>
                        <option value="ECOTURISMO">Ecoturismo</option>
                        <option value="LITORAL">Litoral</option>
                        <option value="RELAJACION">Relajación</option>
                    </select>
                </div>


                <h3>Detalles del Itinerario (PackageItineraryDetail)</h3>
                <div className="form-group-inline">
                    <input name="duration" value={formData.itineraryDetail.duration} onChange={handleChange} placeholder="Duración (ej. 4 Días / 3 Noches)" />
                    <input name="lodgingType" value={formData.itineraryDetail.lodgingType} onChange={handleChange} placeholder="Tipo de Hospedaje" />
                </div>

                <div className="form-group">
                    <input name="transferType" value={formData.itineraryDetail.transferType} onChange={handleChange} placeholder="Tipo de Traslados (Ej: Vuelo a IGR, Bus, 4x4)" />
                </div>

                <div className="form-group">
                    <textarea name="dailyActivitiesDescription" value={formData.itineraryDetail.dailyActivitiesDescription} onChange={handleChange} placeholder="Planificación día por día (Actividades diarias)" rows="5" required />
                </div>

                <div className="form-group">
                    <textarea name="foodAndHydrationNotes" value={formData.itineraryDetail.foodAndHydrationNotes} onChange={handleChange} placeholder="Notas de Alimentación e Hidratación" rows="3" />
                </div>

                <div className="form-group">
                    <textarea name="generalRecommendations" value={formData.itineraryDetail.generalRecommendations} onChange={handleChange} placeholder="Recomendaciones Generales (Ropa, Dificultad, entre otros.)" rows="3" />
                </div>


                <h3>Imágenes del Paquete</h3>
                {(formData.imageDetails || []).map((img, index) => (
                    <div key={index} className="form-group-image">
                        <input
                            type="url"
                            value={img?.url || ''}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder={index === 0 ? "URL de Imagen Principal" : `URL de Imagen Secundaria #${index}`}
                            required={index === 0}
                        />
                        {index > 0 && (
                            <button type="button" onClick={() => handleRemoveImage(index)} className="btn-remove-image">
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={handleAddImage} className="btn-add-image">
                    + Añadir Imagen
                </button>

                <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-success'} mt-4`}>
                    {isEditing ? 'Actualizar Paquete' : 'Registrar Producto'}
                </button>
            </form>
        </div>
    );
};