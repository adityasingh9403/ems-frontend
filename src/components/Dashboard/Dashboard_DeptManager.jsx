import React, { useState, useEffect } from 'react';
import { Users, Clock, CalendarCheck, Camera, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard'; 
import BiometricAttendanceModal from '../Attendance/BiometricAttendanceModal';
import Announcements from './Announcements';
import { apiGetDashboardStats, apiGetOfficeTimings } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Dashboard_DeptManager = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [officeTimings, setOfficeTimings] = useState({ startTime: 'N/A', endTime: 'N/A' });
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [statsRes, timingsRes] = await Promise.all([
                    apiGetDashboardStats(),
                    apiGetOfficeTimings()
                ]);
                
                // Safely set the stats and timings, defaulting to empty objects if data is null
                setStats(statsRes.data || {});
                setOfficeTimings(timingsRes.data || { startTime: 'N/A', endTime: 'N/A' });
            } catch {
                showToast("Could not load dashboard data.", "error");
                setStats({});
                setOfficeTimings({ startTime: 'N/A', endTime: 'N/A' });
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    return (
        <>
            <BiometricAttendanceModal 
                isOpen={isBiometricModalOpen}
                onClose={() => setIsBiometricModalOpen(false)}
                onAttendanceMarked={() => { /* Attendance page will handle refresh */ }}
                currentUser={user}
            />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold">Manager's Dashboard</h1>
                        <p className="text-pink-100 mt-1">Hello, {user?.firstName}! Here is a summary of your team.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-section">
                    <StatsCard title="Team Members" value={loading ? '...' : stats.teamCount ?? '0'} icon={Users} color="blue" />
                    <StatsCard title="Present Today" value={loading ? '...' : `${stats.teamPresentToday ?? '0'} / ${stats.teamCount ?? '0'}`} icon={Clock} color="yellow" />
                    <StatsCard title="Team's Pending Leaves" value={loading ? '...' : stats.teamPendingLeaves ?? '0'} icon={CalendarCheck} color="red" />
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-t-4 border-gray-400">
                         <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Office Timings</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">{officeTimings.startTime} - {officeTimings.endTime}</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-full">
                                <Briefcase className="w-5 h-5" />
                            </div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-section">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Quick Actions</h2>
                        {/* You can add links to other pages here */}
                    </div>
                    <Announcements />
                </div>
            </div>
        </>
    );
};

export default Dashboard_DeptManager;