import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../style/PackageDetailed.css';
import '../style/AvailabilityCalendar.css';
import { Clock, Tent, Car, Utensils, Circle, Star, AlertTriangle, RefreshCw, CalendarIcon, Loader2, Info, ShieldAlert, Leaf, BadgeCheck, TextAlignStart, Share2, X, Copy, Check, MessageSquare, UserCircle, Pencil, Trash2, ChevronRight, MessageCircle, ChevronLeft, Heart } from 'lucide-react';
import { IconLibrary } from '../component/AdminCharacteristic';
import { AvailabilityCalendar } from '../component/AvailabilityCalendar';
import { apiGetCharacteristics, apiGetPackageById, apiGetReviews, apiPostReview, fireAlert, apiToggleFavorite, apiUpdateReview, apiDeleteReview } from "../service/PackageTravelService";

export const PackageDetailed = () => {
  const params = useParams();
  const packageTravelId = params?.id || params?.packageId || null;
  const navigate = useNavigate();

  const { packageTravel: allPackages, favoriteIds, updateFavoriteInContext
  } = useContext(PackageTravelContext) || { packageTravel: [], favoriteIds: new Set() };

  const [packageTravel, setPackageTravel] = useState(null);
  const [allCharacteristics, setAllCharacteristics] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [calendarError, setCalendarError] = useState(false);

  const [showShare, setShowShare] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loadingFav, setLoadingFav] = useState(false);

  const FALLBACK_URL = 'https://images.pexels.com/photos/17217435/pexels-photo-17217435.jpeg';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
  const currentUserFullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const isUserLoggedIn = !!sessionStorage.getItem('jwtToken');
  const isFavorite = packageTravel && favoriteIds instanceof Set && favoriteIds.has(packageTravel.id);

  const getSocialIcon = (path) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: '20px', height: '20px' }}
    >
      <path d={path} />
    </svg>
  );

  const policyData = {
    environment: [
      "Prohibido dejar cualquier tipo de residuo en senderos.",
      "Respetar el silencio en áreas de anidación.",
      "No alimentar a la fauna silvestre bajo ninguna circunstancia."
    ],
    safety: [
      "Es obligatorio contar con seguro de viaje de asistencia médica.",
      "Uso estricto de calzado de trekking con buen agarre.",
      "Informar alergias o condiciones cardíacas previo al ascenso."
    ],
    cancellation: [
      "Reembolso total cancelando hasta 72hs antes del inicio.",
      "En caso de mal clima extremo, se reprogramará sin costo.",
      "Si no puede asistir y esto no es notificado con antelación no se realizan devoluciones."
    ]
  };

  const getReviewerColor = (review) => {
    const isAdmin = review.userRole === 'ADMIN' ||
      review.userRole === 'SUPER_ADMIN' ||
      review.userName?.toLowerCase().includes('admin') ||
      review.userName?.toLowerCase().includes('super');
    return isAdmin ? '#FFB700' : '#1A531A';
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const wasLoggedIn = useRef(isUserLoggedIn);

  useEffect(() => {
    if (wasLoggedIn.current && !isUserLoggedIn) {
      navigate('/home');
    }
    wasLoggedIn.current = isUserLoggedIn;
  }, [isUserLoggedIn, navigate]);

  const processedData = useMemo(() => {
    if (!packageTravel) return null;

    const idsFromPackage = [
      ...(packageTravel.characteristicIds || []).map(i => Number(i?.id ?? i)),
      ...(packageTravel.characteristics || []).map(c => Number(c?.id ?? c))
    ].filter(Boolean);

    const features = allCharacteristics.filter(masterChar => {
      const masterId = Number(masterChar.id);
      if (idsFromPackage.includes(masterId)) return true;
      const pkgsField = masterChar.packages || masterChar.packageIds;
      if (Array.isArray(pkgsField) && pkgsField.length) {
        return pkgsField.some(p => Number(p?.id ?? p) === Number(packageTravel.id));
      }
      return false;
    });

    const allImg = Array.isArray(packageTravel.imageDetails) ? packageTravel.imageDetails : [];
    const principal = allImg.find(img => img.principal === true) || allImg[0];
    const mainUrl = principal?.url || packageTravel.imageUrl || FALLBACK_URL;
    const secondary = allImg.filter(img => img.url !== mainUrl).map(img => img.url).slice(0, 4);

    const itinerary = packageTravel.itineraryDetail || {};
    const recommendations = itinerary.generalRecommendations
      ? itinerary.generalRecommendations.split('.').map(s => s.trim()).filter(s => s.length > 0).map(s => s + '.')
      : [];
    return { features, mainUrl, secondary, allImg, itinerary, recommendations };
  }, [packageTravel, allCharacteristics]);

  const highlightedReview = useMemo(() => reviewsList[0], [reviewsList]);

  const loadDetails = useCallback(async () => {
    if (!packageTravelId) return;
    setLoadingDetail(true);
    setCalendarError(false);
    try {
      const found = await apiGetPackageById(packageTravelId);
      if (found) {
        setPackageTravel(found);
        setCustomMessage(`¡Mira esta aventura en ${found.destination}!`);
        try {
          const reviews = await apiGetReviews(packageTravelId);
          setReviewsList(Array.isArray(reviews) ? reviews : []);
        } catch (revErr) { setReviewsList([]); }
      } else { setCalendarError(true); }
    } catch (e) { setCalendarError(true); }
    finally { setLoadingDetail(false); }
  }, [packageTravelId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    const fetchCharacteristics = async () => {
      try {
        const data = await apiGetCharacteristics();
        setAllCharacteristics(Array.isArray(data) ? data : (data?.data || []));
      } catch (error) { setAllCharacteristics([]); }
    };
    fetchCharacteristics();
  }, []);

  const handleCopyLink = () => {
    const el = document.createElement('textarea');
    el.value = shareUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = async () => {
    if (!isUserLoggedIn) {
      fireAlert('Acceso Requerido', 'Debes iniciar sesión para guardar favoritos.', 'warning');
    } else {
      setLoadingFav(true);
      try {
        const res = await apiToggleFavorite(packageTravel.id);
        if (updateFavoriteInContext) {
          updateFavoriteInContext(packageTravel.id, res.isFavorite);
        }
        if (!res.isFavorite) {
          fireAlert('Eliminado', 'El paquete ha sido eliminado de tus favoritos.', 'info');
        }
      } catch (error) {
        fireAlert('Operación Fallida', 'No se pudo actualizar el estado de favorito.', 'error');
      } finally {
        setLoadingFav(false);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await fireAlert(
      "¿Eliminar reseña?",
      "Esta acción no se puede deshacer.",
      "warning",
      true
    );
    if (result.isConfirmed) {
      try {
        await apiDeleteReview(reviewId);
        const updatedList = reviewsList.filter(r => r.id !== reviewId);
        setReviewsList(updatedList);
        const freshPkg = await apiGetPackageById(packageTravelId);
        if (freshPkg) setPackageTravel(freshPkg);

      } catch (error) {
      }
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setUserScore(review.score);
    setUserComment(review.comment);
    setShowReviewForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (userScore === 0) {
      fireAlert("Puntuación requerida", "Por favor selecciona las estrellas.", "warning");
      return;
    }
    setIsSubmittingReview(true);
    const reviewData = {
      score: userScore,
      comment: userComment,
      packageId: packageTravelId
    };
    try {

      if (editingReviewId) {
        await apiUpdateReview(editingReviewId, reviewData);
      } else {
        await apiPostReview(reviewData);
      }
      const [freshReviews, freshPkg] = await Promise.all([
        apiGetReviews(packageTravelId),
        apiGetPackageById(packageTravelId)
      ]);
      setReviewsList(freshReviews);
      if (freshPkg) setPackageTravel(freshPkg);
      setShowReviewForm(false);
      setEditingReviewId(null);
      setUserScore(0);
      setUserComment("");
    } catch (error) {
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleNextImage = () => setActiveImageIndex((prev) => (prev + 1) % (processedData?.allImg?.length || 1));
  const handlePrevImage = () => setActiveImageIndex((prev) => (prev - 1 + (processedData?.allImg?.length || 1)) % (processedData?.allImg?.length || 1));

  if (loadingDetail || !packageTravel)
    return <div className="p-20 text-center">
      <Loader2 className="animate-spin mx-auto" /></div>;

  if (loadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="uppercase tracking-widest" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', padding: '250px 0 0 0', textAlign: 'center' }}>Sincronizando aventura...</p>
        </div>
      </div>
    );
  }

  if (calendarError || !packageTravel || !processedData) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full p-10 text-center bg-white rounded-[3rem] shadow-xl border border-red-50">
          <AlertTriangle className="mx-auto text-red-500 mb-6" size={60} />
          <h4 className="text-slate-900 font-black uppercase tracking-tight mb-3 text-center text-start">Información No Disponible</h4>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4 text-start">Lo sentimos, no pudimos obtener los datos de disponibilidad del paquete en este momento.</p>
          <button
            onClick={loadDetails}
            className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg"
          >
            <RefreshCw size={18} /> Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const { features, mainUrl, secondary, allImg, itinerary, recommendations } = processedData;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(customMessage + " " + shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(customMessage)}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${encodeURIComponent("Mira este viaje: " + packageTravel.name)}&body=${encodeURIComponent(customMessage + " " + shareUrl)}`,
    discord: `https://discord.com/channels/@me`,
    instagram: `https://www.instagram.com/`
  };

  return (
    <>
      <header className="detail-header-block" style={{ paddingTop: '70px' }}>
        <div className="header-content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="product-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {packageTravel.name}

            <button
              onClick={handleToggleFavorite}
              disabled={loadingFav}
              className={`button-icon-favorite ${isFavorite ? 'true' : 'false'}`}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              style={{ marginBottom: '10px', marginRight: '15px', cursor: 'pointer', padding: '10px', marginTop: '10px' }}
            >
              <Heart
                size={32}
                fill={isFavorite ? "#fff" : "none"}
                stroke={isFavorite ? "#fff" : "currentColor"}
                strokeWidth={2.5}
              />
            </button>
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="back-button"
              onClick={() => navigate(-1)} aria-label="Volver">
              &larr; Volver
            </button>

            <button
              onClick={() => setShowShare(true)}
              className="btn btn-light"
              style={{ padding: '8px 15px', alignItems: 'center', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.3rem', borderRadius: '5px', transition: 'background-color 0.3s' }}
            >
              <Share2 size={20} strokeWidth={3} style={{ paddingRight: '4px' }} /> Compartir
            </button>
          </div>
        </div>
      </header>

      <main className="detail-main-content">
        <section className="image-gallery-block">
          <div className="col-lg-9 p-0">
            <div className="gallery-layout">
              <div className="main-image-container">
                <img src={mainUrl} alt="main" className="" style={{ width: '500px', borderRadius: '12px', height: '100%', objectFit: 'cover' }} />
              </div>

              <div className="secondary-images-grid">
                {secondary.map((imgUrl, index) => (
                  <div key={index} className="secondary-image-wrapper rounded-4 overflow-hidden shadow-sm bg-slate-100">
                    <img src={imgUrl} alt="sec" className="w-500 h-100 object-cover" />
                  </div>
                ))}
                {allImg.length > 5 && (
                  <button className="ver-mas-overlay" onClick={() => { setActiveImageIndex(0); setShowGallery(true); }}>
                    <span className="ver-mas-text">Ver más</span>
                  </button>
                )}
              </div>
            </div>
          </div>


          <div className="col-lg-3 font-black"
            style={{ height: '500px', justifyContent: 'center', display: 'flex', flexDirection: 'column', paddingLeft: '20px' }} >
            <div
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasReviews"
              className=" flex flex-col cursor-pointer "
              style={{ borderRadius: '12px', backgroundColor: '#fff', color: '#333', border: '2px solid transparent', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              <div className="flex justify-between items-start">
                <div className="text-start">
                  <h4 className="uppercase tracking-tighter italic"
                    style={{ fontWeight: 'bold', fontSize: '2rem', color: '#1A531A', margin: '10px 0 4px 0' }}>Opiniones</h4>
                  <p className="uppercase tracking-widest"
                    style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1A531A' }}>{reviewsList.length} comentarios</p>
                </div>

                <div className=" px-3 py-2 rounded-2xl text-lg"
                  style={{ fontWeight: 'bold', background: '#1A531A', fontSize: '1.1rem', color: '#FAF8F0', width: '85px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }} >
                  <Star size={18} fill="#fff" className="mr-4" />
                  {packageTravel.averageRating?.toFixed(1) || "0.0"}
                </div>
              </div>

              {highlightedReview ? (
                <div className="p-4 flex-grow italic text-start"
                  style={{ background: '#9ca0a426', marginBottom: '12px', marginTop: '12px', borderRadius: '12px', width: '100%' }} >
                  <p className="text-xs line-clamp-4 leading-relaxed" >"{highlightedReview.comment}"</p>

                  <div className=" flex items-center gap-2"
                    style={{ background: getReviewerColor(highlightedReview), color: '#fff', padding: '12px 16px', width: '100%', borderRadius: '12px' }} >
                    <UserCircle size={20} color='#fff' strokeWidth={2.5} />
                    <span className=" m-1 uppercase" style={{ fontWeight: 'bold' }}>{highlightedReview.userName}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center"
                  style={{ background: '#9ca0a426', marginBottom: '12px', marginTop: '12px', borderRadius: '12px', width: '100%', color: '#1A531A', padding: '40px 20px' }} >
                  <MessageCircle size={32} className="mb-2" />
                  <p className=" uppercase tracking-widest" >Sin reseñas aún</p>
                </div>
              )}

              <button className="btn btn-success"
                style={{ color: '#fff', backgroundColor: '#1A531A', transition: 'all 0.3s', borderRadius: '12px', width: 'autofit', textAlign: 'center', border: 'none' }} >
                Ver todas <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        <div className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasReviews"
          aria-labelledby="offcanvasReviewsLabel"
          style={{ width: '100%', maxWidth: '600px', borderRadius: '2rem 0 0 2rem' }}>

          <div className="offcanvas-header p-4 border-bottom"
            style={{ background: '#1A531A', color: '#fff', borderRadius: '2rem 0 0 0' }}>

            <div className="text-start">
              <h5
                id="offcanvasReviewsLabel"
                className="uppercase tracking-tighter italic m-0"
                style={{ fontSize: '2rem', fontWeight: 'bold', paddingTop: '15px' }}>Comentarios</h5>

              <p className="uppercase tracking-widest mt-1"
                style={{ fontSize: '1.1rem' }}>La voz de nuestros viajeros</p>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white shadow-none"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
              style={{ marginTop: '-60px', marginRight: '15px' }}>

            </button>
          </div>

          <div className="offcanvas-body p-4 custom-scrollbar">
            <div className="flex items-center gap-6 mb-10">
              <div className="text-start"
                style={{ fontWeight: 'bold', background: '#1A531A', color: '#FAF8F0', width: '60px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }} >
                {packageTravel.averageRating?.toFixed(1)}
              </div>

              <p className="uppercase tracking-widest"
                style={{ color: '#1A531A', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'start', marginBottom: '10px' }}>Puntaje</p>
              <div className="text-start">
                <div className="flex gap-1 mb-1 ">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill={s <= Math.round(packageTravel.averageRating) ? "#FFB700" : "none"} />)}
                </div>
                <p className="text-sm font-bold opacity-90"
                  style={{ color: '#1A531A', fontWeight: 'bold', marginBottom: '10px' }}>{reviewsList.length} valoraciones totales</p>
              </div>
            </div>

            {isUserLoggedIn && (
              <div className="mb-10">

                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="btn btn-success"
                    style={{ fontSize: '1.1rem', fontWeight: 'bold', backgroundColor: '#1A531A', color: '#FAF8F0', borderRadius: '12px', marginTop: '15px', marginBottom: '15px' }} >

                    + Publicar mi experiencia

                  </button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="p-6 rounded-3xl  text-start" >
                    <div className="flex inline items-center mb-3"
                      style={{ borderTop: '1px solid #9ca0a4', marginTop: '15px', paddingTop: '15px' }} >

                      <h4 className="uppercase tracking-widest"
                        style={{
                          color: '#1A531A', fontSize: '1.9rem', fontWeight: 'bold', marginTop: '15px', width: '100%', display: 'inline'
                        }}>{editingReviewId ? "Actualizar Reseña" : "Nueva Reseña"}</h4>

                      <button
                        type="button"
                        onClick={() => { setShowReviewForm(false); setEditingReviewId(null); }}
                        className="bg-transparent flex"
                        style={{ float: 'right', background: 'trasparent', border: 'none', color: '1A531A' }}><X size={25} /></button>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(s => {
                        const isActive = s <= (hoverScore || userScore);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={(e) => { e.preventDefault(); setUserScore(s); }}
                            onMouseEnter={() => setHoverScore(s)}
                            onMouseLeave={() => setHoverScore(0)}
                            className="bg-transparent border-0 p-0 hover:scale-110 transition-transform">
                            <Star size={32} fill={isActive ? "#fbbf24" : "none"} color={isActive ? "#fbbf24" : "#cbd5e1"}
                              strokeWidth={1.5}
                              style={{ pointerEvents: 'none' }} />
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      required minLength={10}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className=" p-3 border rounded-xl italic  shadow-inner"
                      style={{ width: '551px', background: '#fff', color: '#333' }}
                      placeholder="Cuéntanos los detalles..."
                      rows="3" />

                    <button
                      disabled={isSubmittingReview}
                      className="btn btn-success"
                      style={{ background: '#1A531A', color: '#fff', borderRadius: '12px', marginTop: '10px', fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px' }} >
                      {isSubmittingReview ? <Loader2 className="animate-spin" size={18} /> : "Guardar mi Valoración"}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="space-y-4" >
              {reviewsList.map(r => (
                <div key={r.id} className="border border-slate-100 group"
                  style={{ padding: '30px 30px 10px 30px', borderRadius: '12px', position: 'relative', background: '#9ca0a426', marginBottom: '20px' }} >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className=" rounded-circle d-flex align-items-center justify-center uppercase"
                        style={{ background: getReviewerColor(r), fontSize: '15px', fontWeight: 'bold', flexShrink: 0, width: '35px', height: '35px', color: '#fff', padding: '5px 6px' }} >
                        {getInitials(r.userName)}
                      </div>

                      <div className="text-start">
                        <p className="font-black uppercase medium" style={{ color: getReviewerColor(r), marginTop: '5px', fontWeight: 'bold' }}>{r.userName}</p>
                        <p className="m-0" style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{new Date(r.date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-5">
                      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} style={{ border: 'none', marginBottom: '15px' }} size={20} fill={s <= r.score ? "#fbbf24" : "none"} />)}</div>
                      <p className="italic m-0 leading-relaxed">"{r.comment}"</p>
                      {isUserLoggedIn && r.userName === currentUserFullName && (
                        <div className="flex gap-2" style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: '20px' }}>
                          <button
                            onClick={() => handleEditClick(r)}
                            className="p-1"
                            style={{ background: '#fff', borderRadius: '10px', marginRight: '5px', width: '50px', height: '35px' }}>
                            <Pencil size={20} strokeWidth={3} color='#1A531A' />
                          </button>

                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1"
                            style={{ background: '#fff', borderRadius: '10px', width: '50px', height: '35px' }} >
                            <Trash2 size={20} strokeWidth={3} color='#1A531A' />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showShare && (
          <div className="fixed-top d-flex align-items-center justify-content-center p-4"
            style={{ zIndex: 1100, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>

            <div className="rounded-5 overflow-hidden shadow-2xl relative d-flex flex-column flex-md-row animate-in fade-in zoom-in duration-300"
              style={{ background: '#fff', width: '90%', maxWidth: '1500px', maxHeight: '600px' }}>

              <div className="col-md-5"><img src={mainUrl} className="w-100 h-100 object-cover" alt="prev" /></div>
              <div className="col-md-6 p-4 text-start" style={{ width: '650px', marginLeft: '15px' }}>
                <h3 className="h4 fw-black uppercase italic mb-3"
                  style={{ fontSize: '2rem', color: '#1A531A', fontWeight: 'bolder', paddingTop: '20px' }}>Compartir Experiencia</h3>

                <p className=" mb-4" style={{ color: '#333', fontSize: '1.1rem', width: '650px' }}>{packageTravel.shortDescription}</p>
                <label className="medium fw-bold text-muted uppercase tracking-widest mb-1">Tu Mensaje</label>
                <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}
                  className="form-control mb-4 rounded-4 border-0 italic"
                  style={{ width: '650px', background: '#9ca0a426', border: '1px solid #9ca0a4' }} rows="3" />

                <div className="d-flex gap-3 mb-4">
                  <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="btn btn-primary rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    {getSocialIcon("M12 2C6.47 2 2 6.47 2 12c0 5.09 3.69 9.3 8.5 9.87V15h-2.5v-3H10V9.8c0-2.73 1.64-4.5 4.1-4.5 1.15 0 2.22.2 2.53.29V8h-1.6c-1.3 0-1.56.62-1.56 1.53V12h3l-0.5 3h-2.5v6.87C18.31 21.3 22 17.09 22 12c0-5.53-4.47-10-10-10z")}
                  </a>
                  <a href={shareLinks.twitter} target="_blank" rel="noreferrer" className="btn btn-dark rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    {getSocialIcon("M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z")}
                  </a>
                  <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="btn btn-success rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    {getSocialIcon("M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z")}
                  </a>
                  <a href={shareLinks.instagram} target="_blank" rel="noreferrer" className="btn btn-danger rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)', border: 'none' }}>
                    {getSocialIcon("M12 2.163c3.2 0 3.585.016 4.85.071 4.567.16 6.075 1.765 6.237 6.237.058 1.265.071 1.65.071 4.85s-.013 3.585-.071 4.85c-.162 4.47-1.67 6.075-6.237 6.237-1.265.058-1.65.071-4.85.071s-3.585-.013-4.85-.071c-4.567-.16-6.075-1.765-6.237-6.237-.058-1.265-.071-1.65-.071-4.85s.013-3.585.071-4.85c.16-4.47 1.667-6.075 6.237-6.237C8.415 2.179 8.799 2.163 12 2.163zm0 4.025a5.812 5.812 0 100 11.625 5.812 5.812 0 000-11.625zm0 1.95a3.863 3.863 0 110 7.725 3.863 3.863 0 010-7.725zm6.5-1.938a1.313 1.313 0 100 2.625 1.313 1.313 0 000-2.625z")}
                  </a>
                  <a href={shareLinks.telegram} target="_blank" rel="noreferrer" className="btn btn-info text-white rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#0088cc', border: 'none' }}>
                    {getSocialIcon("M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.202-3.04 5.486-4.956c.238-.217-.052-.333-.367-.123L8.411 13.04l-2.943-.92c-.639-.2-.65-.639.133-.946l11.49-4.428c.531-.194.996.124.803.475z")}
                  </a>
                  <a href={shareLinks.discord} target="_blank" rel="noreferrer" className="btn rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px', backgroundColor: '#5865F2', border: 'none' }}>
                    {getSocialIcon("M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z")}
                  </a>
                  <a href={shareLinks.gmail} target="_blank" rel="noreferrer" className="btn rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px', backgroundColor: '#EA4335', border: 'none' }}>
                    {getSocialIcon("M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.39l-9 6.49-9-6.49V21H1.5c-.85 0-1.5-.65-1.5-1.5v-15c0-.85.65-1.5 1.5-1.5H3l9 6.49L21 3h1.5c.85 0 1.5.65 1.5 1.5z")}
                  </a>
                </div>

                <div className="d-flex align-items-center gap-2 p-2 rounded-4 border"
                  style={{ width: '650px', background: '#9ca0a426', border: '1px solid #9ca0a4', marginBottom: '20px' }}>
                  <span className="small text-muted truncate flex-grow-1 ps-2">{shareUrl}</span>

                  <button
                    onClick={handleCopyLink}
                    className={`btn btn-sm ${copied ? 'btn-success' : 'btn-dark'} rounded-pill px-3 fw-bold uppercase text-[9px]`}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copiado' : 'Copiar'}
                  </button>

                </div>
              </div>
              <div className="col-md-1">
                <button
                  onClick={() => setShowShare(false)}
                  className="btn-close absolute top-0 end-0 shadow-none border-0 z-index-10"
                  style={{ left: 'auto', marginRight: '0', paddingRight: '70px', paddingTop: '50px' }}
                ></button>
              </div>
            </div>
          </div>
        )}

        {showGallery && (
          <div className="fixed-top vh-100 d-flex flex-column align-items-center justify-content-center p-0"
            style={{ zIndex: 3000, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
            <div className="w-100 p-4 d-flex justify-content-between align-items-center text-white position-absolute top-0">
              <div className="text-start">
                <h2 className=" m-0 uppercase tracking-tighter italic" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{packageTravel.name}</h2>
                <p className="text-white-50 m-0" style={{ fontSize: '1.1rem' }}>{activeImageIndex + 1} / {allImg.length} fotos</p>
              </div>

              <button
                onClick={() => setShowGallery(false)}
                className="btn border-0 shadow-none hover:scale-110 transition-transform"
                style={{ marginTop: '-20px' }}>
                <X size={24} color="#fff" />
              </button>
            </div>

            <div className="d-flex align-items-center justify-content-center w-100 px-5 flex-grow-1"
              style={{ background: '#9ca0a426', paddingTop: '50px' }}>

              <button
                onClick={handlePrevImage}
                className="btn btn-link text-white p-3 hover:bg-white/10 rounded-circle border-0 shadow-none">
                <ChevronLeft size={48} strokeWidth={3} />
              </button>

              <div className="mx-4 position-relative" style={{ maxWidth: '80%', maxHeight: '65vh' }}>
                <img src={allImg[activeImageIndex]?.url} className="rounded-4 shadow-2xl animate-in fade-in zoom-in duration-500" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} alt="gallery" />
              </div>

              <button
                onClick={handleNextImage}
                className="btn btn-link text-white p-3 hover:bg-white/10 rounded-circle border-0 shadow-none">
                <ChevronRight size={48} strokeWidth={3} />
              </button>
            </div>

            <div className="w-100 bg-black/40 py-4 px-4 overflow-x-auto d-flex gap-3 justify-content-center custom-scrollbar"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {allImg.map((img, idx) => (
                <div key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`rounded-3 overflow-hidden cursor-pointer transition-all ${idx === activeImageIndex ? 'border border-4 border-blue-500 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                  style={{ width: '80px', height: '60px', flexShrink: 0 }}>
                  <img src={img.url}
                    className="w-100 h-100 object-cover"
                    alt="thumb" /></div>
              ))}
            </div>
          </div>
        )}

        <section className="container-calendar p-10 md:p-16 bg-slate-50 rounded-[4rem] mb-20 shadow-inner" style={{ margin: '50px auto 50px auto' }}>
          <div className="mb-12 text-start">
            <div className="header-calendar flex items-center gap-3 mb-2">
              <CalendarIcon className="text-blue-600" size={28} />
              <h2 className="title-calendar uppercase tracking-tighter m-0">Calendario de Disponibilidad</h2>
            </div>
          </div>

          <AvailabilityCalendar
            availabilityBlocks={packageTravel.availabilityBlocks}
            selectable={true}
            numberOfDays={packageTravel.numberOfDays || 1}
            onRangeSelect={(start, end) => {
              setSelectedStart(start);
              setSelectedEnd(end);
            }}
          />

          <div className="mt-0 p-4 d-block text-center">
            <p className="sub-title-calendar medium m-0 fw-bold text-center uppercase tracking-widest " style={{ color: '#fff' }}>
              ¿Todo listo para tu aventura? <br />
              Selecciona tus fechas en el calendario y confirma tu reserva.</p>

            <button
              className="btn btn-success mt-3"
              disabled={!selectedStart || !selectedEnd}
              style={{ opacity: (!selectedStart || !selectedEnd) ? 0.65 : 1, borderRadius: '10px', background: '#fff', color: '#1A531A', fontWeight: 'bolder' }}
              onClick={() => {
                const isLoggedIn = !!sessionStorage.getItem('jwtToken');
                if (!isLoggedIn) {
                  sessionStorage.setItem(
                    'bookingRedirect',
                    `/booking/${packageTravelId}?start=${selectedStart}&end=${selectedEnd}`
                  );
                  navigate('/login');
                } else {
                  navigate(`/booking/${packageTravelId}?start=${selectedStart}&end=${selectedEnd}`);
                }
              }}
            >
              {(!selectedStart || !selectedEnd) ? 'Selecciona fechas para reservar' : 'Iniciar Reserva'}
            </button>
          </div>
        </section>

        <section className="section-characteristic  p-8 md:p-12 shadow-sm ">
          <div className="mb-10">
            <h2 className="title-detailed-characteristic">Características del Paquete</h2>
            <p className="text-detailed-characteristic">Servicios y comodidades que incluye esta experiencia.</p>
          </div>

          <ul className="list-group list-group-horizontal flex-wrap gap-2 justify-center">
            {features && features.length > 0 ? (
              features.map((item) => {
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

        <section className="product-details-section" style={{ backgroundColor: '#faf8f035', padding: '50px 0px 50px 0px' }}>
          <div className="w-100 text-center mb-12">
            <div className="d-inline-flex align-items-center justify-content-center">
              <TextAlignStart size={32} color="#fff" strokeWidth={3} className="me-2" />
              <h2 className="uppercase m-0" style={{ fontWeight: 'bolder', color: '#fff', fontSize: '2rem' }}>
                Detalles de la Experiencia
              </h2>
            </div>
            <div className="bg-blue-600 rounded-pill mt-3 mx-auto" style={{ height: '4px', width: '100px' }}></div>
          </div>

          <div className="details-content">
            <div className="row-detailed row top-cards-row ">
              <div className="col-md-6 col-lg-5 description-column">
                <div className="card card-top">
                  <h2 className="card-header">Resumen del Itinerario</h2>
                  <div className="card-body">
                    <p >
                      <Clock size={20} strokeWidth={3} />
                      <span className="itinerary-label">Duración: </span>
                      <span className="itinerary-value">{itinerary.duration}</span>
                    </p>
                    <p >
                      <Tent size={20} strokeWidth={3} />
                      <span className="itinerary-label">Hospedaje: </span>
                      <span className="itinerary-value">{itinerary.lodgingType}</span>
                    </p>
                    <p>
                      <Car size={20} strokeWidth={3} />
                      <span className="itinerary-label">Traslados: </span>
                      <span className="itinerary-value">{itinerary.transferType}</span>
                    </p>
                    <p >
                      <Utensils size={20} strokeWidth={3} />
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
                                      strokeWidth: '5'
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
                      {recommendations.length > 0 ? (
                        <ul className="card-list list-unstyled">
                          {recommendations.map((recommendation, index) => (
                            <li
                              key={index}
                              className="card-list-item"
                            >
                              <Circle
                                size={20}
                                style={{
                                  color: '#B85C38',
                                  marginRight: '8px',
                                  strokeWidth: '5'
                                }}
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

        <section className="product-policies-section py-12 mt-20 w-full"
          style={{ color: '#fff', backgroundColor: '#faf8f035', padding: '50px', margin: '50px auto auto auto' }}>
          <div className="mb-10 text-center ">
            <h2 className="text-policies">
              <div className="d-inline-flex align-items-center gap-1">
                <BadgeCheck size={32} color="#fff" strokeWidth={3} className="me-2" />
                <span style={{ fontSize: '2rem', fontWeight: 'bolder', textAlign: 'center' }}>
                  Políticas del Producto
                </span>
              </div>
            </h2>
            <p className="font-medium italic mt-3 mb-5"
              style={{ fontSize: '1.3rem' }}>Infórmate sobre los cuidados y precauciones necesarios para disfrutar al máximo.</p>
          </div>

          <div className="row g-5">
            <div className="col-12 col-md-4">
              <div className="p-4 h-100 rounded-4 border" style={{ background: '#fff' }}>
                <div className="mb-3" style={{ textAlign: 'center', borderBottom: '2px solid #1A531A' }}>
                  <div className="d-inline-flex align-items-center gap-1">
                    <div className="p-2"><Leaf size={25} color="#1A531A" strokeWidth={3} /></div>
                    <h4 className="uppercase tracking-tight m-0"
                      style={{ fontSize: '1.875rem', color: '#1A531A', fontWeight: 'bold' }}
                    >Medio Ambiente</h4>
                  </div>
                </div>

                <div className="leading-relaxed font-medium" style={{ color: '#333', fontSize: '1.1rem' }}>
                  Como protectores de lo nativo, exigimos respeto absoluto por el entorno:
                  <ul className="mt-3 ps-0 list-unstyled">
                    {policyData.environment.map((text, idx) => (
                      <li key={idx} className="mb-2 d-flex align-items-start">
                        <Circle size={20} style={{ color: '#B85C38', marginRight: '8px', strokeWidth: '5', flexShrink: '0', marginTop: '4px' }} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 h-100 rounded-4 border border-slate-100 transition-all hover:shadow-lg" style={{ background: '#fff' }}>
                <div className="mb-3" style={{ textAlign: 'center', borderBottom: '2px solid #1A531A' }}>
                  <div className="d-inline-flex align-items-center gap-1">
                    <div className="p-2"><ShieldAlert size={25} color="#1A531A" strokeWidth={3} /></div>
                    <h4 className="uppercase tracking-tight m-0"
                      style={{ fontSize: '1.875rem', color: '#1A531A', fontWeight: 'bold' }}>Salud y Seguridad</h4>
                  </div>
                </div>

                <div className="leading-relaxed font-medium" style={{ color: '#333', fontSize: '1.1rem' }}>
                  Tu bienestar es nuestra prioridad en la montaña:
                  <ul className="mt-3 ps-0 list-unstyled">
                    {policyData.safety.map((text, idx) => (
                      <li key={idx} className="mb-2 d-flex align-items-start">
                        <Circle size={20} style={{ color: '#B85C38', marginRight: '8px', strokeWidth: '5', flexShrink: '0', marginTop: '4px' }} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-4 h-100 rounded-4 border border-slate-100 transition-all hover:shadow-lg" style={{ background: '#fff' }}>
                <div className="mb-3" style={{ textAlign: 'center', borderBottom: '2px solid #1A531A' }}>
                  <div className="d-inline-flex align-items-center gap-1">
                    <div className="p-2"><Info size={25} color="#1A531A" strokeWidth={3} /></div>
                    <h4 className="uppercase tracking-tight m-0"
                      style={{ fontSize: '1.875rem', color: '#1A531A', fontWeight: 'bold' }}>Cancelación</h4>
                  </div>
                </div>

                <div className="leading-relaxed font-medium" style={{ color: '#333', fontSize: '1.1rem' }}>
                  Entendemos los imprevistos de la naturaleza:
                  <ul className="mt-3 ps-0 list-unstyled">
                    {policyData.cancellation.map((text, idx) => (
                      <li key={idx} className="mb-2 d-flex align-items-start">
                        <Circle size={20} style={{ color: '#B85C38', marginRight: '8px', strokeWidth: '5', flexShrink: '0', marginTop: '4px' }} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

