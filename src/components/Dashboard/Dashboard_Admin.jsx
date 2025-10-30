import React, { useState, useEffect } from 'react';
import { Users, Building2, CalendarCheck, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard'; 
import Announcements from './Announcements';
import { apiGetDashboardStats } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Dashboard_Admin = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true); // Add loading state

    // --- ANIMATION LOGIC ---
    const [observer, setElements, entries] = useIntersectionObserver({
        threshold: 0.25,
        rootMargin: '0px',
    });

    useEffect(() => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, [entries, observer]);

    useEffect(() => {
        const sections = document.querySelectorAll('.fade-in-section');
        setElements(sections);
    }, [setElements, loading]); // Rerun when loading is finished
    // --- END OF ANIMATION LOGIC ---
    
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            setLoading(true); // Set loading to true when fetching starts
            try {
                const res = await apiGetDashboardStats();
                // Safely set the stats, defaulting to an empty object if data is null
                setStats(res.data || {});
            } catch {
                showToast("Could not load dashboard stats.", "error");
                setStats({}); // Set to empty object on error
            } finally {
                setLoading(false); // Set loading to false when fetching ends
            }
        };
        fetchStats();
    }, [user]);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-8 rounded-xl text-white shadow-lg fade-in-section">
                <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'Admin'}!</h1>
                <p className="text-cyan-100 mt-1">Here is the complete overview of your organization.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-section">
                <StatsCard title="Total Employees" value={loading ? '...' : stats.totalEmployees ?? '0'} icon={Users} color="blue" />
                <StatsCard title="Total Departments" value={loading ? '...' : stats.totalDepartments ?? '0'} icon={Building2} color="green" />
                <StatsCard title="Pending Leaves" value={loading ? '...' : stats.pendingLeaves ?? '0'} icon={CalendarCheck} color="red" />
                <StatsCard title="Present Today" value={loading ? '...' : `${stats.presentToday ?? '0'} / ${stats.totalEmployees ?? '0'}`} icon={Clock} color="yellow" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-section">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 px-4 py-2 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-500/30">Manage Employees</button>
                        <button className="bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30">Manage Departments</button>
                        <button className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30">Review Leave Requests</button>
                    </div>
                </div>
                <Announcements />
            </div>
        </div>
    );
};

export default Dashboard_Admin;