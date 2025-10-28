import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../style/PackageDetailed.css';
import { Clock, Tent, Car, Utensils, Circle } from 'lucide-react';

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
  const formatRecommendations = (text) => {
    if (!text) return [];
    const sentences = text.match(/[^.?!]+[.?!]+/g) || [];
    const simpleSentences = text.split('.')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s.endsWith('.') ? s : s + '.');
    return simpleSentences;
  };

  const recommendationsList = itinerary.generalRecommendations
    ? formatRecommendations(itinerary.generalRecommendations)
    : [];

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
            <div className="row-detailed row">
              <div className="col-md-5 description-column">
                <div className="card">
                  <h2 className="card-header">Resumen del Itinerario</h2>
                  <div className="card-body">
                    <p >
                      <Clock size={20} />
                      <span className="itinerary-label">Duración: </span>
                      <span className="itinerary-value">{itinerary.duration}</span>
                    </p>
                    <p >
                      <Tent size={20} />
                      <span className="itinerary-label">Hospedaje: </span>
                      <span className="itinerary-value">{itinerary.lodgingType}</span>
                    </p>
                    <p>
                      <Car size={20} />
                      <span className="itinerary-label">Traslados: </span>
                      <span className="itinerary-value">{itinerary.transferType}</span>
                    </p>
                    <p >
                      <Utensils size={20} />
                      <span className="itinerary-label">Alimentación e Hidratación: </span>
                      <span className="itinerary-value">{itinerary.foodAndHydrationNotes}</span>
                    </p>

                  </div>
                </div>
              </div>
              <div className="col-md-5 description-column">
                <div className="card">
                  <h2 className="card-header">Planificación día por día</h2>
                  <div className="card-body">
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
                                  <Circle
                                    size={20}
                                    style={{
                                      color: '#B85C38',
                                      marginRight: '8px',
                                      flexShrink: 0
                                    }}
                                  />
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
                  </div>
                </div>
              </div>
              {itinerary.generalRecommendations && (
                <div className="col-md-10 description-column">
                  <div className="card">
                    <h2 className="card-header">Recomendaciones Generales</h2>
                    <div className="card-body">
                      {recommendationsList.length > 0 ? (
                        <ul className="card-list list-unstyled">
                          {recommendationsList.map((recommendation, index) => (
                            <li
                              key={index}
                              className="card-list-item"
                            >
                              <Circle
                                size={20}
                              />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="card-text">{itinerary.generalRecommendations}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </>
  )
};

