import React, { useState } from 'react';
import { AdminMenu } from './AdminMenu';
import { AdminPackageList } from './AdminPackageList';
import { AdminPackageForm, initialFormData } from './AdminPackageForm';
import { AdminUserList } from './AdminUserList';
import { AdminCategory } from './AdminCategory';

export const AdminDashboard = () => {
    const [currentView, setCurrentView] = useState('MENU');

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleActionComplete = () => {
        setCurrentView('LIST');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'LIST':
                return (
                    <AdminPackageList
                        onBackToMenu={() => handleViewChange('MENU')}
                    />
                );

            case 'CREATE_FORM':
                return (
                    <AdminPackageForm
                        packageToEdit={initialFormData}
                        onActionComplete={() => handleViewChange('LIST')}
                    />
                );

            case 'LIST_USERS':
                return (
                    <AdminUserList
                        onBackToMenu={() => handleViewChange('MENU')}
                    />
                );

            case 'LIST_CATEGORY':
                return (
                    <AdminCategory
                        onBackToMenu={() => handleViewChange('MENU')}
                    />
                );

            case 'MENU':
            default:
                return <AdminMenu onViewChange={handleViewChange} />;

        }
    };

    return (
        <div className="admin-dashboard-root">
            {renderContent()}
        </div>
    );
};