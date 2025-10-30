import React, { useState, useEffect } from 'react';
import { X, LifeBuoy, AlertTriangle } from 'lucide-react';
import { showToast } from '../../utils/uiHelpers';

// Reusable component for form fields
const FormField = ({ id, label, required, children, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label} {required && <span className="text-teal-600">*</span>}
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

const CreateTicketModal = ({ isOpen, onClose, onCreate }) => {
    const getInitialState = () => ({
        subject: '',
        category: 'General Query',
        description: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast('Please fill all required fields.', 'error');
            return;
        }
        setIsSubmitting(true);
        // The 'onCreate' prop is an async function from Helpdesk.js that calls the API
        await onCreate(formData);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;
    
    const inputClass = (hasError) => 
        `w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
            hasError ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'
        }`;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Helpdesk Ticket</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <FormField id="subject" label="Subject" required error={errors.subject}>
                            <input type="text" name="subject" value={formData.subject} onChange={handleChange} className={inputClass(errors.subject)} />
                        </FormField>
                        <FormField id="category" label="Category" required>
                            <select name="category" value={formData.category} onChange={handleChange} className={inputClass()}>
                                <option>General Query</option>
                                <option>Salary Issue</option>
                                <option>IT Support</option>
                                <option>Leave Policy</option>
                            </select>
                        </FormField>
                        <FormField id="description" label="Description" required error={errors.description}>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className={inputClass(errors.description)}></textarea>
                        </FormField>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 w-32">
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
