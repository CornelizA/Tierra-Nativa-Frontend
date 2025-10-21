import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../style/PackageDetailed.css';


export const PackageDetailed = () => {

  const { id: packageTravelId } = useParams();
  const { packageTravel: allPackages } = useContext(PackageTravelContext);
  const navigate = useNavigate();

  const [packageTravel, setPackageTravel] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  const FALLBACK_URL = 'https://placehold.co/800x600/CCCCCC/000000?text=SIN+IMAGEN';

  useEffect(() => {
    if (allPackages.length > 0 && packageTravelId) {
      const foundPackages = allPackages.find(pkg => pkg.id === parseInt(packageTravelId));

      if (foundPackages) {
        setPackageTravel(foundPackages);
      } else {
        console.warn(`Paquete con ID ${packageTravelId} no encontrado en el contexto.`);
      }
    }
  }, [packageTravelId, allPackages, navigate]);

  if (!packageTravel) {
    return <div className="loading-container"><h2>Cargando detalles del paquete...</h2></div>;
  }


  const allImageObjects = Array.isArray(packageTravel.images) ? packageTravel.images : [];

  const principalImageObject = allImageObjects.find(img => img.principal === true)
    || allImageObjects[0];

  const mainImage = (principalImageObject && principalImageObject.url)
    ? principalImageObject.url.trim()
    : packageTravel.imageUrl || FALLBACK_URL;

  const secondaryImagesUrls = allImageObjects
    .filter(img => (img.url && img.url.trim()) !== mainImage)
    .map(img => img.url)
    .slice(0, 4);

  const itinerary = packageTravel.itineraryDetail;

  return (
    <>
      <header className="detail-header-block" style={{ paddingTop: '70px' }}>
        <div className="header-content-wrapper">
          <h1 className="product-title">{packageTravel.name}</h1>
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Volver">
            &larr; Volver
          </button>
        </div>
      </header>

      <main className="detail-main-content">
        <section className="image-gallery-block">
          <div className="gallery-layout">

            <div className="main-image-container">
              <img
                src={mainImage}
                alt={packageTravel.name}
                className="main-image"
                onError={(e) => { e.target.src = FALLBACK_URL; }}
              />
            </div>

            <div className="secondary-images-grid">
              {secondaryImagesUrls.slice(0, 4).map((imgUrl, index) => (
                <div key={index} className="secondary-image-wrapper">
                  <img
                    src={imgUrl}
                    alt={`${packageTravel.name} - Imagen ${index + 2}`}
                    className="secondary-image"
                    onError={(e) => { e.target.src = FALLBACK_URL; }}
                  />
                </div>
              ))}

              {allImageObjects.length > 5 && (
                <button
                  className="ver-mas-overlay"
                  style={{ gridColumn: 2, gridRow: 2 }}
                  onClick={() => setShowGallery(true)}
                >
                  <span className="ver-mas-text">Ver más</span>
                </button>
              )}
            </div>
          </div>

          {showGallery && (
            <div className="gallery-modal">
              <div className="gallery-modal-content">
                <button className="close-modal" onClick={() => setShowGallery(false)}>×</button>
                <div className="gallery-modal-images">
                  {allImageObjects.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Imagen ${idx + 1}`}
                      className="modal-image"
                      onError={(e) => { e.target.src = FALLBACK_URL; }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="product-details-section">
          <div className="details-content">
            <div className="row">
              <div className="col-md-8 description-column">
                <h2 className="section-subtitle">Resumen del Itinerario</h2>
                <div className="itinerary-summary">
                  <p>
                    <span className="itinerary-label">Duración: </span>
                    <span className="itinerary-value">{itinerary.duration}</span>
                  </p>
                  <p>
                    <span className="itinerary-label">Hospedaje: </span>
                    <span className="itinerary-value">{itinerary.lodgingType}</span>
                  </p>
                  <p>
                    <span className="itinerary-label">Traslados: </span>
                    <span className="itinerary-value">{itinerary.transferType}</span>
                  </p>
                  <p>
                    <span className="itinerary-label">Alimentación e Hidratación: </span>
                    <span className="itinerary-value">{itinerary.foodAndHydrationNotes}</span>
                  </p>
                </div>

                <h2 className="section-subtitle mt-4">Planificación día por día</h2>
                <ul className="day-list">
                  {(() => {
                    const days = itinerary.dailyActivitiesDescription
                      .split(/(?=D[ií]a\s*\d+:)/g)
                      .map(str => str.trim())
                      .filter(Boolean);

                    return days.map((line, idx) => {
                      const match = line.match(/^(D[ií]a\s*\d+:)(.*)$/i);
                      return (
                        <li key={idx}>
                          {match ? (
                            <>
                              <span className="day-label">{match[1]}</span>
                              <span className="day-desc">{match[2].trim()}</span>
                            </>
                          ) : (
                            <span className="day-desc">{line}</span>
                          )}
                        </li>
                      );
                    });
                  })()}
                </ul>


                {itinerary.generalRecommendations && (
                  <>
                    <h3 className="section-subtitle mt-4">Recomendaciones Generales</h3>
                    <p>{itinerary.generalRecommendations}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};
