import { NavLink, Link } from 'react-router-dom';
import '../style/NavBarComponent.css';

export const NavBarComponent = ({ isScrolled, shouldBeSolid, user, onLogout, categories = [] }) => {
    const navClasses = `navbar navbar-expand-lg tn-navbar navbar-fixed ${shouldBeSolid || isScrolled ? 'navbar-solid' : 'navbar-transparent'}`;

    const slugify = (text) => {
        if (!text) return '';
        return text.toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const getInitials = (firstName, lastName) => {
        const f = (firstName || '').trim();
        const l = (lastName || '').trim();
        return `${f.charAt(0) || ''}${l.charAt(0) || ''}`.toUpperCase();
    };

    const UserAvatar = () => {
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const role = user?.role || 'USER';
        const initials = getInitials(firstName, lastName);
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
                    <span className={`initials d-flex items-center justify-center me-2 font-bold`}>{initials}</span>
                    <span className="fw-bold d-none d-md-inline me-1">{firstName}</span>
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
                            <NavLink to="/paquetes/admin" className="dropdown-item">Panel Admin</NavLink>
                        </li>
                    )}
                    <li>
                        <button onClick={onLogout} className="dropdown-item text">Cerrar Sesión</button>
                    </li>
                </ul>
            </div>
        );
    };

    const AuthButtons = () => {
        if (user) return <UserAvatar />;
        return (
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle bg-green-600 hover:bg-green-700 text-white transition rounded-lg px-3 py-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">Mi cuenta</button>
                <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/login"><strong>Iniciar Sesión</strong></Link></li>
                    <li><Link className="dropdown-item" to="/register"><strong>Crear Cuenta</strong></Link></li>
                </ul>
            </div>
        );
    };

    return (
        <nav className={navClasses}>
            <div className="container-fluid">
                <NavLink to="/home" className="navbar-brand d-flex align-items-center">
                    <img src={shouldBeSolid || isScrolled ? "/images/LOGO TIERRA NATIVA.png" : "/images/LOGO TIERRA NATIVA BLANCO.png"} alt="Logo de Tierra Nativa" className='logo' />
                    <p className='d-inline ms-2 fw-bold'>Tierra Nativa</p>
                </NavLink>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav me-3">
                        {categories.map((cat, index) => {
                            const safeSlug = cat?.slug || slugify(cat?.title || '');
                            const title = cat?.title || safeSlug || 'Categoría';
                            return (
                                <li key={index} className="nav-item">
                                    <Link to={`/categories/categoria/${safeSlug}`} className="nav-link">{title}</Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="ms-3">
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </nav>
    );
};