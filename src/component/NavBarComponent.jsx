import { useContext } from 'react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../style/NavBarComponent.css';

export const NavBarComponent = ({ isScrolled, shouldBeSolid, user, onLogout }) => {

    const { packageTravel } = useContext(PackageTravelContext);
    const navClasses = `navbar navbar-expand-lg tn-navbar navbar-fixed ${shouldBeSolid || isScrolled ? 'navbar-solid' : 'navbar-transparent'}`;
    const navigate = useNavigate();
    const userRole = sessionStorage.getItem('userRole');

    const getInitials = (firstName, lastName) => {
        if (!firstName || !lastName) return '';
        return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    };

    const UserAvatar = () => {
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const role = user?.role || 'USER';

        const initials = getInitials(firstName, lastName);
        const displayName = firstName;
        const avatarColor = role === 'ADMIN' ? 'btn-warning text-gray-900' : 'btn-success text-gray-900';

        return (
            <div className="dropdown user-avatar-dropdown">
                <button
                    className={`btn ${avatarColor} dropdown-toggle d-flex align-items-center`}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ padding: '5px 12px', borderRadius: '50px', fontWeight: 600 }}
                >
                    <span 
                    className={`initials d-flex items-center justify-center me-2 font-bold`} 
                    >
                        {initials} 
                    </span>
                    <span className="fw-bold d-none d-md-inline me-1">{displayName}</span> 
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                    <li className="dropdown-item-text small px-3">
                        <span className={`badge ${role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-success '}`}>{role}</span>
                        <br />
                        {firstName} {lastName}
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {role === 'ADMIN' && (
                        <li>
                            <NavLink to="/paquetes/admin" className="dropdown-item">
                                Panel Admin
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <button onClick={onLogout} className="dropdown-item text">
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </div>
        );
    };

    const AuthButtons = () => {
        if (user) {
            return <UserAvatar />;
        } else {
            return (
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle bg-green-600 hover:bg-green-700 text-white transition rounded-lg px-3 py-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Mi cuenta
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <Link className="dropdown-item" to="/login">
                                <strong>Iniciar Sesión</strong>
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="/register">
                                <strong>Crear Cuenta</strong>
                            </Link>
                        </li>
                    </ul>
                </div>
            );
        }
    };
    return (
        <nav className={navClasses}>
            <div className="container-fluid">
                <NavLink to='/home' className="navbar-brand d-flex align-items-center">
                    <img
                        src={shouldBeSolid || isScrolled ?
                            "/images/LOGO TIERRA NATIVA.png"
                            : "/images/LOGO TIERRA NATIVA BLANCO.png"}
                        alt="Logo de Tierra Nativa"
                        className='logo'
                    />
                    <p className='d-inline ms-2 fw-bold'>Tierra Nativa</p>
                </NavLink>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">

                        <li className="nav-item">
                            <a className="nav-link" href="#">Aventura</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Ecoturismo</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Relajación</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Geopaisajes</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Litoral</a>
                        </li>
                    </ul>
                    <div className="ms-3">
                        <AuthButtons />
                    </div>
                </div>
            </div >
        </nav >
    )
};