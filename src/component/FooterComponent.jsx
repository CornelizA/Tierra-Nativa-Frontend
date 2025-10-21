import React from 'react';
import { NavLink } from 'react-router-dom';
import '../style/FooterComponent.css';

export const FooterComponent = () => {
    const getSocialIcon = (d) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 footer-icon">
            <path d={d} />
        </svg>
    );

    return (
        <footer className="footer-tn">
            <div className="footer-content">

                <div className="footer-section brand-info">
                    <img src="src/images/LOGO TIERRA NATIVA.png" alt="Logo Tierra Nativa" className='logo-foot' />
                    <h3 className="footer-title">Tierra Nativa</h3>
                </div>

                <div className="footer-section description">
                   <div className="footer-section description">
                        <h4 className="footer-subtitle">Explora la belleza natural con paquetes de viaje únicos y sostenibles</h4>
                        <p>Email: info@tierranativa.com</p>
                        <p>Teléfono: +54 9 11 5555-5555</p>
                    </div>

                <div className="footer-section social">
                    <h4 className="footer-link">Síguenos</h4>
                    <div className="social-links">
                        <a href="https://facebook.com" aria-label="Facebook">
                            {getSocialIcon("M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15h-2.5v-3H10V9.8c0-2.73 1.64-4.5 4.1-4.5 1.15 0 2.22.2 2.53.29V8h-1.6c-1.3 0-1.56.62-1.56 1.53V12h3L15 15h-2v6.8c4.56-.93 8-4.96 8-9.8z")}
                        </a>
                        <a href="https://instagram.com" aria-label="Instagram">
                            {getSocialIcon("M12 2c2.75 0 3.1.01 4.19.06 1.09.05 1.79.23 2.45.48.66.25 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.66.43 1.36.48 2.45.05 1.09.06 1.44.06 4.19s-.01 3.1-.06 4.19c-.05 1.09-.23 1.79-.48 2.45-.25.66-.6 1.21-1.15 1.76-.55.55-1.1 1.09-1.76 1.15-.66.25-1.36.43-2.45.48-1.09.05-1.44.06-4.19.06s-3.1-.01-4.19-.06c-1.09-.05-1.79-.23-2.45-.48-.66-.25-1.21-.6-1.76-1.15-.55-.55-1.09-1.1-1.15-1.76-.25-.66-.43-1.36-.48-2.45-.05-1.09-.06-1.44-.06-4.19s.01-3.1.06-4.19c.05-1.09.23-1.79.48-2.45.25-.66.6-1.21 1.15-1.76.55-.55 1.1-.9 1.76-1.15.66-.25 1.36-.43 2.45-.48C8.9.01 9.25 0 12 0zm0 4.38c-4.2 0-7.62 3.42-7.62 7.62s3.42 7.62 7.62 7.62 7.62-3.42 7.62-7.62-3.42-7.62-7.62-7.62zm0 2.21c3.08 0 5.41 2.33 5.41 5.41s-2.33 5.41-5.41 5.41-5.41-2.33-5.41-5.41 2.33-5.41 5.41-5.41zm6.27-.92c.55 0 .99.44.99.99s-.44.99-.99.99-.99-.44-.99-.99.44-.99.99-.99z")}
                        </a>

                    </div>
                </div>
                 </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Tierra Nativa. Todos los derechos reservados.
            </div>
        </footer>
    );
};