import React from 'react';
import '../style/FooterComponent.css';

export const FooterComponent = () => {
    const getSocialIcon = (d) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 footer-icon">
            <path d={d} />
        </svg>
    );

    return (
        <footer className="footer-tn">
            <div className="footer-content-wrapper">
                <div className="footer-main-layout">
                    <div className="footer-section brand-info">
                        <div className="logo-title-group">
                            <img src="/images/LOGO TIERRA NATIVA.png" alt="Logo Tierra Nativa" className='logo-foot' />
                            <h3 className="footer-title">Tierra Nativa</h3>
                        </div>

                        <div className="footer-copyright-info">
                            &copy; {new Date().getFullYear()} Tierra Nativa. Todos los derechos reservados.
                        </div>
                    </div>
                    <div className="footer-section contact-info">
                        <h4 className="footer-subtitle">Contacto</h4>
                        <p>Email: info@tierranativa.com</p>
                        <p>Teléfono: +54 9 11 5555-5555</p>
                    </div>
                    <div className="footer-section social">
                        <h4 className="footer-subtitle">Síguenos</h4>
                        <div className="social-links">
                            <a href="https://facebook.com" aria-label="Facebook">
                                {getSocialIcon("M12 2C6.47 2 2 6.47 2 12c0 5.09 3.69 9.3 8.5 9.87V15h-2.5v-3H10V9.8c0-2.73 1.64-4.5 4.1-4.5 1.15 0 2.22.2 2.53.29V8h-1.6c-1.3 0-1.56.62-1.56 1.53V12h3l-0.5 3h-2.5v6.87C18.31 21.3 22 17.09 22 12c0-5.53-4.47-10-10-10zBCuadrado (Lleno, estilo 'App')M20 2h-16C2.9 2 2 2.9 2 4v16c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V4C22 2.9 21.1 2 20 2zM16 12h-2v6h-3v-6h-2V9h2V8c0-1.66 1.34-3 3-3h3v3h-3c-0.55 0-1 0.45-1 1v2h4L16 12")}
                            </a>
                            <a href="https://instagram.com" aria-label="Instagram">
                                {getSocialIcon("M12 2c2.75 0 3.1.01 4.19.06 1.09.05 1.79.23 2.45.48.66.25 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.66.43 1.36.48 2.45.05 1.09.06 1.44.06 4.19s-.01 3.1-.06 4.19c-.05 1.09-.23 1.79-.48 2.45-.25.66-.6 1.21-1.15 1.76-.55.55-1.1 1.09-1.76 1.15-.66.25-1.36.43-2.45.48-1.09.05-1.44.06-4.19.06s-3.1-.01-4.19-.06c-1.09-.05-1.79-.23-2.45-.48-.66-.25-1.21-.6-1.76-1.15-.55-.55-1.09-1.1-1.15-1.76-.25-.66-.43-1.36-.48-2.45-.05-1.09-.06-1.44-.06-4.19s.01-3.1.06-4.19c.05-1.09.23-1.79.48-2.45.25-.66.6-1.21 1.15-1.76.55-.55 1.1-.9 1.76-1.15.66-.25 1.36-.43 2.45-.48C8.9.01 9.25 0 12 0zm0 4.38c-4.2 0-7.62 3.42-7.62 7.62s3.42 7.62 7.62 7.62 7.62-3.42 7.62-7.62-3.42-7.62-7.62-7.62zm0 2.21c3.08 0 5.41 2.33 5.41 5.41s-2.33 5.41-5.41 5.41-5.41-2.33-5.41-5.41 2.33-5.41 5.41-5.41zm6.27-.92c.55 0 .99.44.99.99s-.44.99-.99.99-.99-.44-.99-.99.44-.99.99-.99z")}
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </footer >
    );
};