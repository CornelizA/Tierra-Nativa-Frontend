import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetAllBookingsAdmin, apiToggleContactedStatus, apiGetAvailableCapacity } from '../service/PackageTravelService';
import { ArrowLeft, ArrowRight, Users, Phone, Calendar, CheckSquare, RefreshCw, MessageSquare, BarChart2 } from 'lucide-react';
import '../style/AdminBookingList.css';

const STATUS_LABEL = {
    CONFIRMED: 'Confirmada',
    PENDING: 'Pendiente',
    FINISHED: 'Finalizada',
    CANCELLED: 'Cancelada',
};

const STATUS_CLASS = {
    CONFIRMED: 'abl-badge abl-badge--confirmed',
    PENDING: 'abl-badge abl-badge--pending',
    FINISHED: 'abl-badge abl-badge--finished',
    CANCELLED: 'abl-badge abl-badge--cancelled',
};

const formatShortDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    } catch { return dateStr; }
};

const formatCompactPrice = (amount) => {
    if (amount == null) return '—';
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace('.0', '')}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1).replace('.0', '')}K`;
    return `$${amount}`;
};

export const AdminBookingList = ({ onBackToMenu }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [packageFilter, setPackageFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [spotsMap, setSpotsMap] = useState({});
    const [loadingSpots, setLoadingSpots] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGetAllBookingsAdmin();
            const list = Array.isArray(data) ? data : [];
            setBookings(list);
            fetchAvailableSpots(list);
        } catch {
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []); 

    const fetchAvailableSpots = async (list) => {
        if (!list.length) return;
        setLoadingSpots(true);
        const entries = await Promise.all(
            list.map(async (b) => {
                if (!b.packageId || !b.startDate || !b.endDate || b.status === 'CANCELLED') {
                    return [b.id, null];
                }
                try {
                    const res = await apiGetAvailableCapacity(b.packageId, b.startDate, b.endDate);
                    return [b.id, res?.availableSpots ?? null];
                } catch {
                    return [b.id, null];
                }
            })
        );
        setSpotsMap(Object.fromEntries(entries));
        setLoadingSpots(false);
    };

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleContactedToggle = async (booking) => {
        const currentValue = booking.isContacted ?? booking.contacted ?? false;
        const newValue = !currentValue;
        setUpdatingId(booking.id);
        try {
            const updated = await apiToggleContactedStatus(booking.id, newValue);
            setBookings(prev =>
                prev.map(b => b.id === booking.id ? { ...b, isContacted: updated.isContacted ?? updated.contacted ?? newValue, contacted: updated.isContacted ?? updated.contacted ?? newValue } : b)
            );
            showToast(newValue ? 'Reserva marcada como coordinada.' : 'Reserva marcada como pendiente.');
        } catch {
        } finally {
            setUpdatingId(null);
        }
    };

    const packageOptions = Array.from(
        new Map(
            bookings
                .filter(b => b.packageId && b.packageName)
                .map(b => [b.packageId, b.packageName])
        ).entries()
    ).sort((a, b) => a[1].localeCompare(b[1]));

    const ITEMS_PER_PAGE = 8;

    const getFiltered = () => {
        let list = bookings;
        if (filter === 'PENDING_CONTACT') list = list.filter(b => !(b.isContacted ?? b.contacted ?? false) && b.status !== 'CANCELLED');
        else if (filter === 'CANCELLED') list = list.filter(b => b.status === 'CANCELLED');
        if (packageFilter !== 'ALL') list = list.filter(b => String(b.packageId) === packageFilter);
        return list;
    };

    if (loading) {
        return (
            <div className="abl-loading">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    const filtered = getFiltered();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterChange = (newFilter) => { setFilter(newFilter); setCurrentPage(1); };
    const handlePackageChange = (e) => { setPackageFilter(e.target.value); setCurrentPage(1); };

    return (
        <div className="container-admin-category">
            {toast && <div className="abl-toast">{toast}</div>}

            <div className="button-header-row">
                <button
                    type="button"
                    className="btn btn-back-to-list mb-3"
                    onClick={onBackToMenu}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <ArrowLeft size={18} />
                    Volver al Menú
                </button>

                <button
                    className="btn abl-btn-refresh"
                    onClick={fetchBookings}
                    disabled={loading || loadingSpots}
                    title="Actualizar lista y cupos"
                >
                    <RefreshCw size={16} className={loadingSpots ? 'abl-spin' : ''} />
                    {loadingSpots ? ' Actualizando cupos...' : ' Actualizar'}
                </button>
            </div>

            <h1 className="text-3xl">Gestión de Reservas</h1>

            <div className="button-flex abl-filters-row">
                <div className="abl-filters">
                    <button
                        className={`abl-filter-btn${filter === 'ALL' ? ' abl-filter-btn--active' : ''}`}
                        onClick={() => handleFilterChange('ALL')}
                    >
                        Todas ({bookings.length})
                    </button>
                    <button
                        className={`abl-filter-btn${filter === 'PENDING_CONTACT' ? ' abl-filter-btn--active' : ''}`}
                        onClick={() => handleFilterChange('PENDING_CONTACT')}
                    >
                        <Phone size={14} /> Pendientes ({bookings.filter(b => !(b.isContacted ?? b.contacted ?? false) && b.status !== 'CANCELLED').length})
                    </button>
                    <button
                        className={`abl-filter-btn abl-filter-btn--cancelled${filter === 'CANCELLED' ? ' abl-filter-btn--active' : ''}`}
                        onClick={() => handleFilterChange('CANCELLED')}
                    >
                        Canceladas ({bookings.filter(b => b.status === 'CANCELLED').length})
                    </button>
                </div>

                <select
                    className="abl-package-select"
                    value={packageFilter}
                    onChange={handlePackageChange}
                    title="Filtrar por paquete"
                >
                    <option value="ALL">Todos los paquetes</option>
                    {packageOptions.map(([id, name]) => (
                        <option key={id} value={String(id)}>{name}</option>
                    ))}
                </select>
            </div>

            {filtered.length === 0 ? (
                <p className="abl-empty">No hay reservas con el filtro seleccionado.</p>
            ) : (
                <div className="admin-category">
                    <div className="abl-table-scroll">
                        <table style={{ tableLayout: 'fixed', width: '100%' }}>
                            <colgroup>
                                <col style={{ width: '18%' }} />
                                <col style={{ width: '18%' }} />
                                <col style={{ width: '11%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '10%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className="abl-th-center" title="Cliente"><Users size={20} /></th>
                                    <th className="abl-th-center">Paquete</th>
                                    <th className="abl-th-center" title="Fechas de viaje"><Calendar size={20} /></th>
                                    <th className="abl-th-center" title="Viajeros / Cupos restantes"><BarChart2 size={20} /></th>
                                    <th className="abl-th-right">Total</th>
                                    <th className="abl-th-center" title="Petición especial"><MessageSquare size={20} /></th>
                                    <th className="abl-th-center">Estado</th>
                                    <th className="abl-th-center" title="Coordinado">Coordinado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(booking => {
                                    const isCancelled = booking.status === 'CANCELLED';
                                    const fullName = [booking.userName, booking.userLastName].filter(Boolean).join(' ') || '—';
                                    const destination = booking.destination || booking.packageDestination || null;
                                    const spots = spotsMap[booking.id];
                                    const travelers = booking.travelerCount ?? 1;

                                    return (
                                        <tr key={booking.id} className={isCancelled ? 'abl-row--cancelled' : ''}>
                                            <td>
                                                <span className="abl-cell-primary">{fullName}</span>
                                                <span className="abl-cell-secondary">{booking.userEmail || '—'}</span>
                                                {booking.userPhone && <span className="abl-cell-secondary">{booking.userPhone}</span>}
                                            </td>

                                            <td>
                                                <span className="abl-tooltip-wrap">
                                                    <span className="abl-cell-primary abl-truncate">{booking.packageName || '—'}</span>
                                                    {booking.packageName && <span className="abl-tooltip-text abl-tooltip-dark">{booking.packageName}</span>}
                                                </span>
                                                {destination && <span className="abl-cell-secondary">{destination}</span>}
                                            </td>

                                            <td>
                                                <span className="abl-cell-primary">{formatShortDate(booking.startDate)}</span>
                                                <span className="abl-cell-secondary">{formatShortDate(booking.endDate)}</span>
                                            </td>

                                            <td className="abl-td-center">
                                                {isCancelled ? <span className="abl-cell-secondary">—</span> : (
                                                    <>
                                                        <span className="abl-occupancy-label">RESERVADO</span>
                                                        <span className="abl-cell-primary">{travelers}</span>
                                                        <span className={`abl-occupancy-label ${spots === 0 ? 'abl-occupancy--full' : spots !== null && spots <= 3 ? 'abl-occupancy--low' : ''}`} style={{ marginTop: 4 }}>DISPONIBLE</span>
                                                        <span className={`abl-cell-primary ${spots === 0 ? 'abl-occupancy--full' : spots !== null && spots <= 3 ? 'abl-occupancy--low' : ''}`}>
                                                            {loadingSpots ? '…' : spots ?? '—'}
                                                        </span>
                                                    </>
                                                )}
                                            </td>
                                            <td className="abl-td-right">{formatCompactPrice(booking.totalPrice)}</td>

                                            <td className="abl-td-center abl-td-overflow">
                                                {booking.specialRequests ? (
                                                    <span className="abl-tooltip-wrap">
                                                        <MessageSquare size={15} className="abl-icon-request--has" />
                                                        <span className="abl-tooltip-text abl-tooltip-request">{booking.specialRequests}</span>
                                                    </span>
                                                ) : (
                                                    <MessageSquare size={18} strokeWidth={3} className="abl-icon-request--empty" />
                                                )}
                                            </td>
                                            <td className="abl-td-center">
                                                <span className={STATUS_CLASS[booking.status] || 'abl-badge'}>
                                                    {STATUS_LABEL[booking.status] || booking.status}
                                                </span>
                                            </td>
                                            <td className="abl-td-center">
                                                <input
                                                    type="checkbox"
                                                    className="abl-checkbox"
                                                    checked={booking.status === 'FINISHED' || !!(booking.isContacted ?? booking.contacted ?? false)}
                                                    disabled={updatingId === booking.id || isCancelled || booking.status === 'FINISHED'}
                                                    onChange={() => handleContactedToggle(booking)}
                                                    title={
                                                        booking.status === 'FINISHED' ? 'Reserva finalizada — coordinación completada' :
                                                            isCancelled ? 'No aplica para reservas canceladas' : ''
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
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
                    )}
                </div>
            )}
        </div>
    );
};
