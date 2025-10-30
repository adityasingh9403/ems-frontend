import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard_Admin from './Dashboard_Admin';
import Dashboard_HR from './Dashboard_HR';
import Dashboard_DeptManager from './Dashboard_DeptManager';
import Dashboard_Employee from './Dashboard_Employee';
// --- REMOVED: No more logic file imports ---

const Dashboard = () => {
    const { user } = useAuth();
    // --- REMOVED: useEffect for runAutoAbsentCheck is gone ---

    if (!user) {
        return <div className="p-8">Loading user data...</div>;
    }

    switch (user.role) {
        case 'admin':
            return <Dashboard_Admin />;
        case 'hr_manager':
            return <Dashboard_HR />;
        case 'department_manager':
            return <Dashboard_DeptManager />;
        case 'employee':
            return <Dashboard_Employee />;
        default:
            return <div className="p-8">No dashboard available for your role.</div>;
    }
};

export default Dashboard;