
const packageValid = {
    id: 1,
    name: "Glaciar Perito Moreno: Hielo Milenario",
    status: "active",
    shortDescription: "Un viaje inolvidable para presenciar la majestuosidad del Glaciar Perito Moreno y sus imponentes desprendimientos de hielo en el Parque Nacional Los Glaciares.",
    basePrice: 690000.0,
    destination: "El Calafate",
    categoryId: [1], 
    characteristicIds: [1, 3, 4, 7, 8, 9, 12, 13],
    itineraryDetail: {
        duration: "4 Días / 3 Noches",
        lodgingType: "Hotel 4 estrellas en El Calafate.",
        transferType: "Vuelo a FTE. Traslados aeropuerto-hotel. Excursiones en bus de turismo.",
        dailyActivitiesDescription: "Día 1: Llegada a El Calafate (FTE), traslado al hotel. Día 2: Excursión a las Pasarelas del Glaciar Perito Moreno y Safari Náutico. Día 3: Día de aventura con Minitrekking (opcional) o navegación Big Ice. Día 4: Mañana libre y regreso.",
        foodAndHydrationNotes: "Incluye todas las comidas y la hidratación necesaria para la duración del viaje, el plan nutricional está diseñado para variar según la aventura.",
        generalRecommendations: "El clima en el Parque Nacional Los Glaciares es frío, ventoso e impredecible. Vístete con múltiples capas de ropa. Es esencial el uso de chaqueta cortavientos e impermeable."
    },
    imageDetails: [
        { id: 1, url: "https://images.pexels.com/photos/17217435/pexels-photo-17217435.jpeg", principal: true },
        { id: 2, url: "https://images.pexels.com/photos/27180675/pexels-photo-27180675.jpeg", principal: false },
        { id: 3, url: "https://images.pexels.com/photos/9224586/pexels-photo-9224586.jpeg", principal: false },
        { id: 4, url: "https://images.pexels.com/photos/26769831/pexels-photo-26769831.jpeg", principal: false },
        { id: 5, url: "https://images.pexels.com/photos/26893839/pexels-photo-26893839.jpeg", principal: false }
    ],
    currency: "ARS",
    availability: 10,
    rating: 5.0
};

const packageUpdated = {
    id: 2,
    name: "Relax en Caribe Todo Incluido",
    status: "updated",
    shortDescription: "Playa de arena blanca, sol y mar turquesa sin preocupaciones.",
    basePrice: 999.00,
    destination: "Punta Cana, República Dominicana",
    categoryId: [2],
    characteristicIds: [2, 5, 6],
    itineraryDetail: {
        duration: "5 días / 4 noches",
        lodgingType: "Resort 5 Estrellas (Todo Incluido)",
        transferType: "Bus privado desde aeropuerto",
        dailyActivitiesDescription: "Día 1: Llegada y cóctel. Día 2: Snorkel. Día 3: Piscina. Día 4: Isla Saona.",
        foodAndHydrationNotes: "Todas las comidas y bebidas ilimitadas 24/7.",
        generalRecommendations: "Llevar traje de baño, repelente y protector solar."
    },
    imageDetails: [
        { id: 10, url: 'https://placehold.co/800x600/FF5733/ffffff?text=Playa+Caribe', principal: true },
        { id: 11, url: 'https://placehold.co/400x300/FFC300/000000?text=Piscina', principal: false }
    ],
    currency: "USD",
    availability: 8,
    rating: 4.5
};

const packagesList = [
    packageValid,
    packageUpdated,
    {
        id: 3,
        name: "Ruta Milenaria Inca",
        destination: "Cusco, Perú",
        basePrice: 1550.00,
        imageDetails: [{ url: 'https://placehold.co/800x600/6A0DAD/ffffff?text=Machu+Picchu', principal: true }]
    },
    {
        id: 4,
        name: "Safari Fotográfico Kenia",
        destination: "Nairobi, Kenia",
        basePrice: 3200.00,
        imageDetails: [{ url: 'https://placehold.co/800x600/10B981/ffffff?text=Masai+Mara', principal: true }]
    },
    {
        id: 5,
        name: "Luces y Moda en París",
        destination: "París, Francia",
        basePrice: 1890.00,
        imageDetails: [{ url: 'https://placehold.co/800x600/FFD700/000000?text=Torre+Eiffel', principal: true }]
    }
];

const packagesContext = [
    { ...packageValid, isLoaded: true },
    { ...packageUpdated, isLoaded: true },
    { id: 3, name: 'Mendoza Wine', destination: 'Mendoza', basePrice: 800, imageDetails: [] }, 
    { id: 4, name: 'Iguazú', destination: 'Misiones', basePrice: 700, imageDetails: [{ url: 'img_ig.jpg', principal: true }] },
    { id: 5, name: 'Mendoza Andes', destination: 'Mendoza', basePrice: 900, imageDetails: [{ url: 'img_mndz.jpg', principal: true }] },
    { id: 6, name: 'Salta La Linda', destination: 'Salta', basePrice: 450, imageDetails: [{ url: 'img_salta.jpg', principal: true }] }
];

export {
    packageValid,
    packageUpdated,
    packagesList,
    packagesContext,
};