import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
    onClick // NEW: Added onClick prop
}) => {
    const colorClasses = {
        border: {
            blue: 'border-blue-500',
            green: 'border-green-500',
            yellow: 'border-yellow-500',
            red: 'border-red-500',
        },
        icon: {
            blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
            green: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
            yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
            red: 'bg-red-100 text-red-600 dark:bg-rose-500/20 dark:text-rose-400',
        }
    };

    return (
        // UPDATED: Wrapped in a button for click functionality and accessibility
        <button
            onClick={onClick}
            className={`
                bg-white dark:bg-slate-800 
                rounded-xl shadow-sm 
                border border-slate-200 dark:border-slate-700 
                border-t-4 ${colorClasses.border[color]}
                p-5 text-left w-full
                transition-all duration-200 hover:shadow-lg hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</p>
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses.icon[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </button>
    );
};

export default StatsCard;