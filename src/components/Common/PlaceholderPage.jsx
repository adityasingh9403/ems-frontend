import React from 'react';

const PlaceholderPage = ({ icon: Icon, title, message }) => {
    return (
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)] p-4 text-center bg-slate-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-800 p-10 sm:p-12 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 max-w-lg">
                {Icon && <Icon className="mx-auto h-16 w-16 text-teal-500 mb-5 animate-pulse" />}
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400">{message}</p>
            </div>
        </div>
    );
};

export default PlaceholderPage;