import React, { useState, useEffect } from 'react';
import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetNotifications } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';

const Header = ({ onMenuToggle, title }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const checkNotifications = async () => {
        if (!user) return;
        try {
            const response = await apiGetNotifications();
            const notificationsData = response.data?.$values || [];
            
            setNotifications(notificationsData.slice(0, 5)); 
            
            // In a real app, you'd check a `is_read` flag from the backend.
            // For now, if the new list has items and the old one didn't, show the dot.
            if (notificationsData.length > notifications.length) {
                setHasUnread(true);
            }

        } catch (error) {
            // Don't show toast on interval errors to avoid spamming the user
        }
    };

    useEffect(() => {
        // Fetch immediately on load
        checkNotifications();
        // Set up polling to check for new notifications every 30 seconds
        const intervalId = setInterval(checkNotifications, 30000); 
        return () => clearInterval(intervalId);
    }, [user]);

    const handleBellClick = () => {
        setShowNotifications(prev => !prev);
        // When the user opens the dropdown, mark as read
        if (!showNotifications) {
            setHasUnread(false);
            // Here you would also make an API call to mark notifications as read in the DB
        }
    };

    const iconButtonClass = "p-2 rounded-full transition-colors duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

    return (
        <header className="p-2 sm:p-4">
            <div className="flex items-center justify-between w-full h-16 px-4 sm:px-6 rounded-2xl border bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                    <button onClick={onMenuToggle} className={`lg:hidden ${iconButtonClass}`}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 capitalize">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={toggleTheme} className={iconButtonClass}>
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    
                    <div className="relative">
                        <button onClick={handleBellClick} className={`relative ${iconButtonClass}`}>
                            <Bell className="w-5 h-5" />
                            {hasUnread && (
                                <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900/70"></span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="fade-in-section is-visible absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                                <div className="p-3 font-bold border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">Notifications</div>
                                <div className="p-2 max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                                            <p className="text-sm text-slate-700 dark:text-slate-200">{n.message}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                    )) : (
                                        <p className="p-4 text-sm text-center text-slate-500">No new notifications.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;