import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiGetMyBooking, apiCancelBooking, fireAlert } from '../service/PackageTravelService';
import { CalendarIcon, MapPin, Star, CheckCircle, ArrowUpDown, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import '../style/BookingHistoryPage.css';

const STATUS_LABEL = {
    CONFIRMED: 'Confirmada',
    FINISHED: 'Finalizada',
    CANCELLED: 'Cancelada',
};

const STATUS_CLASS = {
    CONFIRMED: 'booking-status-confirmed',
    FINISHED: 'booking-status-finished',
    CANCELLED: 'booking-status-cancelled',
};

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

const canCancelBooking = (startDate) => {
    if (!startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return diffDays > 15;
};

export const BookingHistoryPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [cancellingId, setCancellingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            sessionStorage.setItem('bookingRedirect', '/my-bookings');
            navigate('/login');
            return;
        }
        const fetchBookings = async () => {
            try {
                const data = await apiGetMyBooking();
                setBookings(Array.isArray(data) ? data : []);
            } catch {
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [navigate]);

    const handleCancelBlocked = (startDate) => {
        const fecha = formatDate(startDate);
        Swal.fire({
            title: 'No es posible cancelar esta reserva',
            html: `Lo sentimos, según nuestras <strong>Políticas de Cancelación</strong>, las reservas solo pueden anularse con un mínimo de <strong>15 días de antelación</strong> a la fecha de inicio del viaje.<br><br>
                   Debido a que tu viaje comienza el <strong>${fecha}</strong>, el plazo para la cancelación autogestionada ha expirado.<br><br>
                   Si tienes una emergencia, por favor contacta a un asesor por <strong>WhatsApp</strong>.`,
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1A531A',
        });
    };

    const handleCancel = async (bookingId) => {
        const result = await fireAlert(
            '¿Cancelar reserva?',
            'Esta acción no se puede deshacer. ¿Confirmas que deseas cancelar esta reserva?',
            'warning',
            true
        );
        if (!result?.isConfirmed) return;
        setCancellingId(bookingId);
        try {
            await apiCancelBooking(bookingId);
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)
            );
            fireAlert('Reserva cancelada', 'Tu reserva ha sido cancelada exitosamente.', 'success');
        } catch {
        } finally {
            setCancellingId(null);
        }
    };

    const getFilteredAndSorted = () => {
        let list = [...bookings];
        if (filterStatus !== 'ALL') {
            list = list.filter(b => (b.status || b.estado) === filterStatus);
        }
        list.sort((a, b) => {
            const dateA = new Date(a.startDate || 0);
            const dateB = new Date(b.startDate || 0);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return list;
    };

    if (loading) {
        return (
            <div className="history-loading">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    const filteredBookings = getFilteredAndSorted();

    return (
        <div className="history-page">
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '20px' }}>
                <button
                    type="button"
                    className="btn btn-back-to-list"
                    onClick={() => navigate('/home')}
                    style={{ marginBottom: '0', marginTop: '50px' }}
                >
                    <ArrowLeft size={20} />
                    Volver al inicio
                </button>
            </div>
            <div className="history-header">
                <h1 className="history-title">Mis Reservas</h1>
                <p className="history-subtitle">Aquí encontrarás el historial completo de tus viajes con Tierra Nativa.</p>
            </div>

            {bookings.length === 0 ? (
                <div className="history-empty">
                    <CalendarIcon size={48} color="#B85C38" />
                    <h3>Aún no tienes reservas</h3>
                    <p>Explora nuestros paquetes y planifica tu próxima aventura.</p>
                    <button className="history-btn-primary" onClick={() => navigate('/home')}>
                        Explorar paquetes
                    </button>
                </div>
            ) : (
                <>
                    <div className="history-controls">
                        <div className="history-filter-group">
                            <select
                                className="history-select mb-2 "
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="CONFIRMED">Confirmadas</option>
                                <option value="FINISHED">Finalizadas</option>
                                <option value="CANCELLED">Canceladas</option>
                            </select>
                        </div>
                        <button
                            className="history-sort-btn"
                            onClick={() => { setSortOrder(o => (o === 'asc' ? 'desc' : 'asc')); setCurrentPage(1); }}
                        >
                            <ArrowUpDown size={16} />
                            {sortOrder === 'asc' ? 'Más antiguas primero' : 'Más recientes primero'}
                        </button>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <p className="history-no-results">No hay reservas con el filtro seleccionado.</p>
                    ) : (
                        <div className="history-list">
                            {filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking) => {
                                const status = booking.status || booking.estado || 'CONFIRMED';
                                const packageId = booking.packageId || booking.paqueteId || booking.package?.id;
                                const packageName = booking.packageName || booking.paquete?.title || booking.package?.title || 'Paquete de viaje';
                                const location = booking.location || booking.package?.location || booking.paquete?.location || null;
                                const startDate = booking.startDate || booking.fechaInicio;
                                const endDate = booking.endDate || booking.fechaFin;
                                const createdAt = booking.creationDate || null;
                                const isReviewed = booking.reviewed === true || booking.hasReview === true;

                                return (
                                    <div key={booking.id} className="history-card">
                                        <div className="history-card-info">
                                            <div className="history-card-top">
                                                <h3 className="history-card-name">{packageName}</h3>
                                                <span className={`history-status-badge ${STATUS_CLASS[status] || 'booking-status-confirmed'}`}>
                                                    {STATUS_LABEL[status] || status}
                                                </span>
                                            </div>

                                            <div className="history-card-details">
                                                {location && (
                                                    <div className="history-detail">
                                                        <MapPin size={15} color="#1A531A" />
                                                        <span>{location}</span>
                                                    </div>
                                                )}
                                                {startDate && endDate && (
                                                    <div className="history-detail">
                                                        <CalendarIcon size={15} color="#1A531A" />
                                                        <span>{startDate} → {endDate}</span>
                                                    </div>
                                                )}
                                                {createdAt && (
                                                    <div className="history-detail history-created-at">
                                                        <CalendarIcon size={13} color="#aaa" />
                                                        <span>Reservado el {formatDate(createdAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="history-card-actions">
                                            {status === 'CONFIRMED' && (() => {
                                                const allowed = canCancelBooking(startDate);
                                                return (
                                                    <button
                                                        className={`history-btn-cancel${allowed ? '' : ' history-btn-cancel--disabled'}`}
                                                        onClick={() => allowed ? handleCancel(booking.id) : handleCancelBlocked(startDate)}
                                                        disabled={cancellingId === booking.id}
                                                        title={!allowed ? 'La cancelación no está disponible: faltan menos de 15 días para el inicio del viaje.' : 'Cancelar reserva'}
                                                    >
                                                        <XCircle size={15} />
                                                        {cancellingId === booking.id ? 'Cancelando...' : 'Cancelar'}
                                                    </button>
                                                );
                                            })()}

                                            {status === 'FINISHED' && packageId && (
                                                isReviewed ? (
                                                    <span className="history-badge-reviewed">
                                                        <CheckCircle size={15} />
                                                        Reserva calificada
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="history-btn-review"
                                                        onClick={() => navigate(`/detallePaquete/${packageId}?openReview=true`)}
                                                    >
                                                        <Star size={15} />
                                                        Calificar ahora
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {filteredBookings.length > ITEMS_PER_PAGE && (() => {
                        const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
                        return (
                            <div className="d-flex flex-column align-items-center mt-3">
                                <nav aria-label="Navegación de páginas">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => p - 1); }}>
                                                <ArrowLeft size={16} style={{ marginRight: '5px' }} /> Anterior
                                            </a>
                                        </li>
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNum = index + 1;
                                            return (
                                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}>
                                                        {pageNum}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => p + 1); }}>
                                                Siguiente <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        );
                    })()}
                </>
            )}
        </div>
    );
};
