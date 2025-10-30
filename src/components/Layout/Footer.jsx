// /src/components/Layout/Footer.js

import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="p-2 sm:p-4">
            {/* This div has the same styling as the header */}
            <div className="w-full px-4 sm:px-6 py-4 rounded-2xl border transition-colors duration-300 bg-opacity-70 backdrop-blur-lg dark:bg-slate-900/70 dark:border-slate-700 bg-white/70 border-slate-200/80">
                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>&copy; {currentYear} EMS Portal. All Rights Reserved.</p>
                    <p className="mt-1">
                        A Comprehensive Solution for Modern Workforce Management.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
