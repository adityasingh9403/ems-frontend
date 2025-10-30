import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import AddDepartmentModal from './AddDepartmentModal';
import DepartmentEmployeesModal from './DepartmentEmployeesModal';
import {
    apiGetDepartments,
    apiAddDepartment,
    apiUpdateDepartment,
    apiDeleteDepartment,
    apiGetEmployees
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const DepartmentList = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [viewingDepartment, setViewingDepartment] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ANIMATION LOGIC ---
    const [observer, setElements, entries] = useIntersectionObserver({
        threshold: 0.1, // Animate when 10% of the item is visible
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
        // Find elements to animate after the data has loaded
        if (!loading) {
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [deptsRes, empsRes] = await Promise.all([
                apiGetDepartments(),
                apiGetEmployees()
            ]);

            const departmentsData = deptsRes.data?.$values || [];
            const employeesData = empsRes.data?.$values || [];

            setDepartments(departmentsData);
            setEmployees(employeesData);
        } catch (error) {
            showToast("Could not fetch data from server.", "error");
            setDepartments([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveDepartment = async (departmentData) => {
        try {
            if (editingDepartment) {
                await apiUpdateDepartment(editingDepartment.id, departmentData);
                showToast('Department updated successfully!');
            } else {
                await apiAddDepartment(departmentData);
                showToast('Department added successfully!');
            }

            // --- ADD THIS LINE ---
            // This will refresh the list from the server after saving.
            fetchData();

        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save department.', 'error');
        }
        setShowAddEditModal(false);
        setEditingDepartment(null);
    };

    const handleDeleteDepartment = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await apiDeleteDepartment(id);
                showToast('Department deleted.', 'info');
                fetchData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete department.', 'error');
            }
        }
    };

    const handleOpenEditModal = (department) => {
        setEditingDepartment(department);
        setShowAddEditModal(true);
    };

    const handleOpenAddModal = () => {
        setEditingDepartment(null);
        setShowAddEditModal(true);
    };

    const handleOpenViewModal = (department) => {
        setViewingDepartment(department);
        setShowViewModal(true);
    };

    const filteredDepartments = departments.filter(department =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getManagerName = (managerId) => {
        if (!managerId) return 'N/A';
        const manager = employees.find(emp => emp.id === managerId);
        return manager ? `${manager.firstName} ${manager.lastName}` : 'Unassigned';
    };

    const availableManagers = employees.filter(emp => emp.role === 'department_manager' || emp.role === 'hr_manager' || emp.role === 'admin');

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Departments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your organization's departments.</p>
                </div>
                <button onClick={handleOpenAddModal} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 shadow-sm">
                    <Plus className="w-5 h-5" />
                    <span>Add Department</span>
                </button>
            </div>
            <div className="relative fade-in-section">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search for a department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition" />
            </div>

            {loading ? (
                <LoadingSpinner message="Loading departments..." />
            ) : filteredDepartments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-section">
                    {filteredDepartments.map((department) => {
                        const employeeCount = employees.filter(e => e.departmentId === department.id).length;
                        const managerName = getManagerName(department.managerId);
                        return (
                            <div key={department.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col transition-shadow hover:shadow-lg border-t-4 ${department.isActive ? 'border-t-teal-500' : 'border-t-slate-400'}`}>
                                <div className="p-6 cursor-pointer flex-grow" onClick={() => handleOpenViewModal(department)}>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{department.name}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm my-2 h-12 overflow-hidden">{department.description}</p>
                                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Users className="w-4 h-4" />
                                        <span>{employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}</span>
                                    </div>
                                </div>
                                <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="font-medium text-slate-600 dark:text-slate-300">Manager:</span>
                                        <span className="text-slate-500 dark:text-slate-400"> {managerName}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button onClick={() => handleOpenEditModal(department)} className="p-2 text-slate-400 hover:text-green-500 dark:hover:text-green-400 rounded-full" title="Edit Department"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteDepartment(department.id)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full" title="Delete Department"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="fade-in-section">
                    <EmptyState
                        icon={Building2}
                        title="No Departments Found"
                        message="You can add a new department using the button above."
                    />
                </div>
            )}

            <AddDepartmentModal isOpen={showAddEditModal} onClose={() => setShowAddEditModal(false)} onSave={handleSaveDepartment} editingDepartment={editingDepartment} availableManagers={availableManagers} />
            {viewingDepartment && <DepartmentEmployeesModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} departmentName={viewingDepartment.name} employees={employees.filter(e => e.departmentId === viewingDepartment.id)} />}
        </div>
    );
};

export default DepartmentList;