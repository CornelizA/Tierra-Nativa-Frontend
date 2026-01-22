import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../style/PackageDetailed.css';
import { Clock, Tent, Car, Utensils, Circle, Star } from 'lucide-react';
import { IconLibrary } from '../component/AdminCharacteristic';
import { apiGetCharacteristicsPublic, apiGetPackageById, fireAlert } from "../service/PackageTravelService";

export const PackageDetailed = () => {

  const params = useParams();
  const packageTravelId = params?.id || params?.packageId || null;
  const { packageTravel: allPackages } = useContext(PackageTravelContext);
  const navigate = useNavigate();

  const [packageTravel, setPackageTravel] = useState(null);
  const [allCharacteristics, setAllCharacteristics] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const FALLBACK_URL = 'https://placehold.co/800x600/CCCCCC/000000?text=SIN+IMAGEN';

  useEffect(() => {
    const fetchCharacteristics = async () => {
      try {
        const data = await apiGetCharacteristicsPublic();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setAllCharacteristics(list);
      } catch (error) {
        setAllCharacteristics([]);
      }
    };
    fetchCharacteristics();
  }, []);


  useEffect(() => {
    if (!packageTravelId) return;
    const tryUseList = async () => {
      if (allPackages && allPackages.length > 0) {
        const found = allPackages.find(pkg => Number(pkg.id) === Number(packageTravelId));
        if (found) {
          setPackageTravel(found);
          const hasIds = (Array.isArray(found.characteristicIds) && found.characteristicIds.length > 0) ||
            (Array.isArray(found.characteristics) && found.characteristics.length > 0);
          if (!hasIds) {
            try {
              const detail = await apiGetPackageById(packageTravelId);
              if (detail) setPackageTravel(detail);
            } catch (e) {
            }
          }
          return;
        }
      }
      try {
        const detail = await apiGetPackageById(packageTravelId);
        if (detail) setPackageTravel(detail);
      } catch (e) {
        fireAlert('Error', 'No se pudo cargar los detalles del paquete.');
        setPackageTravel(null);
      }
    };
    tryUseList();
  }, [allPackages, packageTravelId]);

  if (!packageTravel) return <div className="p-10 text-center font-bold text-slate-400">Cargando detalles...</div>;

  const idsFromPackage = (() => {
    if (!packageTravel) return [];
    if (Array.isArray(packageTravel.characteristicIds) && packageTravel.characteristicIds.length) {
      return packageTravel.characteristicIds.map(i => Number(i?.id ?? i)).filter(Boolean);
    }
    if (Array.isArray(packageTravel.characteristics) && packageTravel.characteristics.length) {
      return packageTravel.characteristics.map(c => Number(c?.id ?? c)).filter(Boolean);
    }
    return [];
  })();

  const packageFeatures = allCharacteristics.filter(masterChar => {
    const masterId = Number(masterChar.id);
    if (idsFromPackage.includes(masterId)) return true;

    const pkgsField = masterChar.packages || masterChar.packageIds || masterChar.packageId;
    if (Array.isArray(pkgsField) && pkgsField.length) {
      return pkgsField.some(p => Number(p?.id ?? p) === Number(packageTravel.id));
    }
    return false;
  });

  const allImageObjects = Array.isArray(packageTravel.imageDetails) ? packageTravel.imageDetails : [];

  const principalImageObject = allImageObjects.find(img => img.principal === true) || allImageObjects[0];

  const calculatedMainImageUrl = (principalImageObject && principalImageObject.url && principalImageObject.url.trim())
    ? principalImageObject.url.trim()
    : (packageTravel.imageUrl || null);

  const mainImage = calculatedMainImageUrl || FALLBACK_URL;
  const filterUrl = calculatedMainImageUrl;

  const secondaryImagesUrls = allImageObjects
    .filter(img => {
      return img.url && img.url.trim() && img.url.trim() !== filterUrl;
    })
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

        <section className="section-characteristic  p-8 md:p-12 shadow-sm ">
          <div className="mb-10">
            <h2 className="title-detailed-characteristic">Características del Paquete</h2>
            <p className="text-detailed-characteristic">Servicios y comodidades que incluye esta experiencia.</p>
          </div>

          <ul className="list-group list-group-horizontal flex-wrap gap-2 justify-center">
            {packageFeatures && packageFeatures.length > 0 ? (
              packageFeatures.map((item) => {
                const IconComponent = IconLibrary[item.icon?.toLowerCase()] || Star;
                return (
                  <li key={item.id} className="list-group-item flex items-center rounded-2xl">
                    <div className="icon-group rounded-md bg-slate-50 flex items-center justify-center text-blue-600">
                      <IconComponent size={20} strokeWidth={2} />
                    </div>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                  </li>
                );
              })
            ) : (
              <li className="list-group-item w-full text-center text-slate-400 py-6 border-2 border-dashed rounded-3xl">
                {allCharacteristics.length === 0
                  ? 'Cargando catálogo de servicios...'
                  : 'Este paquete no tiene características vinculadas.'}
              </li>
            )}
          </ul>
        </section>


        <section className="product-details-section">
          <div className="details-content">
            <div className="row-detailed row top-cards-row ">
              <div className="col-md-6 col-lg-5 description-column">
                <div className="card card-top">
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

              <div className="col-md-6 col-lg-5 description-column">
                <div className="card card-top">
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
            </div>
            {itinerary.generalRecommendations && (
              <div className="row-detailed row bottom-card-row">
                <div className="col-md-10 description-column">
                  <div className="card card-bottom">
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
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
};

