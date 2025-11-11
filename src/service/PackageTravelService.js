import axios from "axios";
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080/paquetes';

const handleErrorAlert = (error, defaultMessage) => {
    let message = defaultMessage;

    if (error.response) {
        if (error.response.data && error.response.data.message) {
            message = error.response.data.message;
        }
    } else if (error.request) {
        message = "Error de conexión. Asegúrate de que el servidor está activo.";
    }

    Swal.fire({
        icon: 'error',
        title: 'Operación Fallida',
        text: message,
        confirmButtonText: 'Aceptar'
    });
};

export const apiGetPackages = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin`);
        return response.data;
    } catch (error) {
        handleErrorAlert(error, 'Error al obtener el listado de paquetes.');
        throw error;
    }
};

export const apiGetPackageById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        handleErrorAlert(error, `Error al obtener el paquete con ID ${id}.`);
        throw error;
    }
};
export const apiPostPackage = async (packageData) => {
    try {
        const response = await axios.post(API_URL, packageData, {
            headers: { 'Content-Type': 'application/json' }
        });
        Swal.fire('¡Éxito!', 'Paquete registrado correctamente.', 'success');
        return response.data;
    } catch (error) {
        handleErrorAlert(error, "Error al registrar el paquete.");
        throw error;
    }
};

export const apiUpdatePackage = async (packageData) => {
    try {
        const response = await axios.put(API_URL, packageData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data || packageData;
    } catch (error) {
        handleErrorAlert(error, "Error al actualizar el paquete.");
        throw error;
    }
};

export const apiDeletePackage = async (packageId) => {
    try {
        const response = await axios.delete(`${API_URL}/${packageId}`);

        Swal.fire('¡Eliminado!', `Paquete con ID ${packageId} eliminado.`, 'success');
        return response.data;
    } catch (error) {
        handleErrorAlert(error, `Error al eliminar el paquete con ID ${packageId}.`);
        throw error;
    }
};

export const apiGetPackageByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_URL}/categoria/${category}`);
        return response.data;
    } catch (error) {
        handleErrorAlert(error, `Error al buscar los paquetes de la categoría ${category}.`);
        throw error;
    }
};