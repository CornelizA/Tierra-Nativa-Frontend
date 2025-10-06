import { PackageTravelContext } from "../context/PackageTravelContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrency } from '../helpers/FormatCurrency';
// import { CartContext } from "../context/CartContext"; 

export const PackageDetailed = () => {

  const { id: packageTravelId  } = useParams(); 
  const { packageTravel: allPackages} = useContext(PackageTravelContext); 
//   const { addProduct, removeProduct, shoppingList } = useContext(CartContext);
  const navigate = useNavigate();

  const [packageTravel, setPackageTravel] = useState(null); 

  useEffect(() => {
    if (allPackages.length > 0 && packageTravelId) {
      const foundPackages =  allPackages.find(pkg => pkg.id === parseInt(packageTravelId)); 
      setPackageTravel(foundPackages);
    }
  }, [packageTravelId, allPackages]);

  if (!packageTravel) {
    return <div className="container mt-4"><h2>Cargando detalles del paquete...</h2></div>;
  }

  const isAdded = false;
// shoppingList.some(item => item.id === product.id);

//   const handleAddRemove = () => {
//     if (isAdded) {
//       removeProduct(packageTravel.id);
//     } else {
//       addProduct(packageTravel);
//     }
//   };

  return (
    <>
  <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>Volver</button> 
      <div className="row">
        <div className="col-md-6">
          <img src={packageTravel.imageUrl} alt={packageTravel.name} className="img-fluid" style={{ maxWidth: '400px' }} />
        </div>
        <div className="col-md-6">
          <h2>{packageTravel.name}</h2>
          <p className="text-muted">{packageTravel.category}</p>
          <p>{packageTravel.detailedDescription}</p>
          <h3>{formatCurrency(packageTravel.basePrice)}</h3>
          <button
            className={`btn ${isAdded ? 'btn-danger' : 'btn-primary'}`}
            // onClick={handleAddRemove}
          >
            {isAdded ? 'Quitar del Carrito' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>
    </div>
    </>
  )
};
