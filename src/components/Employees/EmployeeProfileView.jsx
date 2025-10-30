import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, Clock, Briefcase, Mail, Phone, ArrowLeft, Building2, Shield } from 'lucide-react';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { apiGetEmployees, apiGetDepartments, apiGetMyAttendance, apiGetLeaveRequests, apiGetTasks } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

// Reusable card component for the profile view
const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Icon size={18} className="text-teal-500" /> {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const EmployeeProfileView = () => {
    const { employeeId } = useParams();
    const [employee, setEmployee] = useState(null);
    const [department, setDepartment] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (!loading) {
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel
                const [employeesRes, departmentsRes, attendanceRes, leavesRes, tasksRes] = await Promise.all([
                    apiGetEmployees(),
                    apiGetDepartments(),
                    apiGetMyAttendance(),
                    apiGetLeaveRequests(),
                    apiGetTasks()
                ]);

                const employeesData = employeesRes.data?.$values || [];
                const departmentsData = departmentsRes.data?.$values || [];
                const attendanceData = attendanceRes.data?.$values || [];
                const leavesData = leavesRes.data?.$values || [];
                const tasksData = tasksRes.data?.$values || [];

                const foundEmployee = employeesData.find(u => u.id === parseInt(employeeId));
                setEmployee(foundEmployee);

                if (foundEmployee) {
                    const foundDept = departmentsData.find(d => d.id === foundEmployee.departmentId);
                    setDepartment(foundDept);

                    setAttendance(attendanceData.filter(a => a.userId === foundEmployee.id).slice(0, 5));
                    setLeaves(leavesData.filter(l => l.requestorId === foundEmployee.id).slice(0, 5));
                    setTasks(tasksData.filter(t => t.assignedToId === foundEmployee.id).slice(0, 5));
                }
            } catch (error) {
                showToast("Failed to load employee profile.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employeeId]);

    if (loading) {
        return <LoadingSpinner message="Loading employee profile..." />;
    }

    if (!employee) {
        return <EmptyState title="Employee Not Found" message="The employee you are looking for does not exist." />;
    }
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random&color=fff&size=96`;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="fade-in-section">
                <Link to="/employees" className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                    <ArrowLeft size={18} /> Back to Employee List
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Main Profile Info */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 self-start fade-in-section">
                    <div className="text-center">
                        <img src={avatarUrl} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-200 dark:border-slate-700" alt={`${employee.firstName} avatar`} />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{employee.firstName} {employee.lastName}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{employee.designation || 'N/A'}</p>
                    </div>
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4 text-sm">
                        <p className="flex items-center gap-3"><Mail size={16} className="text-slate-400" /> <span className="text-slate-700 dark:text-slate-300">{employee.email}</span></p>
                        <p className="flex items-center gap-3"><Phone size={16} className="text-slate-400" /> <span className="text-slate-700 dark:text-slate-300">{employee.phone || 'N/A'}</span></p>
                        <p className="flex items-center gap-3"><Building2 size={16} className="text-slate-400" /> <span className="text-slate-700 dark:text-slate-300">{department?.name || 'Not Assigned'}</span></p>
                        {employee.joinDate && <p className="flex items-center gap-3"><Calendar size={16} className="text-slate-400" /> <span className="text-slate-700 dark:text-slate-300">Joined on {new Date(employee.joinDate).toLocaleDateString()}</span></p>}
                    </div>
                </div>

                {/* Right Side: Detailed Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Personal Details" icon={User}>
                         <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
                            <p><strong>Gender:</strong> {employee.gender || 'N/A'}</p>
                            <p><strong>Marital Status:</strong> {employee.maritalStatus || 'N/A'}</p>
                            <p><strong>Date of Birth:</strong> {employee.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A'}</p>
                            <p className="col-span-2"><strong>Address:</strong> {employee.currentAddress || 'N/A'}</p>
                         </div>
                    </InfoCard>
                    
                    <InfoCard title="Financial & Emergency" icon={Shield}>
                         <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
                            <p><strong>PAN:</strong> {employee.panNumber || 'N/A'}</p>
                            <p><strong>Bank:</strong> {employee.bankName || 'N/A'}</p>
                            <p><strong>Account No:</strong> {employee.bankAccountNumber || 'N/A'}</p>
                            <p><strong>IFSC:</strong> {employee.ifscCode || 'N/A'}</p>
                            <p className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <strong>Emergency:</strong> {employee.emergencyContactName || 'N/A'} ({employee.emergencyContactRelation || 'N/A'})
                            </p>
                         </div>
                    </InfoCard>

                    <InfoCard title="Recent Activity" icon={Clock}>
                        {attendance.length > 0 ? (
                           <ul className="text-sm space-y-2">
                                {attendance.map(a => <li key={a.id} className="flex justify-between items-center"><span>{new Date(a.date).toLocaleDateString()}</span> {getStatusBadge(a.status)}</li>)}
                           </ul>
                        ) : <p className="text-sm text-slate-500">No recent attendance records.</p>}
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileView;