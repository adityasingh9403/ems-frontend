import React, { useState, useEffect } from 'react';
import { Users, Building2, CalendarCheck, Clock, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard'; 
import Announcements from './Announcements';
import BiometricAttendanceModal from '../Attendance/BiometricAttendanceModal';
import { apiGetDashboardStats } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Dashboard_HR = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
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

    const fetchStats = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await apiGetDashboardStats();
            setStats(res.data || {}); // Safely set stats, default to empty object
        } catch {
            showToast("Could not load dashboard stats.", "error");
            setStats({}); // Set to empty object on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    return (
        <>
            <BiometricAttendanceModal 
                isOpen={isBiometricModalOpen}
                onClose={() => setIsBiometricModalOpen(false)}
                onAttendanceMarked={fetchStats} // Refresh stats after marking attendance
                currentUser={user}
            />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8 rounded-xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold">HR Dashboard</h1>
                        <p className="text-indigo-100 mt-1">Welcome, {user?.firstName}! Manage your workforce effectively.</p>
                    </div>
                    <button 
                        onClick={() => setIsBiometricModalOpen(true)} 
                        className="bg-white text-blue-700 px-5 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-sm w-full sm:w-auto justify-center"
                    >
                        <Camera className="w-5 h-5" />
                        <span>Smart Attendance</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-section">
                    <StatsCard title="Total Employees" value={loading ? '...' : stats.totalEmployees ?? '0'} icon={Users} color="blue" />
                    <StatsCard title="Total Departments" value={loading ? '...' : stats.totalDepartments ?? '0'} icon={Building2} color="green" />
                    <StatsCard title="Pending Leaves" value={loading ? '...' : stats.pendingLeaves ?? '0'} icon={CalendarCheck} color="red" />
                    <StatsCard title="Present Today" value={loading ? '...' : `${stats.presentToday ?? '0'} / ${stats.totalEmployees ?? '0'}`} icon={Clock} color="yellow" />
                </div>
                
                <div className="fade-in-section">
                    <Announcements />
                </div>
            </div>
        </>
    );
};

export default Dashboard_HR;