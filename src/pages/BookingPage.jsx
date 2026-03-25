import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiGetPackageById, apiPostBooking } from '../service/PackageTravelService';
import { formatCurrency } from '../helpers/FormatCurrency';
import { CalendarIcon, MapPin, Clock, AlertCircle, ArrowLeft, UserIcon, ShieldAlert, MessageSquare, Plane, Mail, Users, MinusCircle, PlusCircle } from 'lucide-react';
import '../style/BookingPage.css';

export const BookingPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [specialRequests, setSpecialRequests] = useState('');
    const [phone, setPhone] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [travelerCount, setTravelerCount] = useState(1);

    const user = (() => {
        try {
            return JSON.parse(sessionStorage.getItem('user'));
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            sessionStorage.setItem('bookingRedirect', `/booking/${id}?start=${startDate}&end=${endDate}`);
            navigate('/login');
            return;
        }
        if (!startDate || !endDate) {
            navigate(`/detallePaquete/${id}`);
            return;
        }
        const fetchPackage = async () => {
            try {
                const data = await apiGetPackageById(id);
                setPackageData(data);
            } catch {
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [id, startDate, endDate, navigate]);

    const calcNights = () => {
        if (!startDate || !endDate) return 0;
        const diff = new Date(endDate) - new Date(startDate);
        return Math.round(diff / (1000 * 60 * 60 * 24));
    };

    const nights = calcNights();
    const basePrice = packageData?.price || packageData?.basePrice || 0;
    const capacity = packageData?.capacity || null;
    const totalPrice = basePrice * travelerCount;

    const getImage = () => {
        if (!packageData) return null;
        if (packageData.principalImage) return packageData.principalImage;
        if (Array.isArray(packageData.images) && packageData.images.length > 0) {
            const principal = packageData.images.find(img => img.principal || img.isPrincipal);
            return principal?.url || packageData.images[0]?.url || null;
        }
        if (Array.isArray(packageData.imageDetails)) {
            const principal = packageData.imageDetails.find(img => img.principal);
            return principal?.url || packageData.imageDetails[0]?.url || null;
        }
        return packageData.imageUrl || null;
    };

    const getErrorMessage = (error) => {
        if (error?.response?.data) {
            const d = error.response.data;
            if (typeof d === 'object') return d.error || d.message || null;
            if (typeof d === 'string' && d.length > 0) return d;
        }
        return 'No se pudo completar la reserva. Por favor, inténtalo nuevamente.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!acceptTerms) return;
        setBookingError(null);
        setSubmitting(true);
        try {
            await apiPostBooking({
                packageId: parseInt(id),
                startDate,
                endDate,
                phoneNumber: phone.trim() || null,
                specialRequests: specialRequests.trim() || null,
                travelerCount,
            });
            setBookingSuccess(true);
        } catch (error) {
            setBookingError(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {

        return (
            <div className="booking-loading">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (bookingSuccess) {
        return (
            <div className="booking-success-screen">
                <div className="booking-success-card">
                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '20px' }}>
                        <button
                            type="button"
                            className="btn btn-back"
                            onClick={() => navigate(-1)}
                            style={{ color: '#1A531A', fontSize: '1.1rem', fontWeight: 'bold', border: '3px solid #1A531A', borderRadius: '10px', padding: '5px', marginBottom: '40px' }}
                        >
                            <ArrowLeft size={20} />
                            Volver al inicio
                        </button>
                    </div>

                    <h2 className="booking-success-title">¡Reserva Confirmada!</h2>
                    <p className="booking-success-text">
                        Tu viaje a <strong>{packageData?.destination}</strong> ha sido reservado con éxito.<br />
                        Fecha: <strong>{startDate}</strong> / <strong>{endDate}</strong>
                    </p>
                    <div className="booking-success-email-notice d-block text-center">
                        <span className="booking-success-email-icon">
                            <Mail size={30} strokeWidth={3} style={{ marginBottom: '5px' }} />
                            <br />
                        </span>
                        <span style={{ fontSize: '1rem' }}>
                            Te enviamos un correo de confirmación con todos los detalles de tu reserva.
                        </span>
                    </div>
                    <button
                        className="booking-btn-primary"
                        onClick={() => navigate('/my-bookings')}
                    >
                        Ver mis reservas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-header">

                <button
                    type="button"
                    className="btn btn-back-to-list"
                    onClick={() => navigate(-1)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={18} />
                    Volver al Paquete
                </button>

            </div>
            <h1 className="booking-page-title">Confirmar Reserva</h1>

            <div className="booking-content">

                <div className="booking-form-column">
                    <section className="booking-section">
                        <h2 className="booking-section-title">
                            <UserIcon size={25} strokeWidth={3} /> Datos del Viajero
                        </h2>

                        <div className="booking-field-row">
                            <div className="booking-field">
                                <label className="booking-label">Nombre</label>
                                <input
                                    type="text"
                                    className="booking-input"
                                    value={user?.firstName || ''}
                                    readOnly
                                />
                            </div>
                            <div className="booking-field">
                                <label className="booking-label">Apellido</label>
                                <input
                                    type="text"
                                    className="booking-input"
                                    value={user?.lastName || ''}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="booking-field">
                            <label className="booking-label">Correo Electrónico</label>
                            <input
                                type="email"
                                className="booking-input"
                                value={user?.email || ''}
                                readOnly
                            />
                        </div>
                        <div className="booking-field">
                            <label className="booking-label">Teléfono de contacto <span style={{ color: '#B85C38', fontWeight: 700 }}>*</span></label>
                            <input
                                type="tel"
                                className="booking-input booking-input-editable"
                                placeholder="Ej: +54 9 11 1234-5678"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                            {!phone.trim() && (
                                <span className="booking-field-hint">Requerido para coordinar tu viaje por WhatsApp.</span>
                            )}
                        </div>
                    </section>

                    <section className="booking-section">
                        <h2 className="booking-section-title">
                            <Users size={25} strokeWidth={3} /> Cantidad de Viajeros
                        </h2>
                        {capacity && (
                            <p className="booking-hint">
                                Capacidad del paquete: <strong>{capacity} personas</strong>.
                                {travelerCount >= capacity && (
                                    <span className="booking-capacity-warning"> Solo quedan <strong>{capacity}</strong> cupos disponibles para este viaje.</span>
                                )}
                            </p>
                        )}
                        <div className="booking-traveler-selector">
                            <button
                                type="button"
                                className="booking-traveler-btn"
                                onClick={() => setTravelerCount(c => Math.max(1, c - 1))}
                                disabled={travelerCount <= 1}
                            >
                                <MinusCircle size={26} />
                            </button>
                            <span className="booking-traveler-count">{travelerCount} {travelerCount === 1 ? 'persona' : 'personas'}</span>
                            <button
                                type="button"
                                className="booking-traveler-btn"
                                onClick={() => setTravelerCount(c => capacity ? Math.min(capacity, c + 1) : c + 1)}
                                disabled={capacity ? travelerCount >= capacity : false}
                            >
                                <PlusCircle size={26} />
                            </button>
                        </div>
                    </section>

                    <section className="booking-section">
                        <h2 className="booking-section-title">
                            <MessageSquare size={25} strokeWidth={3} /> Peticiones Especiales
                        </h2>

                        <p className="booking-hint">Opcional — accesibilidad, preferencias de habitación, entre otros.</p>
                        <textarea
                            className="booking-textarea"
                            rows={4}
                            placeholder="Escribe aquí cualquier solicitud especial..."
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            maxLength={500}
                        />
                        <span className="booking-char-count">{specialRequests.length}/500</span>
                    </section>

                    <section className="booking-section booking-terms-section">
                        <h2 className="booking-section-title">
                            <ShieldAlert size={25} strokeWidth={3} /> Políticas y Condiciones
                        </h2>
                        <p className="booking-hint">
                            Al confirmar tu reserva aceptás nuestras políticas de cancelación, modificación y privacidad.
                            Tierra Nativa se reserva el derecho de cancelar o modificar reservas en casos de fuerza mayor.
                        </p>
                        <label className="booking-terms-label">
                            <input
                                type="checkbox"
                                className="booking-terms-checkbox"
                                checked={acceptTerms}
                                onChange={e => setAcceptTerms(e.target.checked)}
                            />
                            <span>
                                He leído y acepto los <strong>términos y condiciones</strong> y las <strong>políticas de Tierra Nativa</strong>.
                            </span>
                        </label>
                    </section>

                    {bookingError && (
                        <div className="booking-error-banner">
                            <AlertCircle size={18} />
                            <span>{bookingError}</span>
                        </div>
                    )}

                    <button
                        className="booking-btn-primary booking-submit-btn"
                        onClick={handleSubmit}
                        disabled={submitting || !acceptTerms || !phone.trim()}
                        title={!acceptTerms ? 'Debés aceptar los términos para continuar' : !phone.trim() ? 'Ingresá tu teléfono de contacto' : ''}
                    >
                        {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
                    </button>
                    {(!acceptTerms || !phone.trim()) && (
                        <p className="booking-terms-warning">
                            {!phone.trim() ? 'Ingresá tu teléfono de contacto para continuar.' : 'Aceptá los términos y condiciones para habilitar la reserva.'}
                        </p>
                    )}
                </div>

                <div className="booking-summary-column">
                    <div className="booking-summary-card">
                        <h2 className="booking-section-title">
                            <Plane size={25} strokeWidth={2.5} style={{ marginRight: '5px' }} />
                            Resumen de tu Viaje</h2>
                        {getImage() && (
                            <img
                                src={getImage()}
                                alt={packageData?.name}
                                className="booking-summary-img"
                            />
                        )}

                        <h3 className="booking-summary-package-name">{packageData?.name}</h3>

                        {packageData?.destination && (
                            <div className="booking-summary-detail">
                                <MapPin size={20} strokeWidth={3} color="#1A531A" />
                                <span style={{ color: '#1A531A', fontWeight: 'bold', fontSize: '1.1rem' }}>{packageData.destination}</span>
                            </div>
                        )}
                        <div className="booking-summary-divider" />

                        <div className="booking-summary-detail">
                            <CalendarIcon size={16} strokeWidth={3} color="#1A531A" />
                            <span>
                                <strong>Inicio:</strong> {startDate}
                            </span>
                        </div>
                        <div className="booking-summary-detail">
                            <CalendarIcon size={16} strokeWidth={3} color="#1A531A" />
                            <span>
                                <strong>Fin:</strong> {endDate}
                            </span>
                        </div>
                        <div className="booking-summary-detail">
                            <Clock size={16} strokeWidth={3} color="#1A531A" />
                            <span>
                                <strong>{nights}</strong> {nights === 1 ? 'noche' : 'noches'}
                            </span>
                        </div>
                        <div className="booking-summary-detail">
                            <Users size={16} strokeWidth={3} color="#1A531A" />
                            <span>
                                <strong>{travelerCount}</strong> {travelerCount === 1 ? 'viajero' : 'viajeros'}
                            </span>
                        </div>
                        {basePrice > 0 && (
                            <>
                                <div className="booking-summary-divider" />
                                <div className="booking-summary-detail" style={{ fontSize: '0.85rem', color: '#888' }}>
                                    <span>{formatCurrency(basePrice)} × {travelerCount} {travelerCount === 1 ? 'persona' : 'personas'}</span>
                                </div>
                                <div className="booking-summary-price">
                                    <span>Total estimado</span>
                                    <strong style={{ color: '#1A531A', fontSize: '1.3rem' }}>{formatCurrency(totalPrice)}</strong>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};
