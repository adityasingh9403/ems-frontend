import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home, Users, Building2, Clock, DollarSign, Settings, LogOut,
    UserCheck, BarChart3, CalendarCheck, Award, FileText, X,
    CheckSquare, MessageSquare, Calendar, ClipboardCheck, LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetCompanyDetails } from '../../apiService'; // Import the new API function

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('Your Company');

    // This effect now fetches the company name from the API
    useEffect(() => {
        const fetchCompanyData = async () => {
            if (user) {
                try {
                    const response = await apiGetCompanyDetails();
                    setCompanyName(response.data.name);
                } catch (error) {
                    console.error("Could not fetch company name.");
                }
            }
        };
        fetchCompanyData();
    }, [user]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'employees', label: 'Employees', icon: Users, path: '/employees', roles: ['admin', 'hr_manager', 'department_manager'] },
        { id: 'departments', label: 'Departments', icon: Building2, path: '/departments', roles: ['admin', 'hr_manager'] },
        { id: 'attendance', label: 'Attendance', icon: Clock, path: '/attendance', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'leave', label: 'Leave', icon: CalendarCheck, path: '/leave', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'helpdesk', label: 'Helpdesk', icon: LifeBuoy, path: '/helpdesk', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'payroll', label: 'Payroll', icon: DollarSign, path: '/payroll', roles: ['admin', 'hr_manager'] },
        { id: 'performance', label: 'Performance', icon: Award, path: '/performance', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'onboarding', label: 'Onboarding', icon: ClipboardCheck, path: '/onboarding', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'org-chart', label: 'Org Chart', icon: Users, path: '/org-chart', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'documents', label: 'Documents', icon: FileText, path: '/documents', roles: ['employee', 'department_manager', 'hr_manager', 'admin'] },
        { id: 'profile', label: 'My Profile', icon: UserCheck, path: '/profile', roles: ['admin', 'hr_manager', 'department_manager', 'employee'] },
        { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', roles: ['admin', 'hr_manager'] },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
    ];

    const visibleMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <li>
                <NavLink
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    className={({ isActive }) =>
                        `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10'
                        }`
                    }
                >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
            </li>
        );
    };

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-md">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-md font-bold text-slate-800 dark:text-white">EMS Portal</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{companyName}</p>
                    </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto">
                <ul className="space-y-1.5">
                    {visibleMenuItems.map((item) => (
                        <NavItem key={item.id} item={item} />
                    ))}
                </ul>
            </nav>
            <div className="p-3 border-t border-black/5 dark:border-white/5 flex-shrink-0">
                <div className="flex items-center space-x-3 p-2 rounded-lg">
                    <img src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=14b8a6&color=fff&rounded=true&font-size=0.4`} alt="User Avatar" className="w-10 h-10 rounded-full" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role.replace('_', ' ')}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 shadow-xl transition-transform duration-300 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
            <aside className="fixed inset-y-0 left-4 top-4 z-30 w-64 flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl shadow-xl hidden lg:flex">
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;