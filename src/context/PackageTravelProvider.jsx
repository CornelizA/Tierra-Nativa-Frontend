import { PackageTravelContext } from './PackageTravelContext';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { apiGetPackagesPublic, apiGetCategoriesPublic } from "../service/PackageTravelService.js";

export const PackageTravelProvider = ({ children }) => {

    const [packageTravel, setPackageTravel] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [categoryMap, setCategoryMap] = useState({});


    const fireAlert = () => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'No se pudo cargar los paquetes de viaje.',
            });
        }
    };
    const fetchPackageTravel = async () => {
        setIsLoaded(false);
        try {
            const data = await apiGetPackagesPublic();
            const normalize = (raw) => {
                if (!raw) return [];
                const list = Array.isArray(raw) ? raw : (Array.isArray(raw.packages) ? raw.packages : []);

                const sanitizePackage = (pkg) => {
                    if (!pkg || typeof pkg !== 'object') return pkg;

                    const safeCharacteristics = Array.isArray(pkg.characteristics)
                        ? pkg.characteristics.map(c => {
                            if (!c || typeof c !== 'object') return c;
                            const { packages, ...cRest } = c;
                            return cRest;
                        })
                        : [];

                    const safeCategories = Array.isArray(pkg.categories) ? pkg.categories : [];
                    const images = Array.isArray(pkg.imageDetails) ? pkg.imageDetails : (Array.isArray(pkg.images) ? pkg.images : []);

                    const characteristicIds = Array.isArray(pkg.characteristicIds)
                        ? pkg.characteristicIds.map(Number)
                        : (Array.isArray(pkg.characteristics) ? pkg.characteristics.map(c => Number(c?.id ?? c)).filter(Boolean) : []);

                    const categoryId = Array.isArray(pkg.categoryId) ? pkg.categoryId : (pkg.categoryId ? [pkg.categoryId] : (pkg.category ? [Number(pkg.category)] : []));

                    return { ...pkg, characteristics: safeCharacteristics, categories: safeCategories, imageDetails: images, images, characteristicIds, categoryId };
                };

                return list.map(sanitizePackage);
            };

            const sanitized = normalize(data);
            setPackageTravel(sanitized);
        }
        catch (error) {
            if (error?.response?.status === 401) {
                setPackageTravel([]);
            } else {
                fireAlert();
            }
        }
        finally {
            setIsLoaded(true);
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
        const fetchCats = async () => {
            try {
                const cats = await apiGetCategoriesPublic();
                if (Array.isArray(cats)) {
                    const map = {};
                    cats.forEach(c => { if (c && (c.id !== undefined)) map[c.id] = c.title || c.name || ''; });
                    setCategoryMap(map);
                }
            } catch (e) {
                fireAlert('Failed to fetch categories map:', e);
            }
        };
        fetchCats();
    }, []);
    return (
        <PackageTravelContext.Provider value={{
            packageTravel,
            isLoaded,
            categoryMap,
            addPackageTravel,
            fetchPackageTravel,
            updatePackageTravel,
            removePackageTravel
        }}>
            {children}
        </PackageTravelContext.Provider>
    );
};