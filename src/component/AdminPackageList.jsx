import React, { useEffect, useState } from 'react';
import { apiGetPackagesAdmin, apiDeletePackage, fireAlert} from '../service/PackageTravelService';
import { AdminPackageForm, initialFormData } from './AdminPackageForm';
import '../style/AdminPackageList.css';
import { Pencil, X, Plus, ArrowLeft, ArrowRight} from 'lucide-react';

const ITEMS_PER_PAGE = 4;

export const AdminPackageList = ({ onBackToMenu }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [packageToEdit, setPackageToEdit] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadPackages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetPackagesAdmin();
            setPackages(data);

        } catch (err) {
            const friendlyMessage = 'No se pudo cargar la lista de paquetes. Por favor, verifica tu conexión o el estado del servidor.';
            setError(friendlyMessage);
            fireAlert(
                'Error de Carga', 
                friendlyMessage, 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, []);

    const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
    const lastItemIndex = currentPage * ITEMS_PER_PAGE;
    const firstItemIndex = lastItemIndex - ITEMS_PER_PAGE;
    const currentPackages = packages.slice(firstItemIndex, lastItemIndex);

    const goToNextPage = () => {
        setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
    };

    const goToPrevPage = () => {
        setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
    };


    const handleDelete = async (packageId, packageName) => {
        
        const result = await fireAlert(
            'Confirmar Eliminación', 
            `¿Estás seguro de eliminar el paquete "${packageName}"? Esta acción es irreversible.`,
             'warning', 
             true);

        if (result.isConfirmed) {
            try {
                await apiDeletePackage(packageId);
                await loadPackages();
                Swal.fire({
                    title: '¡Eliminado!',
                    text: `El paquete "${packageName}" ha sido eliminado con éxito.`,
                    icon: 'success',
                    confirmButtonColor: '#1A531A'
                });

            } catch (err) {
             const errorMessage = err.response?.data?.message || 
             'Ocurrió un problema al intentar eliminar el paquete. Intente de nuevo.';
                
                Swal.fire({
                    title: 'Error al Eliminar',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#1A531A'
                });
            }
        }
    };

    const handleEdit = (pkg) => {
        setPackageToEdit(pkg);
    };

    const handleActionComplete = () => {
        setPackageToEdit(null);
        loadPackages();
    };

    if (loading) return <div>Cargando lista de paquetes...</div>;
    if (error) return <div className="error">{error}</div>;


    if (packageToEdit) {
        return (
            <AdminPackageForm
                packageToEdit={packageToEdit}
                onActionComplete={handleActionComplete}
            />
        );
    }

    return (
        <div className="admin-list-container">
            <div className="button-header-row">
                <button
                    type="button"
                    className="btn btn-secondary mb-3"
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
                    className="btn btn-primary"
                    onClick={() => setPackageToEdit(initialFormData)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} />
                    Nuevo Paquete
                </button>
            </div>
            <div className="admin-list-container">
                <h2 className='title-package-admin'>Administración de Paquetes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Destino</th>
                            <th>Precio Base</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPackages.map((pkg) => (
                            <tr key={pkg.id}>
                                <td>{pkg.id}</td>
                                <td>{pkg.name}</td>
                                <td>{pkg.destination}</td>
                                <td>{(pkg.price || pkg.basePrice || 0).toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn btn-warning me-2"
                                        onClick={() => handleEdit(pkg)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Pencil size={16} />
                                        Editar
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(pkg.id, pkg.name)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    >

                                        <X size={16} />
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {packages.length > ITEMS_PER_PAGE && (
                    <div className="d-flex flex-column align-items-center mt-3">

                        <nav aria-label="Navegación de páginas">
                            <ul className="pagination justify-content-center">

                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <a
                                        className="page-link"
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); goToPrevPage(); }}
                                    >
                                        <ArrowLeft size={16} style={{ marginRight: '5px' }} /> Anterior
                                    </a>
                                </li>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <li
                                            key={pageNum}
                                            className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                                        >
                                            <a
                                                className="page-link"
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                                            >
                                                {pageNum}
                                            </a>
                                        </li>
                                    );
                                })}

                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <a
                                        className="page-link"
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); goToNextPage(); }}
                                    >
                                        Siguiente <ArrowRight size={16} style={{ marginLeft: '5px' }} />
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}

            </div>
        </div>
    );
};