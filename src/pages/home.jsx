import { PackageTravelContext } from "../context/PackageTravelContext";
import { PackageTravelCard } from "../component/PackageTravelCard";
import '../style/home.css';
import { sampleArray } from "../helpers/arrayUtils";
import { useContext, useMemo, useState } from "react";
import { SearchComponent } from "../component/SearchComponent";
import { Link } from "react-router-dom";
import { DestinationComponent } from "../component/DestinationComponent";
import { TriangleAlert } from "lucide-react";

const FALLBACK_CARD_URL = 'https://placehold.co/400x300/CCCCCC/000000?text=SIN+IMAGEN';

export const Home = ({ isUserLoggedIn }) => {
  const { packageTravel, isLoaded } = useContext(PackageTravelContext) || { packageTravel: [], isLoaded: true };
  const [searchParams, setSearchParams] = useState(null);
  const basePackages = useMemo(() => Array.isArray(packageTravel) ? packageTravel : (packageTravel?.packages || []), [packageTravel]);

  const packagesToDisplay = useMemo(() => {
    if (!searchParams) return sampleArray(basePackages, 6);

    const { destination, startDate, endDate } = searchParams;

    return basePackages.filter(pkg => {
      const matchesDest = !destination || destination.trim() === "" ||
        (pkg.destination || '').toLowerCase().includes(destination.toLowerCase());

      if (!matchesDest) return false;
      if (startDate && endDate) {
        const blocks = pkg.availabilityBlocks || [];

        const isOccupied = blocks.some(block => {
          const bStart = new Date(block.startDate + "T00:00:00");
          const bEnd = new Date(block.endDate + "T00:00:00");

          return (startDate <= bEnd && endDate >= bStart);
        });
        if (isOccupied) return false;
      }
      return true;
    });
  }, [searchParams, basePackages]);

  const isFiltered = searchParams && (
    (searchParams.destination && searchParams.destination.trim() !== "") ||
    (searchParams.startDate && searchParams.endDate)
  );

  if (!isLoaded) {
    return (
      <div className="loading-message" style={{ textAlign: 'center', padding: '40px', fontSize: '2rem', color: '#333' }}>
        Cargando paquetes de Tierra Nativa
      </div>
    );
  }
  return (
    <>
      <header className="hero-section ">
        <div className="container-hero">
          <h1 className="text-white display-3 fw-black text-uppercase tracking-tighter italic mb-5 drop-shadow-lg">
            Descubre la Belleza Natural
          </h1>
          <div className="search-hero-container mx-auto">
            <SearchComponent onFilter={setSearchParams} />
          </div>
        </div>
      </header>

      <div className="featured-container mt-6 mx-auto">
        <h2 className="featured-package text-4xl pb-2" style={{ backgroundColor: '#9ca0a426', width: '100%', padding: '30px' }}>
          Paquetes Destacados
          <br />

          <p className="text-featured-packages" style={{
            color: '#FAF8F0',
            fontWeight: 'bold',
            fontSize: '1.8rem',
            textAlign: 'center',
            marginTop: '10px',
          }}
          >
            {isFiltered ? (
              packagesToDisplay.length > 0 ? (
                `${packagesToDisplay.length} Experiencias encontradas que coinciden con tu búsqueda`
              ) : (

                <span className="small fw-bold text-center" style={{ padding: '30px', borderRadius: '8px', marginTop: '20px', fontSize: '1.7rem', textAlign: 'center', display: 'inline-block', backgroundColor: '#9ca0a426', width: '500px' }}>
                  <TriangleAlert size={50} style={{ display: 'block', margin: '0 auto', marginBottom: '10px' }} />
                  No hay paquetes disponibles,
                  <br /> por favor escoja otras fechas.
                </span>
              )
            ) : (
              `${basePackages.length} Experiencias imperdibles que conectan con tu esencia`
            )}
          </p>
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
                  pkg={pkg}
                  isUserLoggedIn={isUserLoggedIn}
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
        <h2 className="text-section-map text-4xl font-extrabold text-center mb-12 text-green-dark">
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
            <p className="text-image text-center text-sm text-gray-500 mt-2">
              Tu viaje nativo comienza aquí
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

