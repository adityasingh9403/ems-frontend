import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Square, Plus, Trash2, ClipboardCheck, Save } from 'lucide-react';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import {
    apiGetEmployees,
    apiGetOnboardingChecklist,
    apiUpdateOnboardingChecklist
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

// Main component that handles both Admin and Employee views
const Onboarding = () => {
    const { user } = useAuth();
    const isManagerView = user && (user.role === 'admin' || user.role === 'hr_manager');
    
    // States for both views
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(true);

    // States specific to Admin/HR view
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [initialChecklist, setInitialChecklist] = useState([]);
    const [newItemText, setNewItemText] = useState('');

    // --- Animation Logic ---
    const [observer, setElements, entries] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px' });
    useEffect(() => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, [entries, observer]);
    useEffect(() => {
        if (!loading) setElements(document.querySelectorAll('.fade-in-section'));
    }, [setElements, loading, selectedEmployeeId]);

    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                if (isManagerView) {
                    const response = await apiGetEmployees();
                    const employeesData = response.data?.$values || (Array.isArray(response.data) ? response.data : []);
                    setEmployees(employeesData);
                } else { // Employee or Dept Manager view
                    const response = await apiGetOnboardingChecklist(user.id);
                    const checklistData = response.data?.$values || (Array.isArray(response.data) ? response.data : []);
                    setChecklist(checklistData);
                }
            } catch (error) {
                showToast(isManagerView ? "Could not fetch employees." : "Could not fetch your checklist.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user, isManagerView]);

    // Fetch checklist when an admin selects an employee
    useEffect(() => {
        if (isManagerView && selectedEmployeeId) {
            const fetchChecklistForEmployee = async () => {
                setLoading(true);
                try {
                    const response = await apiGetOnboardingChecklist(selectedEmployeeId);
                    const data = response.data?.$values || (Array.isArray(response.data) ? response.data : []);
                    setChecklist(data);
                    setInitialChecklist(JSON.parse(JSON.stringify(data)));
                } catch {
                    showToast("Could not fetch checklist.", "error");
                } finally {
                    setLoading(false);
                }
            };
            fetchChecklistForEmployee();
        } else if (isManagerView) {
            setChecklist([]);
            setInitialChecklist([]);
        }
    }, [selectedEmployeeId, isManagerView]);
    
    // --- Handler Functions for Admin/HR ---
    const handleToggleItem = (index) => {
        const updatedList = [...checklist];
        updatedList[index].completed = !updatedList[index].completed;
        setChecklist(updatedList);
    };

    const handleAddItem = () => {
        if (newItemText.trim()) {
            setChecklist([...checklist, { text: newItemText, completed: false }]);
            setNewItemText('');
        }
    };

    const handleDeleteItem = (indexToDelete) => {
        setChecklist(checklist.filter((_, index) => index !== indexToDelete));
    };

    const handleSaveChanges = async () => {
        try {
            await apiUpdateOnboardingChecklist({
                employeeId: parseInt(selectedEmployeeId),
                tasks: checklist
            });
            showToast("Checklist saved successfully!");
            setInitialChecklist(JSON.parse(JSON.stringify(checklist)));
        } catch {
            showToast("Failed to save checklist.", "error");
        }
    };
    
    const hasChanges = JSON.stringify(checklist) !== JSON.stringify(initialChecklist);

    // --- Render Logic ---
    const renderAdminView = () => (
        <>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto fade-in-section">
                <label className="font-medium text-slate-700 dark:text-slate-200">Select Employee:</label>
                {loading && !employees.length ? <LoadingSpinner /> : (
                    <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full p-2 border rounded mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                        <option value="">-- Select an Employee --</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                )}
            </div>
            {selectedEmployeeId && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto mt-6 fade-in-section">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Checklist</h2>
                        {hasChanges && (
                            <button onClick={handleSaveChanges} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-teal-700">
                                <Save size={16} /> Save Changes
                            </button>
                        )}
                    </div>
                    {loading ? <LoadingSpinner message="Loading checklist..." /> : (
                        <>
                            {checklist.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                    {checklist.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <button onClick={() => handleToggleItem(i)}>{item.completed ? <CheckSquare className="text-green-500" /> : <Square className="text-slate-400" />}</button>
                                            <span className={`flex-grow ${item.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.text}</span>
                                            <button onClick={() => handleDeleteItem(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="mt-4"><EmptyState icon={ClipboardCheck} title="No Checklist Found" message="Start by adding the first item below." /></div>)}
                            <div className="mt-4 flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                                <input value={newItemText} onChange={e => setNewItemText(e.target.value)} className="flex-grow p-2 border rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" placeholder="New checklist item..." />
                                <button onClick={handleAddItem} className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600"><Plus /></button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );

    const renderEmployeeView = () => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto fade-in-section">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">My Onboarding Checklist</h2>
            {loading ? <LoadingSpinner message="Loading your checklist..." /> : (
                checklist.length > 0 ? (
                    <div className="mt-4 space-y-3">
                        {checklist.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-md">
                                {item.completed ? <CheckSquare className="text-green-500" /> : <Square className="text-slate-400" />}
                                <span className={`flex-grow ${item.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                ) : (<div className="mt-4"><EmptyState icon={ClipboardCheck} title="No Checklist Assigned" message="Your manager has not assigned an onboarding checklist to you yet." /></div>)
            )}
        </div>
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen space-y-6">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Onboarding Checklist</h1>
            </div>
            {isManagerView ? renderAdminView() : renderEmployeeView()}
        </div>
    );
};

export default Onboarding;