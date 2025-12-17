import axios from "axios";
import Swal from 'sweetalert2';

const BASE_URL = 'http://localhost:8080';
const API_URL_PACKAGES = `${BASE_URL}/paquetes`;
const API_URL_AUTH = `${BASE_URL}/auth`;
const API_URL_ADMIN = `${BASE_URL}/admin`;
const API_URL_CATEGORY = `${BASE_URL}/categories`;

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


// export const fireAlert = (title, text, icon = 'info') => {
//     if (typeof Swal !== 'undefined') {
//         Swal.fire({ icon, title, text, confirmButtonText: 'Aceptar' });
//     } else {
//         console.log(`[ALERTA - ${icon.toUpperCase()}] ${title}: ${text}`);
//     }
// };
export const fireAlert = (title, text, icon = 'info', isConfirm = false) => {
    if (typeof Swal !== 'undefined') {
        const config = { 
            icon, 
            title, 
            text, 
            confirmButtonText: 'Aceptar',
            showCancelButton: isConfirm,
            cancelButtonText: 'Cancelar',
            reverseButtons: true, 
            customClass: {
                confirmButton: 'btn btn-danger mx-2', 
                cancelButton: 'btn btn-secondary mx-2'
            },
            buttonsStyling: false 
        };

        if (isConfirm) {
            return Swal.fire(config);
        }
        
        Swal.fire(config);
    } else {
        console.log(`[ALERTA - ${icon.toUpperCase()}] ${title}: ${text}`);
    }
    return { isConfirmed: false };
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

export const apiGetCategoriesByCategory = async (categorySlug) => {

    try {
        const response = await axios.get(`${API_URL_CATEGORY}/categoria/${categorySlug.toUpperCase()}`);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al buscar los paquetes de la categoría ${categorySlug}.`);
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

export const apiGetCategories = async () => {
    try {
        const headers = getAuthHeader();
        const response = await axios.get(API_URL_CATEGORY, { headers });
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al obtener la lista de categorías del Administrador. (Revisa si tienes un token de ADMIN válido)');
        throw error;
    }
};

export const apiGetCategoriesPublic = async () => {
    try {
        const response = await axios.get(`${API_URL_CATEGORY}/public`);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al obtener la lista de categorías.`);
        throw error;
    }
};

export const apiPostCategory = async (categoryData) => {
    try {
        const response = await axios.post(API_URL_CATEGORY, categoryData, {
            headers: jsonAuthHeaders()
        });
        fireAlert('¡Categoría Creada!', `La categoría ${categoryData.title} ha sido registrada.`, 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al registrar la nueva categoría. Verifica que el título no esté duplicado.");
        throw error;
    }
};


export const apiUpdateCategory = async (categoryData) => {
    try {
        const response = await axios.put(API_URL_CATEGORY, categoryData, {
            headers: jsonAuthHeaders()
        });
        fireAlert('¡Actualizada!', `Categoría ${categoryData.title} actualizada correctamente.`, 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al actualizar la categoría.");
        throw error;
    }
};


export const apiDeleteCategory = async (id) => {
    try {
        await axios.delete(`${API_URL_CATEGORY}/${id}`, { headers: getAuthHeader() });
        fireAlert('¡Categoría Eliminada!', `Categoría con ID ${id} eliminada.`, 'success');
        return true;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al eliminar la categoría con ID ${id}.`);
        throw error;
    }
};