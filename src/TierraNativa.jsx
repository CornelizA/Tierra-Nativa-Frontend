import { Route, Routes } from 'react-router-dom';
import { NavBarComponent } from './component/NavBarComponent';
import { Home } from './pages/home';
import { PackageDetailed } from './pages/PackageDetailed.jsx'
import { useEffect, useState } from 'react';
import { FooterComponent } from './component/FooterComponent.jsx';
import { useLocation } from 'react-router-dom';
import { AdminPackageList } from './component/AdminPackageList.jsx';

export const TierraNativa = () => {
    const SCROLL_THRESHOLD = 500;
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    const isDetailedPage = location.pathname.startsWith('/detallePaquete/') &&
        location.pathname.split('/').length === 3;

    useEffect(() => {
        const handleScroll = () => {
            if (!isDetailedPage) {
                setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
            }
        };

        if (!isDetailedPage) {
            window.addEventListener('scroll', handleScroll);
        } else {
            setIsScrolled(false);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDetailedPage]);


    return (
        <>
            <NavBarComponent isScrolled={isScrolled} isDetailedPage={isDetailedPage} />
            <div className={`container ${isDetailedPage ? 'pt-80' : ''}`}>
                <Routes>
                    <Route path='/' element={<Home />}></Route>
                    <Route path='/paquetes' element={<Home />}></Route>
                    <Route path='/detallePaquete/:id' element={<PackageDetailed />}></Route>
                    <Route path="/paquetes/admin" element={<AdminPackageList />}></Route>
                </Routes>
            </div>
            <FooterComponent />
        </>
    )


};