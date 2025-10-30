import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Upload, CameraOff, CheckCircle, Users, UserX, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showToast, getStatusBadge } from '../../utils/uiHelpers';
import AddEmployeeModal from './AddEmployeeModal';
import BulkImportModal from './BulkImportModal';
import ChangeStatusModal from './ChangeStatusModal';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import ChangeRoleModal from './ChangeRoleModal';
import {
    apiGetEmployees,
    apiAddEmployee,
    apiUpdateEmployee,
    apiUpdateEmployeeStatus,
    apiResetFace,
    apiDeleteEmployee,
    apiUpdateEmployeeRole,
    apiBulkImportEmployees
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const EmployeeList = () => {
    const { user } = useAuth();
    const [companyUsers, setCompanyUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filter, setFilter] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

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
        if (!loading) { // Only run after initial data has loaded
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await apiGetEmployees();
            const employeesData = response.data?.$values || [];
            setCompanyUsers(employeesData);
        } catch (error) {
            showToast("Could not fetch employee data.", "error");
            setCompanyUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // ... (rest of the handler functions like handleSaveEmployee, handleDeleteEmployee, etc. remain the same) ...
    // --- FIXED: Added the missing canPerformAction function back ---
    const canPerformAction = (targetEmployee, actionType) => {
        if (!user || !targetEmployee) return false;
        const currentUserRole = user.role;
        const targetUserRole = targetEmployee.role;

        switch (currentUserRole) {
            case 'admin':
                return true;
            case 'hr_manager':
                return targetUserRole === 'department_manager' || targetUserRole === 'employee';
            case 'department_manager':
                if (actionType === 'delete' || actionType === 'change_status' || actionType === 'reset_face') return false;
                return targetEmployee.departmentId === user.departmentId && targetUserRole === 'employee';
            default:
                return false;
        }
    };
    const handleSaveEmployee = async (employeeData) => {
        if (!selectedEmployee) { // YE ADD karne ka logic hai, isse na chedein
            try {
                await apiAddEmployee(employeeData);
                showToast('Employee added successfully!');
                fetchData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to add employee.', 'error');
            }
            handleCloseModals();
            return;
        }

        // EDIT karne ka naya aur aahi logic neeche hai
        try {
            const hasRoleChanged = employeeData.role !== selectedEmployee.role;

            // Step 1: Pehle profile details update karein
            const profileUpdatePayload = {
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                phone: employeeData.phone,
                dob: employeeData.dob || null,
                gender: employeeData.gender,
                maritalStatus: employeeData.maritalStatus,
                currentAddress: employeeData.currentAddress,
                permanentAddress: employeeData.permanentAddress,
                designation: employeeData.designation,
                departmentId: parseInt(employeeData.departmentId) || null,
                position: employeeData.position,
                salary: parseFloat(employeeData.salary) || null,
                joinDate: employeeData.joinDate || null,
                panNumber: employeeData.panNumber,
                bankAccountNumber: employeeData.bankAccountNumber,
                bankName: employeeData.bankName,
                ifscCode: employeeData.ifscCode,
                emergencyContactName: employeeData.emergencyContactName,
                emergencyContactRelation: employeeData.emergencyContactRelation,
            };

            await apiUpdateEmployee(selectedEmployee.id, profileUpdatePayload);

            // Step 2: Agar role change hua hai, to role update API call karein
            if (hasRoleChanged) {
                const roleUpdateResult = await handleChangeRole(selectedEmployee.id, employeeData.role);
                if (!roleUpdateResult.success) {
                    // Error toast handleChangeRole function mein hi dikh jayega
                    // Lekin profile update ho chuka hai, isliye list refresh karein
                    fetchData();
                    handleCloseModals();
                    return;
                }
            }

            showToast('Employee updated successfully!');
            fetchData(); // Sab kuch safal hone par data refresh karein
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save employee.', 'error');
        }
        handleCloseModals();
    };

    const handleBulkImport = async (importedEmployees) => {
        try {
            const response = await apiBulkImportEmployees(importedEmployees);
            showToast(response.data.message, 'success');
            if (response.data.skipped > 0) {
                showToast(`${response.data.skipped} records were skipped.`, 'warn');
            }
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Bulk import failed.', 'error');
        }
    };

    const handleChangeRole = async (employeeId, newRole) => {
        try {
            await apiUpdateEmployeeRole(employeeId, { role: newRole });
            showToast('Employee role updated successfully!');
            fetchData(); // Refresh the list to show the new role
            return { success: true };
        } catch (error) {
            // Backend se aaye error message ko toast mein dikhayein
            showToast(error.response?.data?.message || 'Failed to update role.', 'error');
            return { success: false };
        }
    };

    const handleChangeStatus = async (employeeId, status, lastDay, reason) => {
        try {
            await apiUpdateEmployeeStatus(employeeId, { status, lastDay, reason });
            showToast(`Employee status updated to ${status}.`, 'info');
            fetchData();
        } catch (error) {
            showToast('Failed to update employee status.', 'error');
        }
    };

    const handleResetFace = async (employeeId) => {
        if (window.confirm("Are you sure you want to reset this employee's face registration?")) {
            try {
                await apiResetFace(employeeId);
                showToast("Face registration has been reset.");
                fetchData();
            } catch (error) {
                showToast("Failed to reset face registration.", "error");
            }
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (window.confirm('Are you sure you want to PERMANENTLY DELETE this employee? This action cannot be undone.')) {
            try {
                await apiDeleteEmployee(employeeId);
                showToast('Employee has been permanently deleted.', 'warn');
                fetchData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete employee.', 'error');
            }
        }
    };

    const handleOpenModal = (employee = null) => {
        setSelectedEmployee(employee);
        setIsAddEditModalOpen(true);
    };

    const handleOpenStatusModal = (employee) => {
        setSelectedEmployee(employee);
        setIsStatusModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsAddEditModalOpen(false);
        setIsBulkImportModalOpen(false);
        setIsStatusModalOpen(false);
        setIsRoleModalOpen(false);
        setSelectedEmployee(null);
    };

    const filteredEmployees = companyUsers.filter(employee => {
        const isActive = employee.employmentStatus === 'active';
        const matchesFilter = filter === 'active' ? isActive : !isActive;

        if (!searchTerm) return matchesFilter;

        const searchTermLower = searchTerm.toLowerCase();
        const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTermLower) || (employee.email?.toLowerCase() || '').includes(searchTermLower);

        return matchesFilter && matchesSearch;
    });
    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="flex flex-wrap justify-between items-center gap-4 fade-in-section">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Employees</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage employees in your organization.</p>
                </div>
                {(user.role === 'admin' || user.role === 'hr_manager') && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsBulkImportModalOpen(true)} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>Bulk Import</span>
                        </button>
                        <button onClick={() => handleOpenModal()} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Employee</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 items-center fade-in-section">
                <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg" />
                </div>
                <div className="flex gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg w-fit">
                    <button onClick={() => setFilter('active')} className={`px-4 py-1 text-sm rounded-md ${filter === 'active' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Active</button>
                    <button onClick={() => setFilter('inactive')} className={`px-4 py-1 text-sm rounded-md ${filter === 'inactive' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Inactive</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden fade-in-section">
                {loading ? <LoadingSpinner message="Fetching employees..." /> : filteredEmployees.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee</th>
                                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Designation</th>
                                    {user.role === 'admin' && <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Face Status</th>}
                                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="px-6 py-4">
                                            <Link to={`/employees/${employee.id}`} className="font-medium text-slate-900 dark:text-white hover:underline">{employee.firstName} {employee.lastName}</Link>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{employee.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{employee.designation}</td>
                                        {user.role === 'admin' && (
                                            <td className="px-6 py-4 text-center">
                                                {employee.faceRegistered ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                                        <CheckCircle className="w-3 h-3" /> Registered
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full text-xs font-medium">
                                                        Not Registered
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                {canPerformAction(employee, 'reset_face') && employee.faceRegistered && (
                                                    <button onClick={() => handleResetFace(employee.id)} className="p-2 text-slate-400 hover:text-yellow-500 rounded-full" title="Reset Face">
                                                        <CameraOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canPerformAction(employee, 'edit') && (
                                                    <button onClick={() => handleOpenModal(employee)} className="p-2 text-slate-400 hover:text-green-500 rounded-full" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canPerformAction(employee, 'change_status') && filter === 'active' && (
                                                    <button onClick={() => handleOpenStatusModal(employee)} className="p-2 text-slate-400 hover:text-red-500 rounded-full" title="Change Status">
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canPerformAction(employee, 'delete') && filter === 'inactive' && (
                                                    <button onClick={() => handleDeleteEmployee(employee.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full" title="Delete Permanently">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={Users}
                        title={`No ${filter} Employees Found`}
                        message={searchTerm ? `No results found for "${searchTerm}".` : "There are no employees matching the current filter."}
                    />
                )}
            </div>

            <AddEmployeeModal isOpen={isAddEditModalOpen} onClose={handleCloseModals} onSave={handleSaveEmployee} employeeToEdit={selectedEmployee} currentUser={user} />
            <BulkImportModal isOpen={isBulkImportModalOpen} onClose={() => setIsBulkImportModalOpen(false)} onImport={handleBulkImport} />
            <ChangeStatusModal isOpen={isStatusModalOpen} onClose={handleCloseModals} employee={selectedEmployee} onSave={handleChangeStatus} />
            <ChangeRoleModal
                isOpen={isRoleModalOpen}
                onClose={handleCloseModals}
                employee={selectedEmployee}
                onSave={handleChangeRole}
            />
        </div>
    );
};

export default EmployeeList;