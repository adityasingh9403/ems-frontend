// /src/components/Common/LoadingSpinner.js

import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-10 text-slate-500 dark:text-slate-400">
            <Loader className="w-8 h-8 animate-spin text-teal-500" />
            <p className="mt-3 text-sm font-medium">{message}</p>
        </div>
    );
};

export default LoadingSpinner;