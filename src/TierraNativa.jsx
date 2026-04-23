import { Route, Routes } from 'react-router-dom';
import { NavBarComponent } from './component/NavBarComponent';
import { Home } from './pages/Home.jsx';
import { PackageDetailed } from './pages/PackageDetailed.jsx'
import ErrorBoundary from './component/ErrorBoundary.jsx';
import { useEffect, useState, useContext } from 'react';
import { FooterComponent } from './component/FooterComponent.jsx';
import { useLocation } from 'react-router-dom';
import { AdminDashboard } from './component/AdminDashboard.jsx';
import { AdminBookingList } from './component/AdminBookingList.jsx';
import { LoginView } from './component/LoginView.jsx';
import { RegisterView } from './component/RegisterView.jsx';
import { VerifyEmailView } from './component/VerifyEmailView.jsx';
import { AdminCategory } from './component/AdminCategory.jsx';
import { CategoryPackagesPage } from './pages/CategoryPackagesPage'
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { PackageTravelContext } from './context/PackageTravelContext.js';
import { BookingPage } from './pages/BookingPage.jsx';
import { BookingHistoryPage } from './pages/BookingHistoryPage.jsx';
import { WhatsAppButton } from './component/WhatsAppButton.jsx';

export const TierraNativa = () => {
    const SCROLL_THRESHOLD = 500;
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    const { auth, login } = useContext(PackageTravelContext);

    const isDetailedPage = location.pathname.startsWith('/detallePaquete/') && location.pathname.split('/').length === 3;
    const isAdminPage = location.pathname.startsWith('/paquetes/admin');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-email';
    const isCategoryPage = location.pathname.startsWith('/categories/categoria/') && location.pathname.split('/').length > 3;
    const isFavoritePage = location.pathname.startsWith('/favorites');
    const isBookingPage = location.pathname.startsWith('/booking') || location.pathname.startsWith('/my-bookings');
    const shouldBeSolid = isDetailedPage || isAdminPage || isAuthPage || isCategoryPage || isFavoritePage || isBookingPage;

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

    return (
        <>
            <div className="app-wrapper">
                <div className="app-content-wrapper">

                    <NavBarComponent
                        isScrolled={isScrolled}
                        shouldBeSolid={shouldBeSolid}
                    />
                    <div className={`container-pages ${isAuthPage ? 'pt-24' : (shouldBeSolid ? 'pt-80' : '')}`}>
                        <Routes>
                            <Route path='/home' element={<Home isUserLoggedIn={auth.isAuthenticated} />} />
                            <Route path='/paquetes' element={<Home isUserLoggedIn={auth.isAuthenticated} />} />
                            <Route path='/detallePaquete/:id' element={
                                <ErrorBoundary>
                                    <PackageDetailed />
                                </ErrorBoundary>
                            } />
                            <Route path='/paquetes/admin' element={<AdminDashboard />} />
                            <Route path='/paquetes/admin/reservas' element={<AdminBookingList />} />
                            <Route path='/login' element={<LoginView onAuthSuccess={login} />} />
                            <Route path='/register' element={<RegisterView />} />
                            <Route path='/verify-email' element={<VerifyEmailView />} />
                            <Route path='/categories/categoria/:categorySlug/*' element={<CategoryPackagesPage />} />
                            <Route path='/categories' element={<AdminCategory />} />
                            <Route path='/favorites' element={<FavoritesPage isUserLoggedIn={auth.isAuthenticated} />} />
                            <Route path='/booking/:id' element={<BookingPage />} />
                            <Route path='/my-bookings' element={<BookingHistoryPage />} />
                            <Route path="*" element={<Home isUserLoggedIn={auth.isAuthenticated} />} />
                        </Routes>

                        <WhatsAppButton />
                    </div>
                </div>
                <FooterComponent />
            </div>
        </>
    )
};
