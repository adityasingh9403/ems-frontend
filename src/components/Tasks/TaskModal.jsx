import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { showToast } from '../../utils/uiHelpers';

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

const TaskModal = ({ isOpen, onClose, onSave, assignableUsers, approvedLeaves, editingTask }) => {
    const getInitialState = () => ({
        title: '', description: '', assignedToId: '', dueDate: '', priority: 'medium',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!editingTask;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({
                    title: editingTask.title, description: editingTask.description,
                    assignedToId: editingTask.assignedToId, dueDate: editingTask.dueDate,
                    priority: editingTask.priority,
                });
            } else {
                setFormData(getInitialState());
            }
            setErrors({});
            setIsSaving(false);
        }
    }, [isOpen, editingTask]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (!formData.assignedToId) newErrors.assignedToId = 'Please assign the task to an employee.';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast('Please fix the errors before submitting.', 'error');
            return;
        }

        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    const availableUsers = useMemo(() => {
        if (!formData.dueDate || !approvedLeaves) return assignableUsers;
        return assignableUsers.filter(user => {
            const isOnLeave = approvedLeaves.some(leave => 
                leave.requestorId === user.id &&
                formData.dueDate >= leave.startDate &&
                formData.dueDate <= leave.endDate
            );
            return !isOnLeave;
        });
    }, [formData.dueDate, assignableUsers, approvedLeaves]);

    if (!isOpen) return null;

    const inputClass = (hasError) => 
        `w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none ${hasError ? 'border-red-500' : ''}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <FormField id="title" label="Task Title" required error={errors.title}>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass(errors.title)} />
                    </FormField>
                    <FormField id="description" label="Description">
                        <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass()} rows="3"></textarea>
                    </FormField>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="assignedToId" label="Assign To" required error={errors.assignedToId}>
                            <select name="assignedToId" value={formData.assignedToId} onChange={handleChange} className={inputClass(errors.assignedToId)}>
                                <option value="">Select Employee...</option>
                                {availableUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField id="dueDate" label="Due Date" required error={errors.dueDate}>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClass(errors.dueDate)} />
                        </FormField>
                    </div>
                    <FormField id="priority" label="Priority">
                       <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass()}>
                           <option value="low">Low Priority</option>
                           <option value="medium">Medium Priority</option>
                           <option value="high">High Priority</option>
                       </select>
                    </FormField>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-60 w-32">
                            {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
