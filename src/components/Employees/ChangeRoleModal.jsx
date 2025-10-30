import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

const ChangeRoleModal = ({ isOpen, onClose, employee, onSave }) => {
    // State to hold the selected new role
    const [newRole, setNewRole] = useState('');
    // State to disable the save button during API call
    const [isSaving, setIsSaving] = useState(false);

    // When the modal opens or the selected employee changes, update the initial role state
    useEffect(() => {
        if (employee) {
            setNewRole(employee.role || 'employee');
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Call the onSave function passed from the parent (EmployeeList.js).
            // This parent function will now handle the API call.
            // It will return a result object like { success: true } or { success: false, message: 'Error' }
            const result = await onSave(employee.id, newRole);

            if (result.success) {
                onClose(); // Close the modal only if the API call was successful.
            }
            // If the API call fails, the onSave function in the parent component
            // will show an error toast. The modal will stay open for the user to try again.
        } finally {
            setIsSaving(false); // Re-enable the save button after the API call finishes.
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Role for {employee.firstName}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {/* The error message div has been removed, as errors will now be shown as toasts. */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select New Role
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                id="role"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="employee">Employee</option>
                                <option value="department_manager">Department Manager</option>
                                <option value="hr_manager">HR Manager</option>
                                {/* Admin role can only be assigned by Super Admin, so it's not here */}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving} // Disable button when saving
                        className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed w-28"
                    >
                        {isSaving ? 'Saving...' : 'Save Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeRoleModal;