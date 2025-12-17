import React from 'react';
import { formatCurrency } from '../helpers/FormatCurrency';
import '../style/PackageTravelCard.css';
import { MapPin, Globe } from 'lucide-react';

export const PackageTravelCard = ({ name, shortDescription, basePrice, destination, categories, imageUrl }) => {

    const categoriesTitle =
        Array.isArray(categories) && categories.length > 0
            ? categories[0].title
            : 'Sin categoría';

    const formattedCategories =
        categoriesTitle !== 'Sin categoría'
            ? categoriesTitle.charAt(0).toUpperCase() + categoriesTitle.slice(1).toLowerCase()
            : categoriesTitle;

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
