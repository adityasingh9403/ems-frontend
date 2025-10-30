import React, {useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGetCalendarEvents } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const CompanyCalendar = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
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

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await apiGetCalendarEvents();
                const eventsData = response.data?.$values || [];
                setEvents(eventsData);
            } catch (error) {
                showToast("Could not load calendar events.", "error");
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const EventBubble = ({ event }) => {
        const styles = {
            holiday: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
            birthday: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
            event: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
        };
        return (
            <div className={`text-xs p-1 rounded mt-1 truncate ${styles[event.type]}`}>
                {event.description}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Company Calendar</h1>
            </div>
            
            {loading ? <LoadingSpinner message="Loading calendar..." /> : (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <ChevronLeft className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <ChevronRight className="text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {days.map(day => <div key={day} className="font-bold text-slate-600 dark:text-slate-400 text-sm py-2">{day}</div>)}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const dayNumber = day + 1;
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                            const monthDayStr = dateStr.substring(5);
                            const dayEvents = events.filter(e => e.date === dateStr || (e.type === 'birthday' && e.date === monthDayStr));
                            
                            return (
                                <div key={dayNumber} className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 h-28 overflow-y-auto">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{dayNumber}</p>
                                    <div className="space-y-1">
                                        {dayEvents.map((e, i) => <EventBubble key={i} event={e} />)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyCalendar;