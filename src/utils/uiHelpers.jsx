// /src/utils/uiHelpers.js

import React from 'react';
import { CheckCircle, XCircle, Clock, CalendarOff } from 'lucide-react';
import { toast } from 'react-toastify';

// Centralized function for all status badges
export const getStatusBadge = (status) => {
    const styles = {
        // Leave Statuses
        approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        
        // Attendance Statuses
        present: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        late: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
        absent: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        holiday: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
        'on leave': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',

        // Default
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    };
    
    const text = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
    const styleClass = styles[status.toLowerCase()] || styles.default;

    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClass}`}>{text}</span>;
};

export const showToast = (message, type = 'success') => {
    switch (type) {
        case 'success':
            toast.success(message);
            break;
        case 'error':
            toast.error(message);
            break;
        case 'info':
            toast.info(message);
            break;
        case 'warn':
            toast.warn(message);
            break;
        default:
            toast(message);
    }
};