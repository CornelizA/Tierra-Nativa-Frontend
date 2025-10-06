import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../style/SearchComponent.css';

export const SearchComponent = () => {

  const { packageTravel } = useContext(PackageTravelContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  useEffect(() => {
        if (searchTerm.length === 0) {
      setSuggestions(packageTravel);
      if (showSuggestions) {
          setShowSuggestions(packageTravel.length > 0);
      }
      return; 
    }
    const filteredPackage = packageTravel.filter(pkg => 
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filteredPackage);
    setShowSuggestions(filteredPackage.length > 0);
    
  }, [searchTerm, packageTravel, showSuggestions]); 

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowSuggestions(true); 
  };

  const handleSuggestionClick = (packageTravelId) => {
    navigate(`/detallePaquete/${packageTravelId}`); 
    setSearchTerm(''); 
    setSuggestions([]); 
    setShowSuggestions(false); 
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleInputFocus = () => {
    if (searchTerm.length === 0) {
        setSuggestions(packageTravel);
    }
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault(); 
    if (suggestions.length > 0 && searchTerm.length > 0) {
      handleSuggestionClick(suggestions[0].id);
    } else {
        alert('No se encontraron paquetes que coincidan con tu búsqueda.');
    }
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

return(
<div className="search-container">
            <form className="d-flex" role="search" onSubmit={handleSearchSubmit}>
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
              <button className="btn btn-outline-success" type="submit">Buscar</button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map(pkg => (
                   <li key={pkg.id} onClick={() => handleSuggestionClick(pkg.id)}>
                    <span>{pkg.destination}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )
}
