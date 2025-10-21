import { PackageTravelContext } from './PackageTravelContext';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { apiGetPackages } from "../service/PackageTravelService.js";

export const PackageTravelProvider = ({ children }) => {

    const [packageTravel, setPackageTravel] = useState([]);

    const fetchPackageTravel = async () => {

        try {
            const data = await apiGetPackages();
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