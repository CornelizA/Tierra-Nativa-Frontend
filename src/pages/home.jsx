import { PackageTravelContext } from "../context/PackageTravelContext";
import { PackageTravelCard } from "../component/PackageTravelCard";
import '../style/home.css';
import { sampleArray } from "../helpers/arrayUtils";  
import { useContext, useMemo } from "react";
import { SearchComponent } from "../component/SearchComponent";

export const Home = () => {

    const { packageTravel } = useContext(PackageTravelContext);
    const loading = !packageTravel || packageTravel.length === 0;

    const randomEightPackages = useMemo(() => {
    
        if (!packageTravel || packageTravel.length === 0) {
            return [];
        }
        return sampleArray(packageTravel, 8);
    }, [packageTravel]);
  
    if (loading) {
        return <div className="text-center mt-5">Cargando paquetes de Tierra Nativa...</div>;
    }
    
    const packagesToDisplay = randomEightPackages;
    const countDisplay = packagesToDisplay.length;

    return (
        <>
     

          <div className="container mt-5">
            <h1>Paquetes de Viaje ({packageTravel.length} disponibles)</h1>

             <SearchComponent />
            <hr />
            
            <div className="row">
                {packagesToDisplay.map((packageTravel) => (
                    <div key={packageTravel.id} className="col-md-3 mb-4"> 
                    <PackageTravelCard
                      key={packageTravel.id}
                      id={packageTravel.id}
                      name={packageTravel.name}
                      shortDescription={packageTravel.shortDescription}
                      basePrice={packageTravel.basePrice}
                      destination={packageTravel.destination}
                      category={packageTravel.category}
                      imageUrl={packageTravel.imageUrl}

                    />
                    <a href="#" className="btn btn-primary">Ver Detalle</a>
                  </div>
            
            ))}
            </div>
          </div>
        </>
    );
};
