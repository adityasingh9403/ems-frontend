import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Import all role-specific attendance components
import Attendance_Admin from './Attendance_Admin';
import Attendance_HR from './Attendance_HR';
import Attendance_DeptManager from './Attendance_DeptManager';
import Attendance_Employee from './Attendance_Employee';

const Attendance = () => {
    const { user } = useAuth();

    if (!user) {
        // This is a safeguard, router should handle this
        return <Navigate to="/login" />;
    }

    // Render the correct component based on the user's role
    switch (user.role) {
        case 'admin':
            return <Attendance_Admin />;
        case 'hr_manager':
            return <Attendance_HR />;
        case 'department_manager':
            return <Attendance_DeptManager />;
        case 'employee':
            return <Attendance_Employee />;
        default:
            // If role is unknown, redirect to dashboard
            return <Navigate to="/dashboard" />;
    }
};

export default Attendance;