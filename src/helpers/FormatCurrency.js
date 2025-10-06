import React from 'react'

export const formatCurrency = (basePrice) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(basePrice);
  };

