import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import { apiGetDepartments, apiGetDesignations } from '../../apiService';
import LoadingSpinner from '../Common/LoadingSpinner';

const AddEmployeeModal = ({ isOpen, onClose, onSave, employeeToEdit, currentUser }) => {
    const { user } = useAuth();

    const getInitialState = () => ({
        firstName: '', lastName: '', email: '', phone: '', dob: '', gender: 'Male', maritalStatus: 'Single',
        currentAddress: '', permanentAddress: '', emergencyContactName: '', emergencyContactRelation: '',
        password: '', designation: '', departmentId: '', role: '', salary: '',
        joinDate: new Date().toISOString().split('T')[0],
        bankAccountNumber: '', bankName: '', ifscCode: '', panNumber: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({});
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = !!employeeToEdit;

    useEffect(() => {
        if (isOpen) {
            // AddEmployeeModal.jsx -> useEffect hook ke andar

            const loadDropdownData = async () => {
                setIsLoading(true);
                try {
                    const [deptsResponse, desigsResponse] = await Promise.all([
                        apiGetDepartments(),
                        apiGetDesignations()
                    ]);

                    // --- FIX 1: Data ko .$values se nikalein ---
                    const departmentsData = deptsResponse.data?.$values || [];
                    const designationsData = desigsResponse.data?.$values || [];

                    setDepartments(departmentsData);
                    setDesignations(designationsData);

                } catch (error) {
                    showToast("Could not load form data.", "error");
                    setDepartments([]);
                    setDesignations([]);
                } finally {
                    setIsLoading(false);
                }
            };

            loadDropdownData();

            if (isEditMode) {
                setFormData({ ...getInitialState(), ...employeeToEdit, password: '' });
            } else {
                setFormData(getInitialState());
            }
            setErrors({});
        }
    }, [isOpen, employeeToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        // Automatically set the role based on the selected designation
        if (name === 'designation') {
            const selectedDesignation = designations.find(d => d.title === value);
            if (selectedDesignation) {
                newFormData.role = selectedDesignation.mapsToRole;
            }
        }

        setFormData(newFormData);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // AddEmployeeModal.jsx

    const handleSubmit = (e) => {
        e.preventDefault();

        // --- FIX 2: Bhejne se pehle data ko aahi karein ---
        const dataToSend = { ...formData };

        // Agar department select nahi kiya hai, toh uski ID null bhejein
        if (!dataToSend.departmentId || dataToSend.departmentId === '') {
            dataToSend.departmentId = null;
        }

        // Ab aahi data ko save karne ke liye bhejein
        onSave(dataToSend);
    };

    const canChangeRole = currentUser.role === 'admin' || (currentUser.role === 'hr_manager' && employeeToEdit?.id !== currentUser.id);
    const canChangeDepartment = currentUser.role === 'admin' || (currentUser.role === 'hr_manager');
    const canEditSensitive = currentUser.role === 'admin' || currentUser.role === 'hr_manager';

    if (!isOpen) return null;

    const inputClass = (hasError) =>
        `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:cursor-not-allowed ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-6 text-center flex-grow flex items-center justify-center">
                        <LoadingSpinner message="Loading form data..." />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">

                        {/* Personal Details Section Start */}
                        <h3 className="text-lg font-semibold border-b pb-2 text-slate-800 dark:text-slate-100">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First Row */}
                            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name *" className={inputClass(errors.firstName)} required />
                            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name *" className={inputClass(errors.lastName)} required />

                            {/* Second Row */}
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address *" className={`${inputClass(errors.email)} md:col-span-2`} disabled={isEditMode} required />

                            {/* Third Row */}
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className={inputClass(errors.phone)} />
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass(errors.dob)} />

                            {/* Fourth Row */}
                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass()}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClass()}>
                                <option>Single</option>
                                <option>Married</option>
                                <option>Other</option>
                            </select>

                            {/* Address Rows */}
                            <div className="md:col-span-2">
                                <input name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Current Address" className={inputClass(errors.currentAddress)} />
                            </div>
                        </div>
                        {/* Personal Details Section End */}

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-slate-800 dark:text-slate-100">Professional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <select name="designation" value={formData.designation} onChange={handleChange} className={inputClass(errors.designation)} disabled={!canChangeRole} required>
                                <option value="">Select Designation *</option>
                                {designations.map(d => (
                                    <option key={d.id} value={d.title}>{d.title}</option>
                                ))}
                            </select>
                            <select name="departmentId" value={formData.departmentId || ''} onChange={handleChange} className={inputClass(errors.departmentId)} disabled={!canChangeDepartment} required>
                                <option value="">Select Department *</option>
                                {departments.filter(dept => dept.isActive).map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                            </select>
                            <input type="number" name="salary" value={formData.salary} min="0" onChange={handleChange} placeholder="Gross Salary" className={inputClass(errors.salary)} disabled={!canEditSensitive} />
                            <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className={inputClass()} disabled={!canEditSensitive} />
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-slate-800 dark:text-slate-100">Financial & Emergency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number" className={inputClass()} disabled={!canEditSensitive} />
                            <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="Bank Account Number" className={inputClass()} disabled={!canEditSensitive} />
                            <input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank Name" className={inputClass()} disabled={!canEditSensitive} />
                            <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="IFSC Code" className={inputClass()} disabled={!canEditSensitive} />
                            <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Emergency Contact Name" className={inputClass()} />
                            <input name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} placeholder="Relation" className={inputClass()} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {isEditMode ? 'New Password (Leave blank to keep unchanged)' : 'Password *'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass(errors.password)}
                                disabled={!canEditSensitive && isEditMode}
                                placeholder={!canEditSensitive && isEditMode ? "Permission denied" : "Enter password"}
                                required={!isEditMode}
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg">
                                {isEditMode ? 'Save Changes' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddEmployeeModal;