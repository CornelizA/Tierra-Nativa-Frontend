import React, { useEffect, useState } from 'react';
import { apiGetPackages, apiDeletePackage } from '../service/PackageTravelService';
import { AdminPackageForm, initialFormData } from './AdminPackageForm';


export const AdminPackageList = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [packageToEdit, setPackageToEdit] = useState(null);


    const loadPackages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetPackages('/paquetes/admin');
            setPackages(data);
        } catch (err) {
            setError('Error al cargar la lista de paquetes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, []);


    const handleDelete = async (packageId, packageName) => {
        const isConfirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar el paquete "${packageName}"? Esta acción es irreversible.`
        );
        if (isConfirmed) {
            try {
                await apiDeletePackage(`/paquetes/${packageId}`);
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
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(pkg.id, pkg.name)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn btn-primary mt-3" onClick={() => setPackageToEdit(initialFormData)}>
                + Registrar Nuevo Paquete
            </button>

        </div>
    );
};