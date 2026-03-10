import React, { useContext, useState, useEffect } from 'react';
import { formatCurrency } from '../helpers/FormatCurrency';
import '../style/PackageTravelCard.css';
import { MapPin, Globe, Heart, Star } from 'lucide-react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { apiToggleFavorite, fireAlert } from '../service/PackageTravelService';

export const PackageTravelCard = ({ pkg, isUserLoggedIn, imageUrl: propImageUrl, onRefresh, fallbackCategoryTitle }) => {
    const safePkg = pkg || {};

    const { id, name, shortDescription, basePrice, destination, categories, categoryId, averageRating, reviews, isFavorite: initialFavorite
    } = safePkg;

    const [loadingFav, setLoadingFav] = useState(false);
    const { favoriteIds, updateFavoriteInContext, categoryMap } = useContext(PackageTravelContext) || { favoriteIds: new Set() };
    const [localFavorite, setLocalFavorite] = useState(isUserLoggedIn && favoriteIds.has(id));

    useEffect(() => {
        setLocalFavorite(isUserLoggedIn && favoriteIds.has(id));
    }, [isUserLoggedIn, favoriteIds, id]);

    const finalImageUrl = propImageUrl || safePkg.imageDetails?.[0]?.url || FALLBACK_CARD_URL;

    let formattedCategories = '';

    if (Array.isArray(categories) && categories.length > 0) {
        const titles = categories
            .map(c => (c && (c.title || c.name)) ? (c.title || c.name) : (typeof c === 'string' ? c : ''))
            .filter(Boolean)
            .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
        if (titles.length > 0) {
            formattedCategories = titles.join(', ');
        }
    } else if (categories && typeof categories === 'object' && (categories.title || categories.name)) {
        const t = categories.title || categories.name;
        formattedCategories = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    } else if (typeof categories === 'string' && categories.trim().length > 0) {
        const t = categories.trim();
        formattedCategories = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    }
    if ((!formattedCategories || formattedCategories === 'Sin categoría') && (categoryId !== undefined)) {
        const resolveLookup = (raw) => {
            if (raw === null || raw === undefined) return null;
            if (typeof raw === 'object') {
                if (raw.id !== undefined) return raw.id;
                if (raw._id !== undefined) return raw._id;
                if (raw.value !== undefined) return raw.value;
                return null;
            }
            return raw;
        };
        if (Array.isArray(categoryId) && categoryId.length > 0) {
            const titles = categoryId.map(entry => {
                const key = resolveLookup(entry);
                if (key === null || key === undefined) return null;
                const lookup = (categoryMap && (categoryMap[key] || categoryMap[String(key)])) || null;
                return lookup;
            }).filter(Boolean)
                .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
                .slice(0, 3);
            if (titles.length) formattedCategories = titles.join(', ');
        } else {
            const key = resolveLookup(categoryId);
            if (key !== null && key !== undefined) {
                const t = (categoryMap && (categoryMap[key] || categoryMap[String(key)])) || null;
                if (t) formattedCategories = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
            }
        }
    }
    if (!formattedCategories && fallbackCategoryTitle) {
        formattedCategories = fallbackCategoryTitle;
    }
    if (!formattedCategories) {
        formattedCategories = 'Sin categoría';
    }

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const hasToken = !!sessionStorage.getItem('jwtToken');
        if (!isUserLoggedIn && !hasToken) {
            fireAlert('Acceso Requerido', 'Debes iniciar sesión para guardar favoritos.', 'warning');
            return;
        }
        setLoadingFav(true);
        try {
            const res = await apiToggleFavorite(id);
            if (updateFavoriteInContext) {
                updateFavoriteInContext(id, res.isFavorite);
            }
            setLocalFavorite(res.isFavorite);
            if (!res.isFavorite) {
                fireAlert('Eliminado', 'El paquete ha sido eliminado de tus favoritos.', 'info');
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            fireAlert('Operación Fallida', 'No se pudo actualizar el estado de favorito.', 'error');
        } finally {
            setLoadingFav(false);
        }
    };

    return (
        <>
            <div className="flip-card">
                <div className="flip-card-inner">
                    <div className="flip-card-front">
                        <img
                            src={finalImageUrl}
                            alt={name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        <div className="score-item">
                            <Star size={20} className="star-score" />
                            <span className="score-text">{averageRating?.toFixed(1) || "0.0"}</span>
                        </div>

                        <div className="front-overlay-gradient"></div>
                        <div className="card-overlay">
                            <h5 className="card-title">{name}</h5>
                        </div>
                    </div>

                    <div className="flip-card-back shadow-2x1">
                        <h5 className="back-title">{name}</h5>
                        <p className="back-description">{shortDescription}</p>
                        <p className='back-destination'>
                            <strong><MapPin size={18} className="inline-block-p mr-1" /> Destino </strong>
                            {destination}
                        </p>
                        <p className='back-categories'>
                            <strong><Globe size={18} className="inline-block-p mr-1" /> Categoría </strong>
                            {formattedCategories}
                        </p>
                        <p className="back-price">
                            Desde
                            <span className="price-value"> {formatCurrency(basePrice)}</span>
                        </p>
                        <button
                            onClick={handleToggleFavorite}
                            disabled={loadingFav}
                            className={`button-icon-favorite ${localFavorite ? 'true' : 'false'}`}
                            title={localFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                            <Heart
                                size={25}
                                fill={localFavorite ? "white" : "none"}
                                stroke={localFavorite ? "white" : "currentColor"}
                                strokeWidth={2.5}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};