import { PackageTravelContext } from './PackageTravelContext';
import {useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getAllPackages } from "../service/PackageTravelService.js"; 

export const PackageTravelProvider = ({children}) => {

    const [packageTravel, setPackageTravel] = useState([]);

    const fetchPackageTravel = async () => {

        try {
            const data = await getAllPackages(); 
            setPackageTravel(data);
        }
        catch (error) {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'No se pudo cargar los paquetes de viaje.',  
            });
            console.error(error);
        }
    };
    
    const addPackageTravel = async (newPackageData) => {
        try {
            
            setPackageTravel(prevPackages => [...prevPackages, createdPackage]);

            Swal.fire('¡Éxito!', 'Paquete guardado correctamente.', 'success');
        } catch (error) {
            Swal.fire('¡Error!', 'No se pudo guardar el paquete.', 'error');
        }
    };

    useEffect(() => {
        fetchPackageTravel();
    }, []);

    return (
        <PackageTravelContext.Provider value={{ 
            packageTravel, 
            addPackageTravel, 
            fetchPackageTravel 
        }}>
            {children}
        </PackageTravelContext.Provider>
    );
};