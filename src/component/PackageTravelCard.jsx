import React, { useContext } from 'react';
import { formatCurrency } from '../helpers/FormatCurrency';
import '../style/PackageTravelCard.css';
import { MapPin, Globe } from 'lucide-react';
import { PackageTravelContext } from '../context/PackageTravelContext';

export const PackageTravelCard = ({ name, shortDescription, basePrice, destination, categories, imageUrl, categoryId }) => {

    let formattedCategories = 'Sin categoría';

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

    const { categoryMap } = useContext(PackageTravelContext) || {};
    if ((formattedCategories === 'Sin categoría' || !formattedCategories) && (categoryId !== undefined)) {
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

    return (
        <>
            <div className="flip-card">
                <div className="flip-card-inner">
                    <div className="flip-card-front">
                        <img
                            src={imageUrl}
                            alt={name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className="card-overlay">
                            <h5 className="card-title">{name}</h5>
                        </div>
                    </div>
                    <div className="flip-card-back">
                        <h5 className="back-title">{name}</h5>
                        <p className="back-description">{shortDescription}</p>
                        <p className='back-destination'><strong><MapPin size={18} className="inline-block-p mr-1" /> Destino </strong>  {destination}</p>
                        <p className='back-categories'><strong><Globe size={18} className="inline-block-p  mr-1" /> Categoría </strong> {formattedCategories}</p>
                        <p className="back-price">
                            Desde
                            <span className="price-value"> {formatCurrency(basePrice)}</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
};
