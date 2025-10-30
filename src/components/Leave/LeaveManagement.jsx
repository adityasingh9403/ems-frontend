import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LeaveManagement_Admin from './LeaveManagement_Admin';
import LeaveManagement_HR from './LeaveManagement_HR';
import LeaveManagement_DeptManager from './LeaveManagement_DeptManager';
import LeaveManagement_Employee from './LeaveManagement_Employee';

const LeaveManagement = () => {
    const { user } = useAuth();

    switch(user.role) {
        case 'admin': 
            return <LeaveManagement_Admin />;
        case 'hr_manager': 
            return <LeaveManagement_HR />;
        case 'department_manager': 
            return <LeaveManagement_DeptManager />;
        case 'employee': 
            return <LeaveManagement_Employee />;
        default: 
            return <div className="text-center p-8">You do not have permission to view this page.</div>;
    }
};

export default LeaveManagement;
