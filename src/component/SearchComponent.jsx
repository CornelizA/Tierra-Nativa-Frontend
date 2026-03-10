import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState, useMemo } from "react";
import '../style/SearchComponent.css';
import { MapPin, Calendar, ArrowRight, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRef } from "react";

export const SearchComponent = ({ onFilter }) => {

  const { packageTravel } = useContext(PackageTravelContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1));
  const today = useMemo(() => new Date(2026, 1, 1), []);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDatePicker(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pkgsArray = useMemo(() => {
    if (Array.isArray(packageTravel)) return packageTravel;
    if (packageTravel?.packages) return packageTravel.packages;
    return [];
  }, [packageTravel]);

  const getUniqueDestinations = (pkgs) => {
    const seen = new Set();
    const result = [];
    pkgs.forEach(pkg => {
      const dest = pkg.destination ? String(pkg.destination).trim() : '';
      if (dest && !seen.has(dest.toLowerCase())) {
        seen.add(dest.toLowerCase());
        result.push(dest);
      }
    });
    return result;
  };

  useEffect(() => {
    let filtered = pkgsArray;
    if (searchTerm.length > 0) {
      filtered = pkgsArray.filter(pkg => (pkg.destination || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setSuggestions(getUniqueDestinations(filtered));
  }, [searchTerm, pkgsArray]);

  const handleDateChange = (date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: null });
    } else {
      if (date < dateRange.start) {
        setDateRange({ start: date, end: null });
      } else {
        setDateRange({ ...dateRange, end: date });
        setTimeout(() => setShowDatePicker(false), 300);
      }
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onFilter) {
      onFilter({
        destination: searchTerm,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
    }
  };

  const formatDateRange = () => {
    if (!dateRange.start) return "Seleccionar fechas";
    const startStr = dateRange.start.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    if (!dateRange.end) return `${startStr} - ...`;
    const endStr = dateRange.end.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const isAtCurrentMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();

  const renderMonth = (monthDate) => {
    const { days, firstDay } = getDaysInMonth(monthDate);
    const monthName = monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (

      <div className="flex-1 pt-0 px-3 pb-2">
        <h4 className="text-center font-bold text-uppercase mt-0" style={{ color: '#1A531A', fontSize: '18px' }}>{monthName}</h4>
        <div className="row g-0 text-center mb-2 mt-3">
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
            <div key={day} className="col">
              <span className=" fw-bold text-muted" style={{ fontSize: '15px' }}>{day}</span>
            </div>
          ))}
        </div>

        <div className="row g-1 text-center text-muted" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {blanks.map(b => <div key={`b-${b}`} className="col" />)}
          {daysArray.map(d => {
            const dateObj = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
            const isSelected = (dateRange.start && dateObj.toDateString() === dateRange.start.toDateString()) ||
              (dateRange.end && dateObj.toDateString() === dateRange.end.toDateString());
            const isInRange = dateRange.start && dateRange.end && dateObj > dateRange.start && dateObj < dateRange.end;

            return (

              <div key={d} className="col">
                <button
                  type="button"
                  onClick={() => handleDateChange(dateObj)}
                  className={`btn btn-sm w-100 p-0 border-0 rounded-2 d-flex align-items-center justify-content-center
                    ${isSelected ? 'btn-success fw-bold shadow-sm' :
                      isInRange ? 'btn-success text-white fw-bold' : 'bg-transparent text-muted hover-bg-light'}
                  `}
                  style={{ height: '26px', fontSize: '15px' }}
                >
                  {d}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (

    <div className="w-100 max-w-4xl position-relative" ref={containerRef}>
      <div className="search-container">
        <form onSubmit={handleSearchSubmit}
          className="search-container-box  d-flex flex-column flex-md-row align-items-center gap-3 p-4 h-20 px-4 "
          style={{
            backgroundColor: ' #FAF8F020',
            color: '#FAF8F0',
            boxShadow: '0 2px 4px rgba(250, 248, 240, 0.7)',
            height: '60px',
            borderRadius: '15px'
          }}>

          <div className="flex-grow-1 position-relative">
            <div className="search-input-group d-flex align-items-center px-2 position-relative">
              <MapPin size={25} color='#FAF8F0' className="m-2" />
              <div className="d-flex flex-column flex-grow-1">
                <input
                  type="text"
                  placeholder="Selecciona tu destino"
                  value={searchTerm}
                  className="form-control border-0 p-0 fw-bold search-input-field shadow-none"
                  style={{ fontSize: '18px', color: '#FAF8F0', backgroundColor: 'transparent' }}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                />
              </div>
              {searchTerm && <X size={15} strokeWidth={5} className="cursor-pointer" color="#FAF8F0" onClick={() => { setSearchTerm(''); onFilter(null); }} />}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="dropdown-custom p-2 animate-in fade-in slide-in-from-top-2 rounded-3 position-absolute mt-2"
                style={{
                  zIndex: 100,
                  minWidth: '400px',
                  maxWidth: '500px',
                  maxHeight: '300px',
                  backgroundColor: '#fff',
                  transition: 'none',
                  overflowY: 'scroll',
                  transform: 'translateX(-6%)',
                  left: '0'
                }}>
                <div className="p-2 fw-bold text-uppercase tracking-widest medium border-bottom mb-2 text-center"
                  style={{ color: '#1A531A' }}>Destinos Sugeridos</div>

                {suggestions.map((dest, i) => (
                  <div key={i} className="p-3 rounded-3 hover:bg-green-50 cursor-pointer d-flex align-items-center gap-3 fw-bold transition-colors text-muted"
                    onClick={() => {
                      setSearchTerm(dest);
                      setShowSuggestions(false);
                    }}
                    style={{ color: '#6c757d', fontSize: '15px' }}
                  >
                    <ChevronRight size={18} strokeWidth='5' color="#1A531A" /> {dest}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="vr d-none d-md-block mx-2 my-2"></div>
          <div className="flex-grow-1 position-relative ">
            <button
              type="button"
              className="search-input-group h-20 d-flex align-items-center h-20 rounded-pill px-4 "
              style={{ color: '#FAF8F0', border: 'none', fontSize: '18px', backgroundColor: 'transparent' }}
              onClick={() => { setShowDatePicker(!showDatePicker); setShowSuggestions(false); }}
            >
              <Calendar size={22} className="me-3" color='#FAF8F0' />
              <div className="d-flex flex-column" >
                <span className="fw-bold text-white medium truncate" >{formatDateRange()}</span>
              </div>
            </button>

            {showDatePicker && (
              <div className="dropdown-custom p-2 animate-in fade-in slide-in-from-top-2 rounded-3 position-absolute mt-3 " style={{ width: '100%', minWidth: '600px', maxWidth: '800px', maxHeight: '400px', backgroundColor: '#fff', transition: 'none', left: '0', transform: 'translateX(-10%)' }}>
                <div className="d-flex justify-content-between border-bottom align-items-center mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-link border-0 shadow-none"
                    disabled={isAtCurrentMonth}
                    onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); }}
                    style={{ opacity: isAtCurrentMonth ? 0.2 : 1, cursor: isAtCurrentMonth ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={22} strokeWidth={4} color="#1A531A" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-link border-0 shadow-none "
                    onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); }}>
                    <ChevronRight size={22} strokeWidth={4} color="#1A531A" />
                  </button>
                </div>
                <div className="row g-4">
                  <div className="col-12 col-md-6 border-end border-white/10"> {renderMonth(currentMonth)} </div>
                  <div className="col-12 col-md-6 d-none d-md-block">{renderMonth(nextMonth)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="p-0">
            <button type="submit" className="btn btn-success px-4 d-flex gap-2" style={{ color: '#1A531A', backgroundColor: '#fff', border: 'none', borderRadius: '15px' }} >
              <span>Buscar</span>
              <Search size={20} strokeWidth={3} color="#1A531A" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};