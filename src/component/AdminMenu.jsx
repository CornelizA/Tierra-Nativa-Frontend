import React, { useEffect, useState } from 'react';
import '../style/AdminMenu.css';
import { Plane, Plus, Users, Tags, Settings2, ShieldAlert, Laptop, } from 'lucide-react';

export const AdminMenu = ({ onViewChange }) => {

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileDenied, setShowMobileDenied] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const userData = sessionStorage.getItem('user');

            if (!userData) {
                window.location.href = '/login';
                return;
            }
            try {
                const user = JSON.parse(userData);

                const hasAdminRole = user.role === 'ADMIN' ||
                    (user.authorities && user.authorities.includes('ADMIN')) ||
                    (Array.isArray(user.roles) && user.roles.includes('ADMIN'));

                if (hasAdminRole) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                    fireAlert(
                        'Acceso Denegado',
                        'No tienes permisos de administrador para ver esta sección.',
                        'error'
                    );
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 2000);
                }
            } catch (error) {
                fireAlert(
                    'Error de Sesión',
                    'Hubo un problema al validar tus credenciales. Por favor, inicia sesión de nuevo.',
                    'warning'
                );

                sessionStorage.clear();
                setTimeout(() => {
                    window.location.href = '/home';
                }, 2500);
            }
        };

        checkAuth();
    }, []);

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

    const UnauthorizedMessage = () => (
        <div className="message-error-user d-block items-center justify-center min-h-screen p-4 text-center bg-gray-50">
            <ShieldAlert size={80} className="text-red-600 mb-4" />
            <h1 className="text-2xl mb-20 font-bold text-gray-900">Acceso Denegado</h1><br />
            <p className="text-gray-600 mt-20 max-w-xs mx-auto">No tienes permisos de administrador para visualizar esta sección.</p>
        </div>
    );

    if (isAuthorized === null) {
        return <div className="flex items-center justify-center min-h-screen">Verificando credenciales...</div>;
    }

    if (isAuthorized === false) {
        return <UnauthorizedMessage />;
    }

    if (showMobileDenied) {
        return <MobileDeniedCard />;
    }

    return (
        <div className="admin-menu-container">
            <h2 className="admin-title">Menú de Administrador</h2>
            <h3 className="admin-subtitle"> Selecciona una opción para gestionar el contenido de Tierra Nativa</h3>
            <div className="admin-menu-grid">
                <MenuItem
                    icon={Plane}
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
                    icon={Users}
                    title="Gestionar Permisos de Usuarios"
                    description="Listar usuarios registrados y gestionar permisos."
                    onClick={() => handleNavigation('LIST_USERS')}
                />
                <MenuItem
                    icon={Tags}
                    title="Gestionar Categorías"
                    description="Registrar, editar y eliminar categorias."
                    onClick={() => handleNavigation('LIST_CATEGORY')}
                />
                <MenuItem
                    icon={Settings2}
                    title="Gestionar Características"
                    description="Registrar, editar y eliminar características."
                    onClick={() => handleNavigation('LIST_CHARACTERISTICS')}
                />
            </div>
        </div>
    );
};