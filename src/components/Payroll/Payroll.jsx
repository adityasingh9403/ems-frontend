import React, { useState, useEffect, useCallback } from 'react';
import { Download, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SalaryStructureModal from './SalaryStructureModal';
import PayslipModal from './PayslipModal';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { apiGetEmployees, apiGetDepartments, apiGetSalaryStructure, apiSaveSalaryStructure } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const Payroll = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [currentSalaryStructure, setCurrentSalaryStructure] = useState(null);
    const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    // Animation logic
    const [observer, setElements, entries] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px' });
    useEffect(() => { entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')) }, [entries, observer]);
    useEffect(() => { if (!loading) setElements(document.querySelectorAll('.fade-in-section')) }, [setElements, loading]);

    // --- FIX #1: fetchData function moved out of useEffect and wrapped in useCallback ---
    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [employeesRes, departmentsRes] = await Promise.all([apiGetEmployees(), apiGetDepartments()]);

            // Robust data handling for both .$values and clean arrays
            const employeesData = employeesRes.data?.$values || (Array.isArray(employeesRes.data) ? employeesRes.data : []);
            const departmentsData = departmentsRes.data?.$values || (Array.isArray(departmentsRes.data) ? departmentsRes.data : []);

            const usersWithDept = employeesData.map(u => ({
                ...u,
                departmentName: departmentsData.find(d => d.id === u.departmentId)?.name || 'N/A'
            }));
            setEmployees(usersWithDept);

        } catch (error) {
            showToast("Failed to fetch employee data.", "error");
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // useEffect now correctly uses the memoized fetchData function
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenStructureModal = async (employee) => {
        setSelectedEmployee(employee);
        try {
            const res = await apiGetSalaryStructure(employee.id);
            setCurrentSalaryStructure(res.data);
            setIsStructureModalOpen(true);
        } catch (error) {
            showToast("Could not fetch salary structure.", "error");
        }
    };

    // --- FIX #2: handleSaveStructure updated to prevent double toasts ---
    const handleSaveStructure = async (structureData) => {
        let success = false;
        try {
            await apiSaveSalaryStructure(structureData);
            showToast("Salary structure saved successfully!");
            success = true;
        } catch (error) {
            showToast("Failed to save salary structure.", "error");
        }

        if (success) {
            fetchData();
        }
        setIsStructureModalOpen(false);
    };

    const handleOpenPayslipModal = async (employee) => {
        setSelectedEmployee(employee);
        try {
            const res = await apiGetSalaryStructure(employee.id);
            setCurrentSalaryStructure(res.data);
            setIsPayslipModalOpen(true);
        } catch (error) {
            showToast("Could not fetch salary structure for payslip.", "error");
        }
    };

    if (user.role !== 'admin' && user.role !== 'hr_manager') {
        return <div className="p-6">You do not have permission to view this page.</div>;
    }

    return (
        <>
            <SalaryStructureModal
                isOpen={isStructureModalOpen}
                onClose={() => setIsStructureModalOpen(false)}
                employee={selectedEmployee}
                initialStructure={currentSalaryStructure}
                onSave={handleSaveStructure}
            />
            <PayslipModal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                employee={selectedEmployee}
                salaryStructure={currentSalaryStructure}
            />

            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="fade-in-section">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Payroll Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Process salaries and generate payslips for employees.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden fade-in-section">
                    {loading ? <LoadingSpinner /> : (
                        <div className="overflow-x-auto">
                            {employees.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Gross Salary</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {employees.map(emp => (
                                            <tr key={emp.id}>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{emp.departmentName}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">${new Intl.NumberFormat().format(emp.salary || 0)}</td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <button onClick={() => handleOpenStructureModal(emp)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold inline-flex items-center gap-1">
                                                        <Edit className="w-4 h-4" />Salary Structure
                                                    </button>
                                                    <button onClick={() => handleOpenPayslipModal(emp)} className="text-green-600 dark:text-green-400 hover:underline text-xs font-semibold inline-flex items-center gap-1">
                                                        <Download className="w-4 h-4" />Generate Payslip
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyState title="No Employees Found" message="Add employees to manage their payroll." />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Payroll;