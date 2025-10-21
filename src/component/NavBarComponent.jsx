import { useContext } from 'react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import '../style/NavBarComponent.css';

export const NavBarComponent = ({ isScrolled, isDetailedPage }) => {

    const { packageTravel } = useContext(PackageTravelContext);
    const navigate = useNavigate();
    const location = useLocation();

    const navClasses = `navbar navbar-expand-lg tn-navbar navbar-fixed ${isDetailedPage || isScrolled ? 'navbar-solid' : 'navbar-transparent'
        }`;

    return (
        <nav className={navClasses}>
            <div className="container-fluid">
                <NavLink to='/' className="navbar-brand d-flex align-items-center">
                    <img
                        src={isDetailedPage || isScrolled ? "src/images/LOGO TIERRA NATIVA.png" : "src/images/LOGO TIERRA NATIVA BLANCO.png"}
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
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Mi cuenta
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#"><strong>Iniciar Sesión</strong></a></li>
                            <li><a className="dropdown-item" href="#"><strong>Crear Cuenta</strong></a></li>
                        </ul>
                    </div>
                </div>
            </div >
        </nav >
    )
}