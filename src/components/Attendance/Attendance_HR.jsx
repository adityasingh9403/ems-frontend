import React, {useState, useEffect } from 'react';
import { Camera, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BiometricAttendanceModal from './BiometricAttendanceModal';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { 
    apiGetAttendance, 
    apiGetHolidays, 
    apiGetLeaveRequests, 
    apiGetEmployees 
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Attendance_HR = () => {
    const { user } = useAuth();
    const [allRecords, setAllRecords] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
            const [attendanceRes, employeesRes, holidaysRes, leavesRes] = await Promise.all([
                apiGetAttendance(),
                apiGetEmployees(),
                apiGetHolidays(),
                apiGetLeaveRequests()
            ]);

            const attendanceData = attendanceRes.data?.$values || [];
            const employeesData = employeesRes.data?.$values || [];
            const holidaysData = holidaysRes.data?.$values || [];
            const leavesData = leavesRes.data?.$values || [];

            setAllRecords(attendanceData);
            setAllEmployees(employeesData.filter(emp => emp.role !== 'admin'));
            setHolidays(holidaysData);
            setApprovedLeaves(leavesData.filter(l => l.status === 'approved'));

        } catch (error) {
            showToast("Could not fetch attendance data from the server.", "error");
            setAllRecords([]);
            setAllEmployees([]);
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
    const todayRecord = allRecords.find(r => r.userId === user.id && r.date === todayStr);
    const todayIsHoliday = holidays.some(h => h.holidayDate === todayStr);
    const isOnLeaveToday = approvedLeaves.some(l => l.requestorId === user.id && todayStr >= l.startDate && todayStr <= l.endDate);
    const isClockedOut = todayRecord && todayRecord.clockOut;
    const canMarkAttendance = !todayIsHoliday && !isClockedOut && !isOnLeaveToday;
    const isSelectedDateHoliday = holidays.some(h => h.holidayDate === selectedDate);
    const holidayDescription = isSelectedDateHoliday ? holidays.find(h => h.holidayDate === selectedDate)?.description : '';

    const recordsForDate = allEmployees.map(employee => {
        if (isSelectedDateHoliday) return { ...employee, record: { status: 'holiday' } };
        
        const isOnLeave = approvedLeaves.some(l => 
            l.requestorId === employee.id && 
            selectedDate >= l.startDate && 
            selectedDate <= l.endDate
        );
        if (isOnLeave) return { ...employee, record: { status: 'on_leave' } };

        const record = allRecords.find(r => r.userId === employee.id && r.date === selectedDate);
        return { ...employee, record: record || { status: 'absent' } };
    });

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
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Company Attendance (HR)</h1>
                    <button 
                        onClick={() => setIsBiometricModalOpen(true)} 
                        disabled={!canMarkAttendance} 
                        className="bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <Camera className="w-5 h-5" />
                        <span>{todayRecord ? "Clock Out" : "Mark My Attendance"}</span>
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 fade-in-section">
                    <label htmlFor="date-filter" className="font-medium text-slate-700 dark:text-slate-300">Select Date:</label>
                    <input 
                        id="date-filter" 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        className="ml-2 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200" 
                    />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 p-5">
                        Employee & Manager Status for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString()}
                    </h2>
                    {isSelectedDateHoliday && <p className="px-5 pb-4 text-teal-500 dark:text-teal-400 font-bold">This day is a holiday: {holidayDescription}</p>}
                    
                    {loading ? <LoadingSpinner /> : (
                        <div className="overflow-x-auto">
                            {recordsForDate.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee / Manager</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Clock In</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Clock Out</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {recordsForDate.map(emp => (
                                            <tr key={emp.id}>
                                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{emp.firstName} {emp.lastName}</td>
                                                <td className="px-6 py-4">{getStatusBadge(emp.record.status)}</td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{emp.record.clockIn ? new Date(emp.record.clockIn).toLocaleTimeString() : '-'}</td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{emp.record.clockOut ? new Date(emp.record.clockOut).toLocaleTimeString() : '-'}</td>
                                                <td className="px-6 py-4">
                                                    {emp.record.clockInLocation && 
                                                        <a href={`https://www.google.com/maps?q=${emp.record.clockInLocation}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                                                            <MapPin className="w-3 h-3"/> View Map
                                                        </a>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyState icon={Users} title="No Employees Found" message="There are no employees or managers in your company yet." />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Attendance_HR;