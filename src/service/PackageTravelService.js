import axios from "axios";
import Swal from 'sweetalert2';

const BASE_URL = 'http://localhost:8080';
const API_URL_PACKAGES = `${BASE_URL}/paquetes`;
const API_URL_AUTH = `${BASE_URL}/auth`;
const API_URL_ADMIN = `${BASE_URL}/admin`;
const API_URL_CATEGORY = `${BASE_URL}/categories`;
const API_URL_CHARACTERISTICS = `${BASE_URL}/characteristics`;

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (!error.config.url.includes('/auth/login')) {
                sessionStorage.clear();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/home') {
                    window.location.href = '/home?session=expired';
                }
            }
        }
        return Promise.reject(error);
    }
);

const getHeaders = (needsAuth = true) => {
    const headers = { 'Content-Type': 'application/json' };
    if (needsAuth) {
        const token = sessionStorage.getItem('jwtToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

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
                confirmButton: 'btn btn-outline-success border mx-2',
                cancelButton: 'btn btn-outline-danger border mx-2'
            },
            buttonsStyling: false
        };

        if (isConfirm) {
            return Swal.fire(config);
        }
        return Swal.fire(config);

    }
};

export const apiHandleErrorAlert = (error, defaultMessage) => {
    let message = defaultMessage;

    if (error.response && error.response.data) {
        const serverData = error.response.data;

        if (typeof serverData === 'object') {
            if (serverData.error) {
                message = serverData.error;
            } else if (serverData.message) {
                message = serverData.message;
            }
        } else if (typeof serverData === 'string' && serverData.length > 0) {
            message = serverData;
        }
    }
    if (message === defaultMessage && error.response) {
        const status = error.response.status;

        switch (status) {
            case 401:
                message = "Credenciales inválidas o sesión expirada.";
                break;
            case 403:
                message = "Acceso denegado. No tienes permisos para realizar esta acción.";
                break;
            case 404:
                message = "El recurso solicitado no fue encontrado.";
                break;
            case 409:
                message = "El correo electrónico ya está en uso.";
                break;
            case 500:
                message = "Error interno en el servidor de Tierra Nativa. Intente más tarde.";
                break;
            default:
                message = defaultMessage;
                break;
        }
    }
    if (!error.response && error.request) {
        message = "No se pudo conectar con el servidor. Revisa tu conexión a internet.";
    }
    fireAlert('Operación Fallida', message, 'error');

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
        const response = await axios.get(`${API_URL_PACKAGES}/admin`, { headers: getHeaders() });
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
            headers: getHeaders()
        });
        fireAlert('¡Éxito!', 'Paquete registrado correctamente.', 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al registrar el paquete.");
        throw error;
    }
};

export const apiUpdatePackage = async (id, packageData) => {
    const cleanId = typeof id === 'object' ? id.id : id;
    try {
        const response = await axios.put(`${API_URL_PACKAGES}/${cleanId}`, packageData, {
            headers: getHeaders()
        });
        fireAlert('¡Éxito!', 'Paquete actualizado correctamente.', 'success');
        return response.data || packageData;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al actualizar el paquete.");
        throw error;
    }
};

export const apiDeletePackage = async (packageId) => {
    const cleanId = typeof packageId === 'object' ? packageId.id : packageId;
    try {
        await axios.delete(`${API_URL_PACKAGES}/${cleanId}`, {
            headers: getHeaders()
        });
        fireAlert('¡Eliminado!', `Paquete con ID ${cleanId} eliminado.`, 'success');
        return true;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al eliminar el paquete con ID ${cleanId}.`);
        throw error;
    }
};

export const apiRegister = async (apiData) => {
    try {
        const response = await axios.post(`${API_URL_AUTH}/register`, apiData, {
            headers: getHeaders()
        });
        fireAlert('¡Registro Exitoso!', 'Se ha enviado un correo de verificación a tu dirección de correo. Por favor, verifica tu email para completar el registro.', 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al intentar registrar el usuario.');
        throw error;
    }
};

export const apiLogin = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL_AUTH}/login`, credentials, {
            headers: getHeaders()
        });
        const token = response.data.jwtToken || response.data.token;
        if (token) {
            sessionStorage.setItem('jwtToken', token);
            const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
            const expiryTime = Date.now() + SIX_HOURS_MS;
            sessionStorage.setItem('token_expiry', expiryTime.toString());
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
    sessionStorage.removeItem('token_expiry');
    return true;
};

export const apiGetAdminUsers = async () => {
    try {
        const response = await axios.get(API_URL_ADMIN, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        if (!error.response || error.response.status !== 403) {
            apiHandleErrorAlert(error, 'Error al obtener el listado de usuarios (Acceso ADMIN requerido).');
        }
        throw error;
    }
};

export const apiUpdateUserRole = async (emailToPromote, newRole) => {
    try {
        const payload = { email: emailToPromote, newRole };

        const response = await axios.put(`${API_URL_ADMIN}/role`, payload, {
            headers: getHeaders()
        });

        fireAlert('¡Éxito!', `Rol del usuario ${emailToPromote} actualizado a ${newRole}.`, 'success');
        return { success: true, data: response.data };
    } catch (error) {
        apiHandleErrorAlert(error, "Error al actualizar el rol.");
        throw error;
    }
};

export const apiGetCategories = async () => {
    try {
        const headers = getHeaders();
        const response = await axios.get(API_URL_CATEGORY, { headers });
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al obtener la lista de categorías del Administrador.');
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

export const apiGetCategoriesByCategory = async (categorySlug) => {

    try {
        const response = await axios.get(`${API_URL_CATEGORY}/categoria/${categorySlug.toUpperCase()}`);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al buscar los paquetes de la categoría ${categorySlug}.`);
        throw error;
    }
};

export const apiPostCategory = async (categoryData) => {
    try {
        const response = await axios.post(API_URL_CATEGORY, categoryData, {
            headers: getHeaders()
        });
        fireAlert('¡Categoría Creada!', `La categoría ${categoryData.title} ha sido registrada.`, 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al registrar la nueva categoría.");
        throw error;
    }
};

export const apiUpdateCategory = async (categoryData) => {
    try {
        const response = await axios.put(API_URL_CATEGORY, categoryData, {
            headers: getHeaders()
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
        await axios.delete(`${API_URL_CATEGORY}/${id}`, { headers: getHeaders() });
        fireAlert('¡Categoría Eliminada!', `Categoría con ID ${id} eliminada.`, 'success');
        return true;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al eliminar la categoría con ID ${id}.`);
        throw error;
    }
};

export const apiGetCharacteristicsPublic = async () => {
    try {
        const response = await axios.get(`${API_URL_CHARACTERISTICS}/public`);
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al obtener la lista de características.`);
        throw error;
    }
};

export const apiGetCharacteristics = async () => {
    try {
        const response = await axios.get(API_URL_CHARACTERISTICS, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al obtener la lista de características del Administrador.');
        throw error;
    }
};

export const apiPostCharacteristic = async (characteristicData) => {
    try {
        const response = await axios.post(API_URL_CHARACTERISTICS, characteristicData, {
            headers: getHeaders()
        });
        fireAlert('¡Característica Creada!', `La característica ${characteristicData.title} ha sido registrada.`, 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al registrar la nueva característica.");
        throw error;
    }
};

export const apiUpdateCharacteristic = async (characteristicData) => {
    try {
        const response = await axios.put(API_URL_CHARACTERISTICS, characteristicData, {
            headers: getHeaders()
        });
        fireAlert('¡Actualizada!', `Característica ${characteristicData.title} actualizada correctamente.`, 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, "Error al actualizar la característica.");
        throw error;
    }
};

export const apiDeleteCharacteristic = async (id) => {
    try {
        await axios.delete(`${API_URL_CHARACTERISTICS}/${id}`, { headers: getHeaders() });
        fireAlert('¡Característica Eliminada!', `Característica con ID ${id} eliminada.`, 'success');
        return true;
    } catch (error) {
        apiHandleErrorAlert(error, `Error al eliminar la característica con ID ${id}.`);
        throw error;
    }
};

export const apiResendVerificationEmail = async (email) => {
    try {
        const response = await axios.post(`${API_URL_AUTH}/resend-email`, { email }, {
            headers: getHeaders()
        });
        fireAlert('¡Enviado!', 'Se ha reenviado el correo de verificación.', 'success');
        return response.data;
    } catch (error) {
        apiHandleErrorAlert(error, 'Error al reenviar el correo de verificación.');
        throw error;
    }
};

export const apiVerifyEmail = async (token) => {
    try {
        const response = await axios.get(`${API_URL_AUTH}/verify-email`, {
            params: { token },
            headers: getHeaders()
        });
        fireAlert('¡Correo Verificado!', 'Tu correo ha sido verificado correctamente. Ahora puedes iniciar sesión.', 'success');
        return response.data;
    } catch (error) {
        let errorMessage = 'Error al verificar el correo. El enlace puede haber expirado.';
        if (error.response?.status === 400) {
            errorMessage = error.response?.data?.error || errorMessage;
        }
        fireAlert('Operación Fallida', errorMessage, 'error');
        throw error;
    }
};