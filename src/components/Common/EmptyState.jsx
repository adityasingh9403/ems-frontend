import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => {
    return (
        <div className="text-center p-10 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg my-4">
            {/* --- FIXED: Added a check to ensure Icon exists before rendering --- */}
            {Icon && <Icon className="w-12 h-12 mx-auto text-slate-400" />}
            <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
            <p className="mt-1 text-sm">{message}</p>
        </div>
    );
};

export default EmptyState;
