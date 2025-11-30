import axios from "axios";
import Swal from 'sweetalert2';

const BASE_URL = 'http://localhost:8080';
const API_URL_PACKAGES = `${BASE_URL}/paquetes`;
const API_URL_AUTH = `${BASE_URL}/auth`;
const API_URL_ADMIN = `${BASE_URL}/admin`;

const getAuthHeader = () => {
    const token = sessionStorage.getItem('jwtToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...getAuthHeader()
});

const jsonHeaders = () => ({
    'Content-Type': 'application/json'
});


export const fireAlert = (title, text, icon = 'info') => {
    if (typeof Swal !== 'undefined') {
        Swal.fire({ icon, title, text, confirmButtonText: 'Aceptar' });
    } else {
        console.log(`[ALERTA - ${icon.toUpperCase()}] ${title}: ${text}`);
    }
};

export const apiHandleErrorAlert = (error, defaultMessage) => {
    let message = defaultMessage;

    if (error.response) {
        if (error.response.status === 403) {
            const isPublicPackageRoute = error.config.url.includes(API_URL_PACKAGES) && !error.config.url.includes('/admin');

            if (isPublicPackageRoute) {
                message = "Error 403: La API REST está negando el acceso a la lista de paquetes públicos. Debes configurar tu servidor backend (Spring Security) para que permita el acceso sin autenticar a la ruta /paquetes.";
            } else {
                message = "Acceso denegado. No tienes permisos para realizar esta acción.";
            }
        } else if (error.response.data && error.response.data.message) {
            message = error.response.data.message;
        } else if (error.response.status === 404) {
            message = `Error 404: El recurso no fue encontrado en la ruta: ${error.config.url}`;
        } else if (error.response.status === 401) {
            message = "Error 401: Credenciales inválidas o token expirado.";
        }
    } else if (error.request) {
        message = "Error de conexión. Asegúrate de que el servidor está activo en localhost:8080.";
    }
    fireAlert('Operación Fallida', message, 'error');

    if (error.response && error.response.data) {
        throw {
            response: error.response,
            message: error.response.data.message || message,
            status: error.response.status
        };
    }
    throw error;
};

export const apiGetPackagesPublic = async () => {
    try {
        const response = await axios.get(API_URL_PACKAGES);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al obtener el listado de paquetes.');
        throw error;
    }
};

export const apiGetPackagesAdmin = async () => {
    try {
        const response = await axios.get(`${API_URL_PACKAGES}/admin`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al obtener el listado de paquetes (Acceso ADMIN).');
        throw error;
    }
};

export const apiGetPackageById = async (id) => {
    try {
        const response = await axios.get(`${API_URL_PACKAGES}/${id}`);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al obtener el paquete con ID ${id}.`);
        throw error;
    }
};

export const apiPostPackage = async (packageData) => {
    try {
        const response = await axios.post(API_URL_PACKAGES, packageData, {
            headers: jsonAuthHeaders()
        });
        fireAlert('¡Éxito!', 'Paquete registrado correctamente.', 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al registrar el paquete.");
        throw error;
    }
};

export const apiUpdatePackage = async (packageData) => {
    try {
        const response = await axios.put(API_URL_PACKAGES, packageData, {
            headers: jsonAuthHeaders()
        });
        fireAlert('¡Éxito!', 'Paquete actualizado correctamente.', 'success');
        return response.data || packageData;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al actualizar el paquete.");
        throw error;
    }
};

export const apiDeletePackage = async (packageId) => {
    try {
        await axios.delete(`${API_URL_PACKAGES}/${packageId}`, { headers: getAuthHeader() });

        fireAlert('¡Eliminado!', `Paquete con ID ${packageId} eliminado.`, 'success');
        return true;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al eliminar el paquete con ID ${packageId}.`);
        throw error;
    }
};

export const apiGetPackageByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_URL_PACKAGES}/categoria/${category}`);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al buscar los paquetes de la categoría ${category}.`);
        throw error;
    }
};

export const apiRegister = async (apiData) => {
    try {
        const response = await axios.post(`${API_URL_AUTH}/register`, apiData, {
            headers: jsonHeaders()
        });

        fireAlert('¡Registro Exitoso!', 'Bienvenido a Tierra Nativa', 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al intentar registrar el usuario.');
        throw error;
    }
};

export const apiLogin = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL_AUTH}/login`, credentials, {
            headers: jsonHeaders()
        });
        const token = response.data.jwtToken;
        if (token) {
            sessionStorage.setItem('jwtToken', token);
        }

        fireAlert('¡Bienvenido!', 'Sesión iniciada correctamente', 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Credenciales inválidas. Por favor, verifica tu email y contraseña.');
        throw error;
    }
};

export const apiLogout = () => {
    sessionStorage.removeItem('jwtToken');
    return true;
};

export const apiGetAdminUsers = async () => {
    try {
        const response = await axios.get(API_URL_ADMIN, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        if (!error.response || error.response.status !== 403) {
            apiHandleErrorAlert(error, 'Error al obtener el listado de usuarios (Acceso ADMIN requerido).');
        }
        throw error;
    }
}
export const apiUpdateUserRole = async (emailToPromote, newRole) => {
    try {
        const payload = { email: emailToPromote, newRole };

        const response = await axios.put(`${API_URL_ADMIN}/role`, payload, {
            headers: jsonAuthHeaders()
        });

        fireAlert('¡Éxito!', `Rol del usuario ${emailToPromote} actualizado a ${newRole}.`, 'success');
        return { success: true, data: response.data };
    } catch (error) {
        throw error;
    }
};