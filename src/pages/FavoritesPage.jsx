import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Bookmark, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGetMyFavorites, fireAlert } from '../service/PackageTravelService';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { PackageTravelCard } from '../component/PackageTravelCard';
import '../style/FavoritesPage.css';

export const FavoritesPage = () => {

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isUserLoggedIn = !!sessionStorage.getItem('jwtToken');
  const { setFavoriteIds } = useContext(PackageTravelContext) || {};

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate('/home', { replace: true });
    }
  }, [isUserLoggedIn, navigate]);

  const loadFavorites = useCallback(async () => {
    if (!isUserLoggedIn) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiGetMyFavorites();
      setFavorites(data || []);
      if (setFavoriteIds && Array.isArray(data)) {
        setFavoriteIds(new Set(data.map(pkg => pkg.id)));
      }
    } catch (error) {
      fireAlert('Operación Fallida', 'No se pudo actualizar el listado de favoritos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isUserLoggedIn, setFavoriteIds]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (

    <div className="total-cards min-h-screen bg-gray-50 font-sans">
      <div className="container-favorites border-b sticky top-0 z-30 px-6 py-6">
        <div className="favorites-bg max-w-7xl mx-auto flex items-center gap-4">

          <Link
            to="/home"
            className="btn btn-back-to-list"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>

          <div>
            <h1 className="title-favorites text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
              <Bookmark size={35} className="text-red-500;" fill="currentColor" /> Mis Favoritos
            </h1>
            <p className="sub-title-favorites text-gray-400 text-[10px] font-black uppercase tracking-widest">Tus experiencias guardadas para el futuro</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="loading-favorites font-black uppercase text-xs tracking-widest">Cargando tus deseos...</p>
          </div>

        ) : favorites.length === 0 ? (
          <div className="container-empty-favorites rounded-[3rem] border-2 border-dashed border-gray-200 mx-auto">
            <Heart className="heart-favorites mx-auto text-gray-200 mb-6" size={80} />
            <h2 className="empty-favorites text-2xl font-black uppercase">Tu lista está vacía</h2>
          </div>
        ) : (

          <div className="package-card row g-4">
            {favorites.map((pkg) => {

              return (
                <div key={pkg.id} className="col-12 col-sm-6 col-md-4">
                  <PackageTravelCard
                    key={pkg.id}
                    pkg={pkg}
                    isUserLoggedIn={isUserLoggedIn}
                    onRefresh={loadFavorites}
                  />

                  <Link
                    to={`/detallePaquete/${pkg.id}`}
                    className="btn btn-primary">
                    Ver Detalle
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};