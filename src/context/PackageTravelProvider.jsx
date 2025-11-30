import { PackageTravelContext } from './PackageTravelContext';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { apiGetPackagesPublic } from "../service/PackageTravelService.js";

export const PackageTravelProvider = ({ children }) => {

    const [packageTravel, setPackageTravel] = useState([]);


    const fireErrorAlert = () => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'No se pudo cargar los paquetes de viaje.',
            });
        } else {
            console.error('Error al cargar paquetes. (Swal no disponible)');
        }
    };

    const fetchPackageTravel = async () => {
        try {
            const data = await apiGetPackagesPublic();
            setPackageTravel(data);
        }
        catch (error) {
            fireErrorAlert();
            console.error(error);
        }
    };

    const addPackageTravel = (createdPackage) => {
        if (createdPackage && createdPackage.id) {
            setPackageTravel(prevPackages => [...prevPackages, createdPackage]);
        }
    };


    const updatePackageTravel = (updatedPackage) => {
        setPackageTravel(prevPackages => prevPackages.map(pkg =>
            pkg.id === updatedPackage.id ? updatedPackage : pkg
        ));
    };

    const removePackageTravel = (packageId) => {
        setPackageTravel(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId));
    };


    useEffect(() => {
        fetchPackageTravel();
    }, []);
    return (
        <PackageTravelContext.Provider value={{
            packageTravel,
            addPackageTravel,
            fetchPackageTravel,
            updatePackageTravel,
            removePackageTravel
        }}>
            {children}
        </PackageTravelContext.Provider>
    );
};