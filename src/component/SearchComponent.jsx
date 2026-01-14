import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState } from "react";
import '../style/SearchComponent.css';
import { Search } from "lucide-react";

function getUniqueDestinations(packagesParam) {
  const pkgs = Array.isArray(packagesParam)
    ? packagesParam
    : (packagesParam && Array.isArray(packagesParam.packages) ? packagesParam.packages : []);

  const seen = new Set();
  const result = [];

  pkgs.forEach((pkg, idx) => {
    const dest = (pkg && pkg.destination) ? String(pkg.destination).trim() : '';
    const key = dest.toLowerCase();
    if (dest && !seen.has(key)) {
      seen.add(key);
      result.push({ id: pkg && pkg.id ? pkg.id : `dest-${key}-${idx}`, destination: dest });
    }
  });

  return result;
}

export const SearchComponent = ({ onFilter }) => {

  const { packageTravel } = useContext(PackageTravelContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {

    const pkgs = Array.isArray(packageTravel)
      ? packageTravel
      : (packageTravel && Array.isArray(packageTravel.packages) ? packageTravel.packages : []);

    let filtered = pkgs;
    if (searchTerm.length > 0) {
      filtered = pkgs.filter(pkg => (pkg.destination || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setSuggestions(getUniqueDestinations(filtered));
  }, [searchTerm, packageTravel]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    if (onFilter && value.trim() === "") {
      onFilter(null);
    }
  };

  const handleSuggestionClick = (destination) => {
    if (onFilter) onFilter(destination);
    setSearchTerm(destination);
    setShowSuggestions(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleInputFocus = () => {
    setSuggestions(getUniqueDestinations(packageTravel));
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (suggestions.length > 0 && searchTerm.length > 0) {
      handleSuggestionClick(suggestions[0].destination);
    } else {
      setErrorMessage('No se encontraron paquetes que coincidan con tu búsqueda.');
    }
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container">
      <form className="d-flex" role="search" onSubmit={handleSearchSubmit}>
        <div className="input-group">
          <div className="input-group-prepend">
            <Search
              size={18}
              color="#FAF8F0"
              className="search-icon"
            />
          </div>

          <input
            className="form-control me-2"
            type="search"
            placeholder="Selecciona tu destino"
            aria-label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map(item => (
            <li key={item.id} onClick={() => handleSuggestionClick(item.destination)}>
              <span>{item.destination}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
