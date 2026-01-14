import { Route, Routes, useNavigate } from 'react-router-dom';
import { NavBarComponent } from './component/NavBarComponent';
import { Home } from './pages/Home.jsx';
import { PackageDetailed } from './pages/PackageDetailed.jsx'
import { useEffect, useState } from 'react';
import { FooterComponent } from './component/FooterComponent.jsx';
import { useLocation } from 'react-router-dom';
import { AdminDashboard } from './component/AdminDashboard.jsx';
import { LoginView } from './component/LoginView.jsx';
import { RegisterView } from './component/RegisterView.jsx';
import { AdminCategory } from './component/AdminCategory.jsx';
import { apiGetCategoriesPublic } from './service/PackageTravelService';
import { CategoryPackagesPage } from './pages/CategoryPackagesPage'

export const TierraNativa = () => {
    const SCROLL_THRESHOLD = 500;
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const isDetailedPage = location.pathname.startsWith('/detallePaquete/') &&
        location.pathname.split('/').length === 3;

    const isAdminPage = location.pathname.startsWith('/paquetes/admin');

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    
    const isCategoryPage = location.pathname.startsWith('/categories/categoria/') && 
                           location.pathname.split('/').length > 3;

    const shouldBeSolid = isDetailedPage || isAdminPage || isAuthPage || isCategoryPage ;

    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const onAuthSuccess = (userData) => {
        sessionStorage.setItem('jwtToken', userData.token);
        sessionStorage.setItem('userRole', userData.role);

        const simplifiedUser = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            email: userData.email
        };
        sessionStorage.setItem('user', JSON.stringify(simplifiedUser));
        setUser(simplifiedUser);
    };
    const handleLogout = () => {
        sessionStorage.clear();
        setUser(null);
        setIsScrolled(false);

        if (typeof Swal !== 'undefined') {
            Swal.fire('Sesión cerrada.', '¡Regresa pronto!', 'info');
        }
        navigate('/home');
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!shouldBeSolid) {
                setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
            }
        };
        if (!shouldBeSolid) {
            window.addEventListener('scroll', handleScroll);
        } else {
            setIsScrolled(true);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [shouldBeSolid]);

      useEffect(() => {
        const loadCategories = async () => {
            try {
                const fetchedCategories = await apiGetCategoriesPublic();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("No se pudieron cargar las categorías públicas:", error);
                setCategories([]);
            }
        };
        loadCategories();
    }, []); 

    return (
        <>
            <div className="app-wrapper">
                <div className="app-content-wrapper">
                    <NavBarComponent
                        isScrolled={isScrolled}
                        shouldBeSolid={shouldBeSolid}
                        user={user}
                        onLogout={handleLogout}
                        categories={categories}
                    />
                    <div className={`container-pages ${isAuthPage ? 'pt-20' : ''} ${!isAuthPage && shouldBeSolid ? 'pt-80' : ''}`}>
                        <Routes>
                            <Route path='/home' element={<Home />}></Route>
                            <Route path='/paquetes' element={<Home />}></Route>
                            <Route path='/detallePaquete/:id' element={<PackageDetailed />}></Route>
                            <Route path='/paquetes/admin' element={<AdminDashboard onLogout={handleLogout} />}></Route>
                            <Route path='/login' element={<LoginView onAuthSuccess={onAuthSuccess} />}></Route>
                            <Route path='/register' element={<RegisterView onAuthSuccess={onAuthSuccess} />}></Route>
                            <Route path='/categories/categoria/:categorySlug/*'  element={<CategoryPackagesPage />} />
                            <Route path='/categories' element={<AdminCategory />}></Route>
                        </Routes>
                    </div>
                </div>
                <FooterComponent />
            </div>
        </>
    )
};