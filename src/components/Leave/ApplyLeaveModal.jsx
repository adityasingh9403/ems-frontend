import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';

// Reusable component for form fields to keep code clean
const FormField = ({ id, label, required, children, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label} {required && <span className="text-teal-600 dark:text-teal-500">*</span>}
        </label>
        {children}
        {error && (
            <p className="text-red-600 text-xs mt-1.5 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {error}
            </p>
        )}
    </div>
);

const ApplyLeaveModal = ({ isOpen, onClose, onSave }) => {
    
    const getInitialState = () => ({
        leaveType: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form state whenever the modal is opened
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setErrors({});
            setIsSaving(false);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error message when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.endDate < formData.startDate) newErrors.endDate = 'End date cannot be before start date';
        if (!formData.reason.trim()) newErrors.reason = 'A reason for the leave is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        // The onSave function is passed from the parent component (e.g., LeaveManagement_Employee)
        // and it will handle the actual API call.
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    const inputClass = (hasError) => 
        `w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
            hasError ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'
        }`;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 bg-teal-100 dark:bg-teal-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Apply for Leave</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit your leave request for approval.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <FormField id="leaveType" label="Leave Type" required error={errors.leaveType}>
                        <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} className={inputClass(errors.leaveType)}>
                            <option>Annual Leave</option>
                            <option>Sick Leave</option>
                            <option>Unpaid Leave</option>
                            <option>Maternity Leave</option>
                            <option>Paternity Leave</option>
                        </select>
                    </FormField>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField id="startDate" label="Start Date" required error={errors.startDate}>
                            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass(errors.startDate)} />
                        </FormField>
                        <FormField id="endDate" label="End Date" required error={errors.endDate}>
                            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass(errors.endDate)} />
                        </FormField>
                    </div>

                    <FormField id="reason" label="Reason for Leave" required error={errors.reason}>
                        <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows={4} className={inputClass(errors.reason)} placeholder="Please provide a brief reason for your leave..." />
                    </FormField>
                </form>

                <div className="flex justify-end items-center space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-transparent rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-60 w-36">
                        {isSaving ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyLeaveModal;
