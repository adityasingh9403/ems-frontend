import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Briefcase, Building2, Calendar, Clock, LogOut, Shield } from 'lucide-react';
import { showToast, getStatusBadge } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { apiGetMyAttendance, apiGetDepartments } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const EmployeeProfile = () => {
    const { user, logout } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [departmentName, setDepartmentName] = useState('Not Assigned');
    const [loading, setLoading] = useState(true);

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
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---
    
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch all data in parallel
                const [attendanceRes, departmentsRes] = await Promise.all([
                    apiGetMyAttendance(),
                    apiGetDepartments()
                ]);

                const attendanceData = attendanceRes.data?.$values || [];
                const departmentsData = departmentsRes.data?.$values || [];

                setAttendance(attendanceData.slice(0, 5)); // Show latest 5 records

                const dept = departmentsData.find(d => d.id === user.departmentId);
                if (dept) {
                    setDepartmentName(dept.name);
                }

            } catch (error) {
                showToast("Could not load profile data.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return <LoadingSpinner message="Loading Profile..." />;
    }

    if (!user) {
        return <EmptyState title="Not Logged In" message="Please log in to view your profile." />;
    }
    
    const userRole = user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const avatarUrl = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=14b8a6&color=fff&size=96&font-size=0.4`;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile & Attendance</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.firstName}!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information Card (Left) */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 flex flex-col fade-in-section">
                    <div className="flex flex-col items-center text-center">
                        <img src={avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full mb-4 border-4 border-slate-200 dark:border-slate-700" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{userRole}</p>
                    </div>
                    <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4">
                        <div className="flex items-center text-sm"><Mail className="w-4 h-4 text-gray-400 mr-3 shrink-0" /> <span className="text-gray-700 dark:text-gray-300 break-all">{user.email}</span></div>
                        <div className="flex items-center text-sm"><Building2 className="w-4 h-4 text-gray-400 mr-3 shrink-0" /> <span className="text-gray-700 dark:text-gray-300">{departmentName}</span></div>
                        <div className="flex items-center text-sm"><Briefcase className="w-4 h-4 text-gray-400 mr-3 shrink-0" /> <span className="text-gray-700 dark:text-gray-300">User ID: {user.id}</span></div>
                        {user.createdAt && <div className="flex items-center text-sm"><Calendar className="w-4 h-4 text-gray-400 mr-3 shrink-0" /> <span className="text-gray-700 dark:text-gray-300">Member since {new Date(user.createdAt).toLocaleDateString()}</span></div>}
                    </div>
                    <div className="mt-auto pt-6">
                        <button 
                            onClick={logout} 
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4"/>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Attendance Card (Right) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 fade-in-section">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Attendance Log</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {attendance.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-gray-300">Date</th>
                                        <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-gray-300">Clock In</th>
                                        <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-gray-300">Clock Out</th>
                                        <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {attendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                            <td className="py-4 px-6 text-gray-900 dark:text-gray-200">{new Date(record.date + 'T00:00:00Z').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            <td className="py-4 px-6 text-gray-700 dark:text-gray-400">{record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '-'}</td>
                                            <td className="py-4 px-6 text-gray-700 dark:text-gray-400">{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-'}</td>
                                            <td className="py-4 px-6">{getStatusBadge(record.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <EmptyState title="No Attendance Data" message="Your recent attendance records will appear here." />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;