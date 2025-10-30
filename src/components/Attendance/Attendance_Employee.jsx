import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BiometricAttendanceModal from './BiometricAttendanceModal';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { 
    apiGetMyAttendance, 
    apiGetHolidays, 
    apiGetLeaveRequests 
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Attendance_Employee = () => {
    const { user } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [approvedLeaves, setApprovedLeaves] = useState([]);
    const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- ANIMATION LOGIC ---
    const [observer, setElements, entries] = useIntersectionObserver({
        threshold: 0.1,
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
        if (!loading) { // Only run after initial data has loaded
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [attendanceRes, holidaysRes, leavesRes] = await Promise.all([
                apiGetMyAttendance(), 
                apiGetHolidays(),
                apiGetLeaveRequests()
            ]);

            const attendanceData = attendanceRes.data?.$values || [];
            const holidaysData = holidaysRes.data?.$values || [];
            const leavesData = leavesRes.data?.$values || [];

            setAttendanceRecords(attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setHolidays(holidaysData);
            setApprovedLeaves(leavesData.filter(l => l.requestorId === user.id && l.status === 'approved'));

        } catch (error) {
            showToast("Could not fetch your attendance data.", "error");
            setAttendanceRecords([]);
            setHolidays([]);
            setApprovedLeaves([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords.find(r => r.date === todayStr);
    const todayIsHoliday = holidays.some(h => h.holidayDate === todayStr);
    const isOnLeaveToday = approvedLeaves.some(l => l.requestorId === user.id && todayStr >= l.startDate && todayStr <= l.endDate);
    const isClockedOut = todayRecord && todayRecord.clockOut;
    const canMarkAttendance = !todayIsHoliday && !isClockedOut && !isOnLeaveToday;

    return (
        <>
            <BiometricAttendanceModal 
                isOpen={isBiometricModalOpen} 
                onClose={() => setIsBiometricModalOpen(false)} 
                onAttendanceMarked={fetchData}
                currentUser={user}
                todayRecord={todayRecord}
            />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Attendance</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your daily attendance and monthly summary.</p>
                    </div>
                    <button 
                        onClick={() => setIsBiometricModalOpen(true)} 
                        disabled={!canMarkAttendance} 
                        className="bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <Camera className="w-5 h-5" />
                        <span>{todayRecord ? "Clock Out" : "Smart Attendance"}</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 p-5">Recent Attendance Log</h2>
                    {loading ? <LoadingSpinner /> : (
                        <div className="overflow-x-auto">
                            {attendanceRecords.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Clock In</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Clock Out</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {attendanceRecords.slice(0, 7).map(rec => (
                                            <tr key={rec.id}>
                                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{new Date(rec.date + 'T00:00:00Z').toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{getStatusBadge(rec.status)}</td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString() : '-'}</td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString() : '-'}</td>
                                                <td className="px-6 py-4">
                                                    {rec.clockInLocation && 
                                                        <a href={`https://www.google.com/maps?q=${rec.clockInLocation}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                                                            <MapPin className="w-3 h-3"/> View Map
                                                        </a>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyState icon={Calendar} title="No Records Yet" message="Your attendance records will appear here once you start clocking in." />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Attendance_Employee;