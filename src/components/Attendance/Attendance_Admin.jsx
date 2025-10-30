import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import { 
    apiGetAttendance, 
    apiGetHolidays, 
    apiAddHoliday, 
    apiDeleteHoliday, 
    apiGetLeaveRequests,
    apiGetEmployees 
} from '../../apiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Attendance_Admin = () => {
    const { user } = useAuth();
    const [allRecords, setAllRecords] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [holidays, setHolidays] = useState([]);
    const [newHoliday, setNewHoliday] = useState({ date: '', description: '' });
    const [approvedLeaves, setApprovedLeaves] = useState([]);
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
            setAllEmployees(employeesData);
            setHolidays(holidaysData);
            setApprovedLeaves(leavesData.filter(l => l.status === 'approved'));

        } catch (error) {
            showToast("Could not fetch necessary data from the server.", "error");
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
    
    // ... (rest of the handler functions like handleAddHoliday, handleDeleteHoliday, etc. remain the same) ...
    const handleAddHoliday = async (e) => {
        e.preventDefault();
        if (!newHoliday.date || !newHoliday.description.trim()) {
            showToast('Please provide both date and description for the holiday.', 'error');
            return;
        }
        try {
            const newHolidayData = { holidayDate: newHoliday.date, description: newHoliday.description };
            await apiAddHoliday(newHolidayData);
            showToast('Holiday added successfully!');
            setNewHoliday({ date: '', description: '' });
            fetchData(); // Refresh all data
        } catch (error) {
            showToast('Failed to add holiday.', 'error');
        }
    };

    const handleDeleteHoliday = async (holidayId) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                await apiDeleteHoliday(holidayId);
                showToast('Holiday deleted successfully.', 'info');
                fetchData(); // Refresh all data
            } catch (error) {
                showToast('Failed to delete holiday.', 'error');
            }
        }
    };

    const isHoliday = holidays.some(h => h.holidayDate === selectedDate);
    const holidayDescription = isHoliday ? holidays.find(h => h.holidayDate === selectedDate)?.description : '';

    const allRecordsForDate = allEmployees.map(emp => {
        if (isHoliday) return { ...emp, record: { status: 'holiday' } };
        
        const isOnLeave = approvedLeaves.some(leave => 
            leave.requestorId === emp.id &&
            selectedDate >= leave.startDate &&
            selectedDate <= leave.endDate
        );
        if (isOnLeave) return { ...emp, record: { status: 'on_leave' } };

        const record = allRecords.find(r => r.userId === emp.id && r.date === selectedDate);
        return { ...emp, record: record || { status: 'absent' } };
    });

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Company-Wide Attendance</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 fade-in-section">
                        <label htmlFor="date-filter" className="font-medium text-slate-700 dark:text-slate-300">Select Date:</label>
                        <input id="date-filter" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="ml-2 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                        <h2 className="text-xl font-semibold p-5 text-slate-800 dark:text-slate-100">All Employee Status for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString()}</h2>
                        {isHoliday && <p className="px-5 pb-4 text-teal-500 dark:text-teal-400 font-bold">This day is a holiday: {holidayDescription}</p>}
                        
                        {loading ? <LoadingSpinner /> : (
                            <div className="overflow-x-auto">
                               {allRecordsForDate.length > 0 ? (
                                   <table className="w-full text-sm">
                                       <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                           <tr>
                                               <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee</th>
                                               <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                               <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Clock In</th>
                                               <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Clock Out</th>
                                               <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Location</th>
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                           {allRecordsForDate.map(emp => (
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
                                   <EmptyState icon={Users} title="No Employees Found" message="There are no employees in your company to display."/>
                               )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 space-y-4 fade-in-section">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Manage Holidays</h2>
                    <form onSubmit={handleAddHoliday} className="space-y-3">
                        <input type="date" value={newHoliday.date} onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} className="w-full p-2 border rounded-lg" />
                        <input type="text" placeholder="Holiday Description" value={newHoliday.description} onChange={e => setNewHoliday({...newHoliday, description: e.target.value})} className="w-full p-2 border rounded-lg" />
                        <button type="submit" className="w-full bg-teal-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-700">
                            <Plus className="w-5 h-5" /> Add Holiday
                        </button>
                    </form>
                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Upcoming Holidays</h3>
                        <ul className="max-h-60 overflow-y-auto">
                            {holidays.map(holiday => (
                                <li key={holiday.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{holiday.description}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(holiday.holidayDate + 'T00:00:00').toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleDeleteHoliday(holiday.id)} className="text-red-500 hover:text-red-600 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance_Admin;