import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

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

const AddDepartmentModal = ({ isOpen, onClose, onSave, editingDepartment, availableManagers }) => {
    
    const getInitialState = () => ({
        name: '',
        description: '',
        managerId: 0, // Default to 0 for "No Manager"
        isActive: true
    });
    
    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!editingDepartment;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({ 
                    name: editingDepartment.name || '',
                    description: editingDepartment.description || '',
                    managerId: editingDepartment.managerId || 0,
                    isActive: editingDepartment.isActive
                });
            } else {
                setFormData(getInitialState());
            }
            setErrors({});
            setIsSaving(false);
        }
    }, [isOpen, editingDepartment]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // --- FIX: Ensure managerId is always a number ---
        let processedValue = value;
        if (name === 'managerId') {
            processedValue = parseInt(value, 10) || 0;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : processedValue
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Department name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    const inputClass = (hasError) => 
        `w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
            hasError ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'
        }`;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                   <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                       {isEditMode ? 'Edit Department' : 'Add New Department'}
                   </h2>
                   <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full">
                       <X className="w-6 h-6" />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <FormField id="name" label="Department Name" required error={errors.name}>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass(errors.name)} placeholder="e.g., Marketing" />
                    </FormField>

                    <FormField id="description" label="Description" error={errors.description}>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass(errors.description)} placeholder="Describe the department's purpose..." />
                    </FormField>

                    <FormField id="managerId" label="Department Manager" error={errors.managerId}>
                        {/* --- FIX: Use 0 for 'No Manager' and ensure value is a number --- */}
                        <select id="managerId" name="managerId" value={formData.managerId || 0} onChange={handleChange} className={inputClass(errors.managerId)}>
                            <option value={0}>No Manager Assigned</option>
                            {availableManagers && availableManagers.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    
                    <div className="flex items-center">
                        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                            Department is Active
                        </label>
                    </div>
                </form>

                <div className="flex justify-end items-center space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-60 w-40">
                        {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Department')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddDepartmentModal;