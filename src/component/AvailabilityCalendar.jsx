import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../style/AvailabilityCalendar.css';

export const AvailabilityCalendar = ({ availabilityBlocks = [] }) => {
    const today = useMemo(() => new Date(), []);
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay, year, month };
    };

    const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const todayStr = formatDateLocal(today);

    const isAtCurrentMonth = useMemo(() => {
        return currentMonth.getFullYear() === today.getFullYear() &&
            currentMonth.getMonth() === today.getMonth();
    }, [currentMonth, today]);

    const bookedDates = useMemo(() => {
        const booked = new Set();
        if (Array.isArray(availabilityBlocks)) {
            availabilityBlocks.forEach(block => {
                if (!block.startDate || !block.endDate) return;
                if (block.available === false || block.status === 'booked' || !block.available) {
                    try {
                        const start = new Date(block.startDate + "T00:00:00");
                        const end = new Date(block.endDate + "T00:00:00");
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            booked.add(formatDateLocal(d));
                        }
                    } catch (e) {
                    }
                }
            });
        }
        return booked;
    }, [availabilityBlocks]);

    const renderMonth = (dateObj, showPrev = false, showNext = false) => {
        const { firstDay, days, year, month } = getDaysInMonth(dateObj);
        const monthName = dateObj.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const daysArray = Array.from({ length: days }, (_, i) => i + 1);
        const blanks = Array.from({ length: firstDay }, (_, i) => i);

        return (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden flex-fill">

                <div className="d-flex align-items-center justify-content-between p-1 bg-white border-bottom gap-3">
                    {showPrev ? (
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="btn btn-link p-3 border-0"
                            disabled={isAtCurrentMonth}
                            style={{ opacity: isAtCurrentMonth ? 0.3 : 1, cursor: isAtCurrentMonth ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={30} color='#1A531A' />
                        </button>
                    ) : (
                        <div style={{ width: '50px' }}></div>
                    )}

                    <div className="card-header bg-white border-0 pt-3 pb-2 text-center">
                        <h5 className="fw-bold text-uppercase medium tracking-widest m-0" style={{ color: "#1A531A" }}>
                            {monthName}
                        </h5>
                    </div>

                    {showNext ? (
                        <button
                            type="button"
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="btn btn-link p-3 border-0"
                        >
                            <ChevronRight size={30} color='#1A531A' />
                        </button>
                    ) : (
                        <div style={{ width: '50px' }}></div>
                    )}
                </div>


                <div className="card-body p-4">
                    <div className="row g-0 mb-2 text-center text-muted fw-bold" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', fontSize: '15px' }}>
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>

                    <div className="g-1 text-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {blanks.map(b => <div key={`b-${b}`} style={{ height: '40px' }} />)}
                        {daysArray.map(d => {
                            const date = new Date(year, month, d);
                            const dateStr = formatDateLocal(date);
                            const isBooked = bookedDates.has(dateStr);
                            const isPast = dateStr < todayStr;

                            return (
                                <div key={d} className="p-1">
                                    <div
                                        className={`d-flex flex-column align-items-center justify-content-center rounded-3 position-relative transition-all
                      ${isPast ? 'bg-light text-muted opacity-30' :
                                                isBooked ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10' :
                                                    'bg-success bg-opacity-10 text-success cursor-pointer hover:bg-success hover:text-white shadow-sm border border-success border-opacity-10'}`}
                                        style={{ height: '40px', fontSize: '13px', fontWeight: '800' }}
                                        title={isPast ? "Fecha pasada" : isBooked ? "No disponible (Reservado)" : "Disponible"}
                                    >
                                        <span>{d}</span>
                                        {!isPast && isBooked && <span className="position-absolute bottom-0 mb-1" style={{ fontSize: '8px' }}>●</span>}
                                        {!isPast && !isBooked && <span className="position-absolute bottom-0 mb-1" style={{ fontSize: '8px' }}>●</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bootstrap-calendar-container py-2">
            <div className="d-flex flex-column flex-md-row justify-content-around align-items-center mb-4 gap-2">
                <div className="available d-flex gap-4">
                    <div className="d-flex align-items-center gap-2 bold fw-bold uppercase tracking-tighter">
                        <div className="rounded-circle bg-success" style={{ width: '20px', height: '20px' }}></div> Disponible
                    </div>
                    <div className="d-flex align-items-center gap-2 bold fw-bold  uppercase tracking-tighter">
                        <div className="rounded-circle bg-danger" style={{ width: '20px', height: '20px' }}></div> Reservado
                    </div>
                </div>
            </div>

            <div className="row g-4 flex-nowrap overflow-auto pb-3" style={{ minWidth: '320px' }}>
                <div className="col-12 col-lg-6 d-flex">
                    {renderMonth(currentMonth, true, false)}
                </div>
                <div className="col-12 col-lg-6 d-flex">
                    {renderMonth(nextMonthDate, false, true)}
                </div>
            </div>

        </div>
    );
};
