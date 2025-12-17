import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { apiGetCategoriesByCategory } from '../service/PackageTravelService';
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
    const location = useLocation();
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
            console.error("Error al cargar paquetes de categoría:", err);
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
            setError(null);
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
        <div className="min-h-screen bg-gray-50">

            <div
                className="relative w-full h-[50vh] flex items-center justify-center pt-24 md:h-[60vh] bg-cover bg-center shadow-xl"
                style={{
                    backgroundImage: `url(${categoryInfo.imageUrl})`,
                    backgroundColor: '#1E3A8A'
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                <div className="relative text-center p-6 max-w-4xl mx-auto z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-lg [text-shadow:0_4px_6px_rgba(0,0,0,0.5)]">
                        <MapPin size={48} className="mr-4 text-blue-300 inline-block align-middle" />
                        {displayTitle}
                    </h1>

                    <button
                        onClick={() => fetchPackages(categorySlug)}
                        disabled={loading}
                        className="flex items-center mx-auto px-6 py-2 text-base font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition duration-150 disabled:opacity-50 shadow-lg mt-4"
                    >
                        <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Cargando...' : 'Recargar Paquetes'}
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl p-4 md:p-8">

                {loading && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-lg mt-10">
                        <p className="text-xl text-blue-500 font-semibold">Cargando paquetes y detalles de categoría...</p>
                        <p className="text-sm text-gray-500">Buscando en la categoría {displayTitle}...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center p-10 bg-red-50 border border-red-300 rounded-xl shadow-lg mt-10">
                        <p className="text-xl text-red-700 font-semibold">{error}</p>
                        {(/401|no autorizado|acceso denegado/i).test(error) && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Para ver esta información necesitas iniciar sesión con una cuenta con permisos adecuados.</p>
                                <Link to="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Ir a Iniciar Sesión</Link>
                            </div>
                        )}
                    </div>
                )}

                {!loading && !error && (
                    <section className="mt-12">

                        <div className="bg-black p-6 md:p-10 rounded-xl shadow-xl mb-12">
                            <h2 className="text-3xl font-extrabold mb-4 text-gray-800 border-b pb-2 border-blue-100">
                                Acerca de {displayTitle}
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {categoryInfo.description}
                            </p>
                        </div>

                        {packages.length === 0 && (
                            <div className="text-center p-10 bg-black-100 rounded-xl border border-dashed border-gray-300 mb-12">
                                <p className="text-2xl text-gray-700 font-semibold">
                                    ¡Parece que aún no hay paquetes en la categoría "{displayTitle}"!
                                </p>
                                <p className="text-base text-gray-500 mt-3">Estamos trabajando para añadir emocionantes viajes pronto. Vuelve a recargar en unos minutos.</p>
                            </div>
                        )}


                        {packages.length > 0 && (
                            <div className="w-full">
                                <h2 className="text-4xl font-extrabold mb-8 text-blue-700">
                                    Explora nuestros Viajes ({packages.length})
                                </h2>

                                <div className="row">
                                    {packages.map((pkg) => {

                                        const imageDetails = Array.isArray(pkg.imageDetails) ? pkg.imageDetails : [];
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
                                                    categories={pkg.categories}
                                                    imageUrl={mainCardImageUrl}
                                                />
                                                <Link to={`/detallePaquete/${pkg.id}`} className="btn btn-primary">Ver Detalle</Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};