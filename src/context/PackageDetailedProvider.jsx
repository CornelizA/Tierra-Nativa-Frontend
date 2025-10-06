import { createContext, useState } from "react";
        
export const PackageDetailedContext = createContext();
export const PackageDetailedProvider = ({ children }) => {
    const [selectedPackageTravel, setSelectedPackageTravel] = useState(null);

    return (
        <PackageDetailedContext.Provider value={{selectedPackageTravel }}>
            {children}
        </PackageDetailedContext.Provider>
    );
};