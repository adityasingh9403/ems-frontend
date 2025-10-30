import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ApplyLeaveModal from './ApplyLeaveModal';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { 
    apiGetLeaveRequests, 
    apiApplyForLeave, 
    apiUpdateLeaveStatus 
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const LeaveManagement_HR = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allRequests, setAllRequests] = useState([]);
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
            const response = await apiGetLeaveRequests();
            const requestsData = response.data?.$values || [];
            setAllRequests(requestsData);
        } catch (error) {
            showToast("Could not fetch leave data.", "error");
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveLeave = async (leaveData) => {
        try {
            await apiApplyForLeave(leaveData);
            showToast("Leave request submitted successfully!");
            fetchData();
        } catch(error) {
            showToast(error.response?.data?.message || "Failed to submit leave request.", "error");
        }
    };

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await apiUpdateLeaveStatus(requestId, { status: newStatus });
            showToast(`Request has been ${newStatus}.`);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update leave status.", "error");
        }
    };

    const myRequests = allRequests.filter(r => r.requestorId === user.id);
    const subordinateRequests = allRequests.filter(r => r.requestorId !== user.id && r.requestorRole !== 'admin');

    return (
        <>
            <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLeave} />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Leave Management (HR)</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2">
                        <Plus className="w-5 h-5" />
                        <span>Apply for Leave</span>
                    </button>
                </div>

                {loading ? <LoadingSpinner message="Loading leave requests..." /> : (
                    <>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                            <h2 className="text-xl font-semibold p-5 text-slate-800 dark:text-slate-100">My Requests</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Leave Type</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Dates</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Action By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {myRequests.length > 0 ? myRequests.map(req => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{req.leaveType}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.startDate} to {req.endDate}</td>
                                                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{req.actionByName || 'Pending Admin Approval'}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4"><EmptyState icon={Users} title="No Requests" message="You have not submitted any leave requests." /></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">Subordinates' Requests</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee / Manager</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Dates</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {subordinateRequests.length > 0 ? subordinateRequests.map(req => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{req.requestorName}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.startDate} to {req.endDate}</td>
                                                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button onClick={() => handleStatusChange(req.id, 'approved')} title="Approve" className="p-2 text-slate-400 hover:text-green-500"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleStatusChange(req.id, 'rejected')} title="Reject" className="p-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">Action Taken</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4"><EmptyState icon={Users} title="No Pending Requests" message="There are no pending leave requests from subordinates."/></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default LeaveManagement_HR;