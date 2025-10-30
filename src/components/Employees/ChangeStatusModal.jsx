import React, { useState } from 'react';
import { X } from 'lucide-react';

const ChangeStatusModal = ({ isOpen, onClose, employee, onSave }) => {
    // Component ke apne states jo form ke data ko manage karte hain
    const [status, setStatus] = useState('Resigned');
    const [lastDay, setLastDay] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');

    if (!isOpen || !employee) return null;

    const handleSave = () => {
        // Jab "Confirm Change" par click hota hai, to ye data parent component (EmployeeList.js) ko bhej deta hai.
        // Asli API call EmployeeList.js me hi hota hai.
        onSave(employee.id, status, lastDay, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Change Employment Status</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-slate-700 dark:text-slate-300">
                        Updating status for: <strong>{employee.firstName} {employee.lastName}</strong>
                    </p>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">New Status</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)} 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
                        >
                            <option>Resigned</option>
                            <option>Terminated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Last Working Day</label>
                        <input 
                            type="date" 
                            value={lastDay} 
                            onChange={e => setLastDay(e.target.value)} 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-200" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Reason/Notes (Optional)</label>
                        <textarea 
                            value={reason} 
                            onChange={e => setReason(e.target.value)} 
                            rows="3" 
                            placeholder="Reason for status change..."
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
                        ></textarea>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium">Confirm Change</button>
                </div>
            </div>
        </div>
    );
};

export default ChangeStatusModal;

