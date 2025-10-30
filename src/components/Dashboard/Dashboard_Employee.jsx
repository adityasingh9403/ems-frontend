import React, { useState, useEffect } from 'react';
import { Briefcase, Camera, CalendarCheck, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BiometricAttendanceModal from '../Attendance/BiometricAttendanceModal';
import Announcements from './Announcements';
import StatsCard from './StatsCard';
import { apiGetDashboardStats, apiGetOfficeTimings } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Dashboard_Employee = () => {
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

    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [statsRes, timingsRes] = await Promise.all([
                apiGetDashboardStats(),
                apiGetOfficeTimings()
            ]);
            setStats(statsRes.data || {});
            setOfficeTimings(timingsRes.data || { startTime: 'N/A', endTime: 'N/A' });
        } catch (error) {
            showToast("Could not load dashboard data.", "error");
            setStats({});
            setOfficeTimings({ startTime: 'N/A', endTime: 'N/A' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    return (
        <>
            <BiometricAttendanceModal 
                isOpen={isBiometricModalOpen}
                onClose={() => setIsBiometricModalOpen(false)}
                onAttendanceMarked={fetchDashboardData} // Refreshes stats after marking
                currentUser={user}
            />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="bg-gradient-to-r from-green-500 to-lime-500 p-8 rounded-xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
                        <p className="text-lime-100 mt-1">Have a productive day.</p>
                    </div>
                    <button 
                        onClick={() => setIsBiometricModalOpen(true)} 
                        className="bg-white text-green-700 px-5 py-2.5 rounded-lg font-bold flex items-center space-x-2 shadow-sm w-full sm:w-auto justify-center"
                    >
                        <Camera className="w-5 h-5" />
                        <span>Smart Attendance</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-section">
                    <StatsCard title="My Pending Leaves" value={loading ? '...' : stats.myPendingLeaves ?? '0'} icon={CalendarCheck} color="yellow" />
                    <StatsCard title="My Pending Tasks" value={loading ? '...' : stats.myTasksPending ?? '0'} icon={CheckSquare} color="blue" />
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
                
                <div className="fade-in-section">
                    <Announcements />
                </div>
            </div>
        </>
    );
};

export default Dashboard_Employee;