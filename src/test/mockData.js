const packageValid = {
  id: 1,
  name: "Aventura Patagonia 7 Días",
  status: "active",
  shortDescription: "Explora glaciares, montañas y lagos en el sur de Argentina.",
  basePrice: 1250.00,
  destination: "El Calafate, Argentina",
  category: "GEOPAISAJES", 
  itineraryDetail: {
      duration: "7 días / 6 noches", 
      lodgingType: "Hotel Boutique (media pensión)",
      transferType: "Vuelo interno + Traslados privados",
      dailyActivitiesDescription: "Día 1: Llegada y check-in. Día 2: Excursión al Glaciar Perito Moreno. Día 3: Minitrekking sobre el glaciar. Día 4: Navegación por el Lago Argentino.",
      foodAndHydrationNotes: "Se incluye media pensión (desayuno y cena). Recomendamos llevar snacks energéticos y botella reutilizable.",
      generalRecommendations: "Usar ropa térmica, calzado de trekking y protección solar. La mejor época es de noviembre a marzo."
  },
  imageDetails: [
    { url: 'https://placehold.co/800x600/007AFF/ffffff?text=Glaciar+Perito+Moreno', principal: true }, 
    { url: 'https://placehold.co/400x300/34AADC/ffffff?text=Montaña', principal: false } 
  ],
  currency: "USD",
  availability: 15,
  rating: 4.7
};


const packageUpdated = {
  id: 2,
  name: "Relax en Caribe Todo Incluido",
  status: "updated",
  shortDescription: "Playa de arena blanca, sol y mar turquesa sin preocupaciones.",
  basePrice: 999.00,
  destination: "Punta Cana, República Dominicana",
  category: "RELAJACION",
  itineraryDetail: {
      duration: "5 días / 4 noches",
      lodgingType: "Resort 5 Estrellas (Todo Incluido)",
      transferType: "Bus privado desde aeropuerto",
      dailyActivitiesDescription: "Día 1: Llegada y cóctel de bienvenida. Día 2: Snorkel y deportes acuáticos. Día 3: Día libre en la piscina. Día 4: Excursión opcional a Isla Saona.",
      foodAndHydrationNotes: "Todas las comidas, snacks y bebidas ilimitadas están incluidas 24/7 en el resort.",
      generalRecommendations: "Llevar traje de baño, repelente, y efectivo para propinas. El clima es tropical todo el año."
  },
  imageDetails: [
    { url: 'https://placehold.co/800x600/FF5733/ffffff?text=Playa+Caribe', principal: true },
    { url: 'https://placehold.co/400x300/FFC300/000000?text=Piscina', principal: false }
  ],
  currency: "USD",
  availability: 8,
  rating: 4.5
};

const packagesList = [
    {
        id: 1,
        name: "Aventura Patagonia 7 Días",
        status: "active",
        shortDescription: "Explora glaciares, montañas y lagos en el sur de Argentina.",
        basePrice: 1250.00,
        destination: "El Calafate, Argentina",
        category: "GEOPAISAJES",
        itineraryDetail: {
            duration: "7 días / 6 noches",
            lodgingType: "Hotel Boutique (media pensión)",
            transferType: "Vuelo interno + Traslados privados",
            dailyActivitiesDescription: "Día 1: Llegada y check-in. Día 2: Excursión al Glaciar Perito Moreno. Día 3: Minitrekking sobre el glaciar. Día 4: Navegación por el Lago Argentino.",
            foodAndHydrationNotes: "Se incluye media pensión (desayuno y cena). Recomendamos llevar snacks energéticos y botella reutilizable.",
            generalRecommendations: "Usar ropa térmica, calzado de trekking y protección solar. La mejor época es de noviembre a marzo."
        },
        imageDetails: [
            { url: 'https://placehold.co/800x600/007AFF/ffffff?text=Glaciar+Perito+Moreno', principal: true },
            { url: 'https://placehold.co/400x300/34AADC/ffffff?text=Montaña', principal: false }
        ],
    },
    {
        id: 2,
        name: "Relax en Caribe Todo Incluido",
        status: "updated",
        shortDescription: "Playa de arena blanca, sol y mar turquesa sin preocupaciones.",
        basePrice: 999.00,
        destination: "Punta Cana, República Dominicana",
        category: "RELAJACION",
        itineraryDetail: {
            duration: "5 días / 4 noches",
            lodgingType: "Resort 5 Estrellas (Todo Incluido)",
            transferType: "Bus privado desde aeropuerto",
            dailyActivitiesDescription: "Día 1: Llegada y cóctel de bienvenida. Día 2: Snorkel y deportes acuáticos. Día 3: Día libre en la piscina. Día 4: Excursión opcional a Isla Saona.",
            foodAndHydrationNotes: "Todas las comidas, snacks y bebidas ilimitadas están incluidas 24/7 en el resort.",
            generalRecommendations: "Llevar traje de baño, repelente, y efectivo para propinas. El clima es tropical todo el año."
        },
        imageDetails: [
            { url: 'https://placehold.co/800x600/FF5733/ffffff?text=Playa+Caribe', principal: true },
            { url: 'https://placehold.co/400x300/FFC300/000000?text=Piscina', principal: false }
        ],
    },
    {
        id: 3,
        name: "Ruta Milenaria Inca",
        status: "active",
        shortDescription: "Explora la ciudad perdida de Machu Picchu y el Valle Sagrado.",
        basePrice: 1550.00,
        destination: "Cusco, Perú",
        category: "GEOPAISAJES",
        itineraryDetail: {
            duration: "8 días / 7 noches",
            lodgingType: "Hoteles 4 Estrellas con desayuno",
            transferType: "Tren panorámico y traslados privados",
            dailyActivitiesDescription: "Día 1: Llegada y aclimatación. Día 3: Tour guiado por el Valle Sagrado. Día 5: Viaje y tour completo a Machu Picchu. Día 7: Exploración de ruinas cercanas a Cusco.",
            foodAndHydrationNotes: "Desayuno incluido en todos los hoteles. Almuerzos y cenas libres (excepto el día de Machu Picchu).",
            generalRecommendations: "Beber abundante agua de coca o té de coca para la altitud. Llevar bloqueador solar y sombrero."
        },
        imageDetails: [
            { url: 'https://placehold.co/800x600/6A0DAD/ffffff?text=Machu+Picchu', principal: true },
            { url: 'https://placehold.co/400x300/800080/ffffff?text=Cusco', principal: false }
        ],
    },
    {
        id: 4,
        name: "Safari Fotográfico Kenia",
        status: "active",
        shortDescription: "Observa los 'Cinco Grandes' en su hábitat natural en la Reserva Masai Mara.",
        basePrice: 3200.00,
        destination: "Nairobi y Masai Mara, Kenia",
        category: "GEOPAISAJES",
        itineraryDetail: {
            duration: "6 días / 5 noches",
            lodgingType: "Campamento de Lujo (Pensión completa)",
            transferType: "Vuelo local desde Nairobi + Jeep 4x4",
            dailyActivitiesDescription: "Día 1: Llegada a Nairobi y conexión. Días 2-5: Safaris al amanecer y atardecer en Masai Mara, guiados por expertos Maasai.",
            foodAndHydrationNotes: "Pensión completa (desayuno, almuerzo y cena). Las bebidas no alcohólicas están incluidas en el campamento.",
            generalRecommendations: "Usar colores neutros, llevar prismáticos de alta potencia y cámara con buen zoom. Vacunas requeridas: Fiebre Amarilla."
        },
        imageDetails: [
            { url: 'https://placehold.co/800x600/10B981/ffffff?text=Masai+Mara', principal: true },
            { url: 'https://placehold.co/400x300/059669/ffffff?text=Leones', principal: false }
        ],
    },
    {
        id: 5,
        name: "Luces y Moda en París",
        status: "updated",
        shortDescription: "Recorrido por los íconos de la cultura, el arte y la gastronomía parisina.",
        basePrice: 1890.00,
        destination: "París, Francia",
        category: "LITORAL",
        itineraryDetail: {
            duration: "5 días / 4 noches",
            lodgingType: "Hotel Boutique en Saint-Germain",
            transferType: "Metro y taxis (traslados de aeropuerto incluidos)",
            dailyActivitiesDescription: "Día 1: Subida a la Torre Eiffel. Día 2: Visita al Museo del Louvre y Notre Dame. Día 3: Paseo por Montmartre y show nocturno. Día 4: Compras y cata de vinos.",
            foodAndHydrationNotes: "Desayuno continental incluido. La cena libre para explorar la vasta oferta gastronómica.",
            generalRecommendations: "Utilizar transporte público (Metro) para ahorrar tiempo. Reservar las entradas a museos con antelación."
        },
        imageDetails: [
            { url: 'https://placehold.co/800x600/FFD700/000000?text=Torre+Eiffel', principal: true },
            { url: 'https://placehold.co/400x300/B8860B/000000?text=Louvre', principal: false }
        ],
    },
    {
        id: 6,
        name: "Termas y Relax en el Sur",
        status: "active",
        shortDescription: "Desconexión total en aguas termales naturales y paisajes boscosos.",
        basePrice: 850.00,
        destination: "Pucón, Chile",
        category: "RELAJACION",
        itineraryDetail: {
            duration: "4 días / 3 noches",
            lodgingType: "Cabañas rústicas con chimenea",
            transferType: "Bus de línea y transfer local a termas",
            dailyActivitiesDescription: "Día 1: Check-in y descanso. Día 2: Día completo en Termas Geométricas. Día 3: Paseo por el Lago Villarrica y descanso.",
            foodAndHydrationNotes: "Media pensión (desayuno y cena ligera). Énfasis en comida local y orgánica.",
            generalRecommendations: "Llevar bata de baño y sandalias para las termas. La zona es ideal para el senderismo ligero."
        },
        imageDetails: [
            { url: 'https://placehold.co/800x600/00A9FF/ffffff?text=Termas+Chile', principal: true },
            { url: 'https://placehold.co/400x300/40BFFF/ffffff?text=Bosque', principal: false }
        ],
    }
];

const packagesContext = [
    { id: 1, name: 'Patagonia', destination: 'El Calafate', basePrice: 1000, category: 'Aventura', images: [{ url: 'img1.jpg', principal: true }] },
    { id: 2, name: 'Norte', destination: 'Salta', basePrice: 500, category: 'Geopaisajes', images: [{ url: 'img2.jpg', principal: true }] },
    { id: 3, name: 'Mendoza Wine', destination: 'Mendoza', basePrice: 800, category: 'Relajacion', images: [] }, 
    { id: 4, name: 'Iguazú', destination: 'Misiones', basePrice: 700, category: 'Litoral', imageUrl: 'img4.jpg' }, 
    { id: 5, name: 'Mendoza Andes', destination: 'Mendoza', basePrice: 900, category: 'Aventura', images: [{ url: 'img5.jpg', principal: true }] },
    { id: 6, name: 'Tierra del Fuego', destination: 'Ushuaia', basePrice: 1500, category: 'Aventura', images: [{ url: 'img6.jpg', principal: true }] },
    { id: 7, name: 'Extra', destination: 'Extra', basePrice: 200, category: 'Ecoturismo', images: [{ url: 'img7.jpg', principal: true }] }, 
];

export {
  packageValid,
  packageUpdated,
  packagesList,
  packagesContext,
};