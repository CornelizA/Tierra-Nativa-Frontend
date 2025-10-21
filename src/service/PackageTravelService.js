import axios from "axios";

const API_URL = 'http://localhost:8080/paquetes';

export const apiGetPackages = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los paquetes:", error);
        throw error;
    }
};

export const apiPostPackage = async (packageData) => {
    try {
        const response = await axios.post(API_URL, packageData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error("Error al registrar el paquete:", error);
        throw error;
    }
};

export const apiUpdatePackage = async (packageData) => {
    try {
        const response = await axios.put(API_URL, packageData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error("Error al actualizar el paquete:", error);
        throw error;
    }
};

export const apiDeletePackage = async (packageId) => {
    try {
        const response = await axios.delete(`${API_URL}/${packageId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el paquete con ID ${packageId}:`, error);
        throw error;
    }
};