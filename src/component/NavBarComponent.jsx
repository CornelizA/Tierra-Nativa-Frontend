import { useContext } from 'react';
import { PackageTravelContext } from '../context/PackageTravelContext';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import '../style/NavBarComponent.css';

export const NavBarComponent = () => {

    const { packageTravel } = useContext(PackageTravelContext);
    const navigate = useNavigate();

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top border-bottom tn-navbar">
            <div className="container-fluid">
                <NavLink to='/' className="navbar-brand d-flex align-items-center">
                    <img src="src/images/LOGO TIERRA NATIVA.png" alt="Logo de Tierra Nativa" className='logo' />
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
                        <div className="btn-group">
                            <a href="#" className="btn btn-primary">Iniciar Sesión</a>
                            <a href="#" className="btn btn-primary">Crear Cuenta</a>
                        </div>
                    </ul>
                </div>
            </div >
        </nav >
    )
}