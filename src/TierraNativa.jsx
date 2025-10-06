import { Route, Routes } from 'react-router-dom';
import { NavBarComponent } from './component/NavBarComponent';
import { Home } from './pages/home';
import { PackageDetailed } from './pages/PackageDetailed.jsx'

export const TierraNativa = () => {
  return (
        <> 
        <NavBarComponent/>
        
        <div className='container'>
            <Routes>
                <Route path='/' element={<Home/>}></Route> 
                 <Route path='/paquetes' element={<Home/>}></Route> 
                    <Route path='/detallePaquete/:id' element={<PackageDetailed/>}></Route>
            </Routes>
        </div>
    </>
     )
};