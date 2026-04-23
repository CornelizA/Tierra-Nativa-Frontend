import { PackageTravelContext } from './PackageTravelContext';
import { useEffect, useState, useCallback } from 'react';
import { apiGetMyFavorites } from '../service/PackageTravelService'
import Swal from 'sweetalert2';
import { apiGetPackages, apiGetCategories } from "../service/PackageTravelService.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export const PackageTravelProvider = ({ children }) => {

    const [packageTravel, setPackageTravel] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [categoryMap, setCategoryMap] = useState({});
    const [categories, setCategories] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    const [auth, setAuth] = useState(() => {
        try {
            const storedUser = sessionStorage.getItem('user');
            const token = sessionStorage.getItem('jwtToken');
            const user = storedUser ? JSON.parse(storedUser) : null;
            return { user, token, isAuthenticated: !!(token && user) };
        } catch {
            return { user: null, token: null, isAuthenticated: false };
        }
    });

    const login = useCallback((userData) => {
        const token = userData.jwtToken || userData.token;
        if (!token) return;
        const expiryTime = Date.now() + SIX_HOURS_MS;
        const simplifiedUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            email: userData.email
        };
        sessionStorage.setItem('jwtToken', token);
        sessionStorage.setItem('userRole', userData.role);
        sessionStorage.setItem('user', JSON.stringify(simplifiedUser));
        sessionStorage.setItem('token_expiry', expiryTime.toString());
        setAuth({ user: simplifiedUser, token, isAuthenticated: true });
    }, []);

    const logout = useCallback(() => {
        sessionStorage.clear();
        setAuth({ user: null, token: null, isAuthenticated: false });
        setFavoriteIds(new Set());
    }, []);

    useEffect(() => {
        const checkTokenExpiry = () => {
            const expiry = sessionStorage.getItem('token_expiry');
            const token = sessionStorage.getItem('jwtToken');
            if (token && expiry && Date.now() >= parseInt(expiry)) {
                logout();
                Swal.fire({
                    title: 'Sesión Finalizada',
                    text: 'Por seguridad, tu sesión se ha cerrado automáticamente.',
                    icon: 'info',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = '/home?session=expired';
                });
            }
        };
        const interval = setInterval(checkTokenExpiry, 1000);
        return () => clearInterval(interval);
    }, [logout]);

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
            const data = await apiGetPackages();
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
                const cats = await apiGetCategories();
                if (Array.isArray(cats)) {
                    setCategories(cats);
                    const map = {};
                    cats.forEach(c => { if (c && (c.id !== undefined)) map[c.id] = c.title || c.name || ''; });
                    setCategoryMap(map);
                }
            } catch {
            }
        };
        fetchCats();
    }, []);

    const syncFavorites = useCallback(async () => {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            setFavoriteIds(new Set());
            return;
        }
        try {
            setLoadingFavorites(true);
            const data = await apiGetMyFavorites();
            const ids = new Set(data.map(pkg => pkg.id));
            setFavoriteIds(ids);
        } catch {
        } finally {
            setLoadingFavorites(false);
        }
    }, []);

    const updateFavoriteInContext = (id, isFav) => {
        setFavoriteIds(prev => {
            const newSet = new Set(prev);
            if (isFav) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            syncFavorites();
        } else {
            setFavoriteIds(new Set());
        }
    }, [auth.isAuthenticated, syncFavorites]);

    return (
        <PackageTravelContext.Provider value={{
            packageTravel,
            isLoaded,
            categoryMap,
            setCategoryMap,
            categories,
            addPackageTravel,
            fetchPackageTravel,
            updatePackageTravel,
            removePackageTravel,
            favoriteIds,
            setFavoriteIds,
            updateFavoriteInContext,
            loadingFavorites,
            syncFavorites,
            auth,
            login,
            logout
        }}>
            {children}
        </PackageTravelContext.Provider>
    );
};
