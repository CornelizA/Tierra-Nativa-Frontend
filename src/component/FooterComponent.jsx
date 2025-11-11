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
                                {getSocialIcon("M12 2C6.47 2 2 6.47 2 12c0 5.09 3.69 9.3 8.5 9.87V15h-2.5v-3H10V9.8c0-2.73 1.64-4.5 4.1-4.5 1.15 0 2.22.2 2.53.29V8h-1.6c-1.3 0-1.56.62-1.56 1.53V12h3l-0.5 3h-2.5v6.87C18.31 21.3 22 17.09 22 12c0-5.53-4.47-10-10-10z")}
                            </a>
                            <a href="https://instagram.com" aria-label="Instagram">
                                {getSocialIcon("M12 2.163c3.2 0 3.585.016 4.85.071 4.567.16 6.075 1.765 6.237 6.237.058 1.265.071 1.65.071 4.85s-.013 3.585-.071 4.85c-.162 4.47-1.67 6.075-6.237 6.237-1.265.058-1.65.071-4.85.071s-3.585-.013-4.85-.071c-4.567-.16-6.075-1.765-6.237-6.237-.058-1.265-.071-1.65-.071-4.85s.013-3.585.071-4.85c.16-4.47 1.667-6.075 6.237-6.237C8.415 2.179 8.799 2.163 12 2.163zm0 4.025a5.812 5.812 0 100 11.625 5.812 5.812 0 000-11.625zm0 1.95a3.863 3.863 0 110 7.725 3.863 3.863 0 010-7.725zm6.5-1.938a1.313 1.313 0 100 2.625 1.313 1.313 0 000-2.625z")}
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </footer >
    );
};