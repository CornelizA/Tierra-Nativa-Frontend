import { PackageTravelContext } from "../context/PackageTravelContext";
import { PackageTravelCard } from "../component/PackageTravelCard";
import '../style/home.css';
import { sampleArray } from "../helpers/arrayUtils";
import { useContext, useMemo, useState } from "react";
import { SearchComponent } from "../component/SearchComponent";
import { Link } from "react-router-dom";
import { DestinationComponent } from "../component/DestinationComponent";

const FALLBACK_CARD_URL = 'https://placehold.co/400x300/CCCCCC/000000?text=SIN+IMAGEN';

export const Home = () => {

  const { packageTravel, isLoaded } = useContext(PackageTravelContext);
  const basePackages = Array.isArray(packageTravel)
    ? packageTravel
    : (packageTravel && Array.isArray(packageTravel.packages) ? packageTravel.packages : []);
  const loading = !isLoaded;

  const [selectedDestination, setSelectedDestination] = useState(null);

  const packagesToDisplay = useMemo(() => {
    if (!selectedDestination) {
      return sampleArray(basePackages, 6);
    }
    return basePackages.filter(pkg =>
      (pkg.destination || '').toLowerCase() === selectedDestination.toLowerCase()
    );
  }, [selectedDestination, packageTravel]);

  if (loading) {
    return <div className="text-center ">Cargando paquetes de Tierra Nativa...</div>;
  }
  const TipIcon = ({ Icon, bgColor }) => (
    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${bgColor} text-white mr-3 flex-shrink-0`}>
      <Icon size={20} />
    </div>

  );

  return (
    <>
      <div className="hero-section">
        <div className="search-overlay">
          <h1 className="text-search text-5xl md:text-6xl font-extrabold mb-8 shadow-text">
            Descubre la Belleza Natural
          </h1>

          <div className="search-hero-container">
            <SearchComponent onFilter={setSelectedDestination} />
          </div>
        </div>
      </div>
      <div className="featured-container mt-6 mx-auto">
        <h2 className="package-featured text-4xl pb-2">
          Paquetes Destacados 
          <br />
          <span className="text-lg text-gray-600 font-normal"> 
          {selectedDestination
            ? packagesToDisplay.length
            : basePackages.length
          } Experiencias imperdibles que conectan con tu esencia</span>
        </h2>

        <div className="package-home row">
            {packagesToDisplay.map((pkg) => {

                const imageDetails = Array.isArray(pkg.imageDetails) ? pkg.imageDetails : [];
                const principalImageObj = imageDetails.find(img => img.principal === true);
                const mainCardImageUrl = (principalImageObj && principalImageObj.url)
                  ? principalImageObj.url.trim()
                  : (imageDetails.length > 0 && imageDetails[0].url)
                    ? imageDetails[0].url.trim()
                    : FALLBACK_CARD_URL;
                return (
                  <div key={pkg.id ?? `pkg-${pkg.name}-${Math.random()}`} className="col-md-4 mb-3">
                    <PackageTravelCard
                      id={pkg.id}
                      name={pkg.name}
                      shortDescription={pkg.shortDescription}
                      basePrice={pkg.basePrice}
                      destination={pkg.destination}
                      categories={pkg.categories}
                      categoryId={pkg.categoryId}
                      imageUrl={mainCardImageUrl}
                    />
                    <Link to={`/detallePaquete/${pkg.id}`} className="btn btn-primary">
                      Ver Detalle
                    </Link>
                  </div>
                );
              })
            }
        </div>
      </div>

      <section className="map-slider-section my-16 px-0">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-green-dark">
          Sumérgete en lo Auténtico de Argentina
        </h2>
        <div className="map-layout map-layout-full">

          <div className="slider-column">
            <DestinationComponent />
          </div>
          <div className="map-column">
            <div className="map-image-container">
              <img
                src="/images/MAPA ARGENTINA.png"
                alt="Mapa de Argentina con divisiones provinciales"
                className="map-image"
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Tu viaje nativo comienza aquí
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

