import axios from "axios";

const API_URL = 'http://localhost:8081/paquetes'; 

export const getAllPackages = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; 
    } catch (error) {
        console.error("Error al obtener los paquetes:", error);
        throw error;
    }
};

export const savePackage = async (packageData) => {
    try {
        const response = await axios.post(API_URL, packageData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error("Error al guardar el paquete:", error);
        throw error;
    }
};
