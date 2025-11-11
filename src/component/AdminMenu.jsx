import React, { useEffect, useState } from 'react';
import { List, Plus, Settings, Laptop } from 'lucide-react';
import '../style/AdminMenu.css';

export const AdminMenu = ({ onViewChange }) => {

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileDenied, setShowMobileDenied] = useState(false);

    useEffect(() => {
        if (isMobile) {
            setShowMobileDenied(true);
        }
    }, [isMobile]);

    useEffect(() => {
        const handleResize = () => {
            const currentIsMobile = window.innerWidth < 768;
            setIsMobile(currentIsMobile);

            if (!currentIsMobile) {
                setShowMobileDenied(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigation = (view) => {
        if (isMobile) {
            setShowMobileDenied(true);
            return;
        }

        onViewChange(view);
    };

    const MenuItem = ({ icon: Icon, title, description, onClick, isWIP = false }) => (
        <button
            className={`admin-menu-item ${isWIP ? 'wip' : ''}`}
            onClick={isWIP ? () => alert(`${title} en desarrollo.`) : onClick}
        >
            <div className="icon-wrapper">
                <Icon size={32} />
            </div>
            <div className="text-content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </button>
    );

    const MobileDeniedCard = () => (
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
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => setShowMobileDenied(false)}
                    style={{ backgroundColor: '#1A531A' }}
                >
                    Aceptar
                </button>
            </div>
        </div>
    );

    if (showMobileDenied) {
        return <MobileDeniedCard />;
    }

    return (
        <div className="admin-menu-container">
            <h2>Menú de Administrador</h2>
            <h3 className="admin-subtitle"> Selecciona una opción para gestionar el contenido de Tierra Nativa</h3>
            <div className="admin-menu-grid">
                <MenuItem
                    icon={List}
                    title="Gestionar Paquetes"
                    description="Editar, eliminar y ver el listado completo de viajes."
                    onClick={() => handleNavigation('LIST')}
                />
                <MenuItem
                    icon={Plus}
                    title="Crear Nuevo Paquete"
                    description="Registrar un nuevo paquete de viaje al catálogo."
                    onClick={() => handleNavigation('CREATE_FORM')}
                />

                <MenuItem
                    icon={Settings}
                    title="Configuración General"
                    description="Gestionar usuarios, y ajustes del sitio."
                    isWIP={true}
                />
            </div>
        </div>
    );
};