import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiGetCategoriesByCategory, fireAlert } from '../service/PackageTravelService';
import { PackageTravelCard } from '../component/PackageTravelCard';
import { MapPin, RefreshCcw } from 'lucide-react';
import { Link } from "react-router-dom";

import '../style/CategoryPackagesPage.css';

const FALLBACK_CARD_URL = 'https://placehold.co/400x300/1E3A8A/FFFFFF?text=TierraNativa+Tour';
const FALLBACK_CATEGORY_IMAGE = 'https://placehold.co/600x400/E5E7EB/4B5563?text=Imagen+de+Categoria+No+Disponible';

const initialCategoryInfo = {
    title: '',
    description: 'Cargando descripción de la categoría...',
    imageUrl: FALLBACK_CATEGORY_IMAGE,
};

export const CategoryPackagesPage = () => {

    const { categorySlug } = useParams();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryInfo, setCategoryInfo] = useState(initialCategoryInfo);

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        const lower = string.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };


    const displayTitle = capitalizeFirstLetter(categoryInfo.title);

    const fetchPackages = useCallback(async (slug) => {
        if (!slug || slug === 'undefined') {
            setLoading(false);
            setError("No se pudo identificar la categoría (slug ausente).");
            return;
        }

        setLoading(true);
        setError(null);
        setPackages([]);

        try {
            const apiFilterKey = typeof slug === 'string' ? slug.trim().toLowerCase() : slug;
            const response = await apiGetCategoriesByCategory(apiFilterKey);

            if (Array.isArray(response)) {
                setPackages(response);
                setError(`El servicio solo devolvió la lista de paquetes para "${capitalizeFirstLetter(slug)}" (o la lista está vacía). Faltan la imagen y la descripción de la categoría.`);
                setCategoryInfo(prev => ({
                    ...prev,
                    description: 'Error del servicio: Los detalles completos de la categoría (descripción e imagen) no fueron devueltos por el servidor.',
                }));
            }

            else if (typeof response === 'object' && response !== null) {
                if (response.categoryDetails) {
                    setCategoryInfo(prev => ({
                        ...prev,
                        title: response.categoryDetails.title || capitalizeFirstLetter(slug),
                        description: response.categoryDetails.description || 'Descripción no disponible.',
                        imageUrl: response.categoryDetails.imageUrl || FALLBACK_CATEGORY_IMAGE,
                    }));
                } else {
                    setCategoryInfo(prev => ({
                        ...prev,
                        description: 'Descripción de la categoría pendiente de carga o no disponible en el servicio.',
                    }));
                }
                setPackages(response.packages || []);
            } else {
                setError(`Respuesta de la API inesperada para "${capitalizeFirstLetter(slug)}".`);
                setPackages([]);
            }

        } catch (err) {
            if (err && err.response && err.response.status === 401) {
                setError('Error 401: Acceso no autorizado. Inicia sesión como administrador si intentas acceder a datos restringidos.');
            } else {
                setError(`No se pudieron cargar los paquetes para la categoría "${capitalizeFirstLetter(slug)}".`);
            }
            setPackages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (categorySlug) {
            setLoading(true);
            setCategoryInfo(prev => ({
                ...initialCategoryInfo,
                title: capitalizeFirstLetter(categorySlug),
            }));

            fetchPackages(categorySlug);
        } else {
            setLoading(false);
            setError("Categoría no especificada. Por favor, regrese a la página de categorías.");
        }
    }, [categorySlug, fetchPackages]);

    return (
        <div className="container-category bg-gray-50">
            <div className="background-category w-full h-screen flex overflow-hidden"
                style={{
                    backgroundImage: `url(${categoryInfo.imageUrl})`,
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                <div className="relative text-center p-6 max-w-4xl mx-auto z-10">
                    <h1 className="display-title text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-lg [text-shadow:0_4px_6px_rgba(0,0,0,0.5)]">
                        <MapPin size={48} className="mr-4 text-blue-300 inline-block align-middle" />
                        {displayTitle}
                    </h1>
                </div>

                {!loading && !error && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">

                        <div className="bg-black/40 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl  mx-auto">
                            <p className="category-description md:text-2xl text-gray-100 leading-relaxed font-light italic">
                                {categoryInfo.description}
                            </p>
                        </div>

                        {packages.length === 0 && (
                            <div className="error-message text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 max-w-2xl mx-auto">
                                <p className="text-2xl text-white font-bold">
                                    ¡Parece que aún no hay paquetes en la categoría "{displayTitle}"!
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => fetchPackages(categorySlug)}
                            disabled={loading}
                            className="btn btn-light mx-auto flex items-center justify-center mt-[7vh] "
                        >
                            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Cargando...' : 'Recargar Paquetes'}
                        </button>
                    </div>
                )}

            </div>

            {loading && (
                <div className="load-text text-center p-10 bg-white rounded-xl shadow-lg mt-10">
                    <p className="text-xl text-blue-500 font-semibold">Cargando paquetes y detalles de la categoría {displayTitle}</p>
                </div>
            )}

            {error && (
                <div className="text-center p-10 bg-red-50 border border-red-300 rounded-xl shadow-lg mt-10">
                    <p className="text-xl text-red-700 font-semibold">{error}</p>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Para ver esta información necesitas iniciar sesión con una cuenta con permisos adecuados.</p>
                        <Link to="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Ir a Iniciar Sesión</Link>
                    </div>
                </div>
            )}

            {packages.length > 0 && (
                <div className="packages-section mt-8">
                    <h2 className="package-text text-4xl font-extrabold">
                        Nuestras Propuestas
                        <p className='package-paragraph'>Encontramos {packages.length} experiencias para ti</p>
                    </h2>

                    <div className="package-card row">
                        {packages.map((pkg) => {

                            const cardCategories = (Array.isArray(pkg.categories) && pkg.categories.length > 0)
                                ? pkg.categories
                                : (categoryInfo && categoryInfo.title)
                                    ? [{ title: categoryInfo.title }]
                                    : [];

                            const imageDetails = Array.isArray(pkg.imageDetails)
                                ? pkg.imageDetails
                                : (Array.isArray(pkg.images) ? pkg.images : []);
                            const principalImageObj = imageDetails.find(img => img.principal === true);
                            const mainCardImageUrl = (principalImageObj && principalImageObj.url)
                                ? principalImageObj.url.trim()
                                : (imageDetails.length > 0 && imageDetails[0].url)
                                    ? imageDetails[0].url.trim()
                                    : FALLBACK_CARD_URL;

                            return (
                                <div key={pkg.id} className="col-md-4 mb-3">
                                    <PackageTravelCard
                                        id={pkg.id}
                                        name={pkg.name}
                                        shortDescription={pkg.shortDescription}
                                        basePrice={pkg.basePrice}
                                        destination={pkg.destination}
                                        categories={cardCategories}
                                        categoryId={pkg.categoryId}
                                        imageUrl={mainCardImageUrl}
                                    />
                                    <Link to={`/detallePaquete/${pkg.id}`} className="btn btn-primary">Ver Detalle</Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}



