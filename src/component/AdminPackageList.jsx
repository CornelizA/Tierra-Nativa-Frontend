import React, { useEffect, useState } from 'react';
import { apiGetPackages, apiDeletePackage } from '../service/PackageTravelService';
import { AdminPackageForm, initialFormData } from './AdminPackageForm';
import '../style/AdminPackageList.css';
import { Pencil, X, Plus, Laptop } from 'lucide-react';


export const AdminPackageList = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [packageToEdit, setPackageToEdit] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadPackages = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!isMobile) {
                const data = await apiGetPackages('/paquetes/admin');
                setPackages(data);
            }
        } catch (err) {
            setError('Error al cargar la lista de paquetes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            loadPackages();
        }
    }, [isMobile]);

    useEffect(() => {
        loadPackages();
    }, []);


    const handleDelete = async (packageId, packageName) => {
        const isConfirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar el paquete "${packageName}"? Esta acción es irreversible.`
        );
        if (isConfirmed) {
            try {
                await apiDeletePackage(packageId);
                loadPackages();
                alert(`Paquete "${packageName}" eliminado con éxito.`);
            } catch (err) {
                alert('Error al eliminar el paquete. Intente de nuevo.');
                console.error(err);
            }
        } else {
            console.log('Eliminación cancelada.');
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

    if (isMobile) {
        return (
            <div className="mobile-access-denied-container">
                <div className="mobile-access-card">
                    <Laptop size={64} style={{ color: '#1A531A', marginBottom: '15px' }} />
                    <h2>Acceso Restringido</h2>
                    <p>
                        La sección de <strong>Administración de Paquetes</strong> requiere una interfaz de escritorio para su correcta gestión y visualización de tablas.
                    </p>
                    <p>
                        Por favor, acceda desde una <strong>computadora o laptop</strong> para continuar.
                    </p>
                </div>
            </div>
        );
    }

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
            <h2>Panel de Administración de Paquetes</h2>
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
                    {packages.map((pkg) => (
                        <tr key={pkg.id}>
                            <td>{pkg.id}</td>
                            <td>{pkg.name}</td>
                            <td>{pkg.destination}</td>
                            <td>{pkg.basePrice.toFixed(2)}</td>
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
            <button
                className="btn btn-primary mt-3"
                onClick={() => setPackageToEdit(initialFormData)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
                <Plus size={18} />
                Registrar Nuevo Paquete
            </button>

        </div>
    );
};