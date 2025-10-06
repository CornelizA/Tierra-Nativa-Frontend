import React from 'react';
import { formatCurrency } from '../helpers/FormatCurrency';

export const PackageTravelCard = ({ name, shortDescription, basePrice, destination,category,imageUrl}) => {

    return (
        <>
        <div className='card'>
            <img src={imageUrl} alt={name} className='card-img' />
            <div className='card-content'>
                <h3 className='card-title'>{name}</h3>
                <p className='card-destination'>📍{destination}</p>
                <p className='card-description'>{shortDescription}</p>
                <p className='card-category'>{category}</p>
                <p className='card-price'>Precio Base: {formatCurrency(basePrice)}</p>
            </div>

        </div>
        </>
    )
};
