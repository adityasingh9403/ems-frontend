import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import {
    apiGetOfficeTimings,
    apiSaveOfficeTimings,
    apiGetDesignations,
    apiAddDesignation,
    apiDeleteDesignation,
    apiGetHolidays,
    apiAddHoliday,
    apiDeleteHoliday
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Settings = () => {
    const { user } = useAuth();
    const [officeTimings, setOfficeTimings] = useState({ startTime: '09:30', endTime: '18:30' });
    const [designations, setDesignations] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [newDesignation, setNewDesignation] = useState({ title: '', mapsToRole: 'employee' });
    const [newHoliday, setNewHoliday] = useState({ holidayDate: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
        if (!loading) {
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [timingsRes, designationsRes, holidaysRes] = await Promise.all([
                apiGetOfficeTimings(),
                apiGetDesignations(),
                apiGetHolidays()
            ]);
            
            setOfficeTimings(timingsRes.data || { startTime: '09:30', endTime: '18:30' });
            const designationsData = designationsRes.data?.$values || [];
            const holidaysData = holidaysRes.data?.$values || [];
            setDesignations(designationsData);
            setHolidays(holidaysData.sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate)));

        } catch (error) {
            showToast("Failed to load settings data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleTimingsChange = (e) => {
        setOfficeTimings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveTimings = async () => {
        setIsSaving(true);
        try {
            await apiSaveOfficeTimings(officeTimings);
            showToast('Office timings saved successfully!');
        } catch (error) {
            showToast('Failed to save office timings.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddDesignation = async (e) => {
        e.preventDefault();
        if (!newDesignation.title.trim()) return showToast('Designation title cannot be empty.', 'error');
        try {
            await apiAddDesignation(newDesignation);
            showToast('Designation added successfully!');
            setNewDesignation({ title: '', mapsToRole: 'employee' });
            fetchData(); // Refresh data from server
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add designation.', 'error');
        }
    };

    const handleDeleteDesignation = async (id) => {
        if (window.confirm('Are you sure? This might affect employee profiles.')) {
            try {
                await apiDeleteDesignation(id);
                showToast('Designation deleted.', 'info');
                fetchData(); // Refresh data from server
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete designation.', 'error');
            }
        }
    };

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        if (!newHoliday.holidayDate || !newHoliday.description) return showToast('Please fill out both fields for the holiday.', 'error');
        try {
            await apiAddHoliday(newHoliday);
            showToast('Holiday added successfully!');
            setNewHoliday({ holidayDate: '', description: '' });
            fetchData(); // Refresh data from server
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add holiday.', 'error');
        }
    };

    const handleDeleteHoliday = async (id) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                await apiDeleteHoliday(id);
                showToast('Holiday deleted.', 'info');
                fetchData(); // Refresh data from server
            } catch (error) {
                showToast('Failed to delete holiday.', 'error');
            }
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="flex items-center space-x-3 fade-in-section">
                <SettingsIcon className="w-8 h-8 text-teal-500" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">System Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage company-wide settings.</p>
                </div>
            </div>

            {loading ? <LoadingSpinner message="Loading settings..." /> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Office Timings Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 fade-in-section">
                        <h2 className="text-xl font-semibold mb-6">Office Timings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium mb-2">Office Start Time</label>
                                <input type="time" id="startTime" name="startTime" value={officeTimings.startTime} onChange={handleTimingsChange} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium mb-2">Office End Time</label>
                                <input type="time" id="endTime" name="endTime" value={officeTimings.endTime} onChange={handleTimingsChange} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                            </div>
                        </div>
                        <div className="mt-8">
                            <button onClick={handleSaveTimings} disabled={isSaving} className="bg-teal-600 text-white px-5 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 hover:bg-teal-700">
                                <Save className="w-5 h-5" />
                                <span>{isSaving ? 'Saving...' : 'Save Timings'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Designations Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 fade-in-section">
                        <h2 className="text-xl font-semibold mb-4">Manage Designations</h2>
                        <ul className="space-y-2 max-h-48 overflow-y-auto mb-4 border rounded-md p-2 border-slate-200 dark:border-slate-700">
                            {designations.map(d => (
                                <li key={d.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md">
                                    <div>
                                        <p className="font-medium">{d.title}</p>
                                        <p className="text-xs text-slate-500 capitalize">{d.mapsToRole.replace('_', ' ')}</p>
                                    </div>
                                    <button onClick={() => handleDeleteDesignation(d.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleAddDesignation} className="flex gap-2 border-t pt-4 border-slate-200 dark:border-slate-700">
                            <input value={newDesignation.title} onChange={e => setNewDesignation({...newDesignation, title: e.target.value})} placeholder="New Designation Title" className="flex-grow p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                            <select value={newDesignation.mapsToRole} onChange={e => setNewDesignation({...newDesignation, mapsToRole: e.target.value})} className="p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                <option value="employee">Employee</option>
                                <option value="department_manager">Manager</option>
                                <option value="hr_manager">HR</option>
                            </select>
                            <button type="submit" className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600"><Plus /></button>
                        </form>
                    </div>
                    
                    {/* Holidays Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 lg:col-span-2 fade-in-section">
                        <h2 className="text-xl font-semibold mb-4">Manage Holidays</h2>
                        <ul className="space-y-2 max-h-60 overflow-y-auto mb-4 border rounded-md p-2 border-slate-200 dark:border-slate-700">
                            {holidays.map(h => (
                                <li key={h.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md">
                                    <p><span className="font-medium">{h.description}</span> - {new Date(h.holidayDate + 'T00:00:00Z').toLocaleDateString()}</p>
                                    <button onClick={() => handleDeleteHoliday(h.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleAddHoliday} className="flex flex-col sm:flex-row gap-2 border-t pt-4 border-slate-200 dark:border-slate-700">
                            <input type="date" value={newHoliday.holidayDate} onChange={e => setNewHoliday({...newHoliday, holidayDate: e.target.value})} className="p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                            <input value={newHoliday.description} onChange={e => setNewHoliday({...newHoliday, description: e.target.value})} placeholder="Holiday Description" className="flex-grow p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                            <button type="submit" className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 flex justify-center items-center"><Plus /></button>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Settings;