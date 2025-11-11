import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TierraNativa } from './TierraNativa.jsx'
import { BrowserRouter } from 'react-router-dom';
import { PackageTravelProvider } from './context/PackageTravelProvider.jsx';
import { PackageDetailedProvider } from './context/PackageDetailedProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PackageTravelProvider>
        <PackageDetailedProvider>
          <TierraNativa />
        </PackageDetailedProvider>
      </PackageTravelProvider>
    </BrowserRouter>
  </StrictMode>,
)
