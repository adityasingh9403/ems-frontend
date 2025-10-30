import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SalaryStructureModal = ({ isOpen, onClose, employee, initialStructure, onSave }) => {
    // Safely set initial state, providing default values
    const [structure, setStructure] = useState({ 
        basic: initialStructure?.basic || 0, 
        hra: initialStructure?.hra || 0, 
        allowances: initialStructure?.allowances || 0, 
        pf: initialStructure?.pf || 0, 
        tax: initialStructure?.tax || 0 
    });
    const [grossSalary, setGrossSalary] = useState(0);
    const [isSaving, setIsSaving] = useState(false); // Add saving state

    useEffect(() => {
        if (isOpen && employee) {
            // Use optional chaining (?.) to prevent crashes if initialStructure is null
            setStructure({
                basic: initialStructure?.basic || 0,
                hra: initialStructure?.hra || 0,
                allowances: initialStructure?.allowances || 0,
                pf: initialStructure?.pf || 0,
                tax: initialStructure?.tax || 0,
            });
            setGrossSalary(initialStructure?.grossSalary || employee.salary || 0);
            setIsSaving(false); // Reset saving state when modal opens
        }
    }, [isOpen, employee, initialStructure]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStructure(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // The onSave function from the parent component handles the API call
        await onSave({ ...structure, employeeId: employee.id });
        setIsSaving(false);
    };

    if (!isOpen || !employee) return null;

    const totalEarnings = structure.basic + structure.hra + structure.allowances;
    const totalDeductions = structure.pf + structure.tax;
    const netSalary = totalEarnings - totalDeductions;

    // Reusable classes for input fields
    const inputClass = "w-full mt-1 p-2 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none";
    const labelClass = "text-sm text-slate-600 dark:text-slate-300";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Salary Structure for {employee.firstName}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><X /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Gross Salary (from Profile)</p>
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">${new Intl.NumberFormat().format(grossSalary)}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Earnings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className={labelClass}>Basic</label><input type="number" name="basic" value={structure.basic} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>HRA</label><input type="number" name="hra" value={structure.hra} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>Allowances</label><input type="number" name="allowances" value={structure.allowances} onChange={handleChange} className={inputClass} /></div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Deductions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Provident Fund (PF)</label><input type="number" name="pf" value={structure.pf} onChange={handleChange} className={inputClass} /></div>
                            <div><label className={labelClass}>Income Tax (TDS)</label><input type="number" name="tax" value={structure.tax} onChange={handleChange} className={inputClass} /></div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-right space-y-1 text-slate-700 dark:text-slate-300">
                        <p>Total Earnings: <span className="font-semibold">${totalEarnings.toFixed(2)}</span></p>
                        <p>Total Deductions: <span className="font-semibold">${totalDeductions.toFixed(2)}</span></p>
                        <p className="font-bold text-lg">Net Salary: <span className="text-teal-600 dark:text-teal-400">${netSalary.toFixed(2)}</span></p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 w-32">
                        {isSaving ? 'Saving...' : 'Save Structure'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryStructureModal;