import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ApplyLeaveModal from './ApplyLeaveModal';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { 
    apiGetLeaveRequests, 
    apiApplyForLeave 
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const LeaveManagement_Employee = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
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
            setLeaveRequests(requestsData);
        } catch (error) {
            showToast("Could not fetch your leave requests.", "error");
            setLeaveRequests([]);
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

    const filteredRequests = leaveRequests.filter(req => filterStatus === 'all' || req.status === filterStatus);

    return (
        <>
            <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLeave} />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Leave Requests</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Apply for leave and track your request status.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span>Apply for Leave</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 fade-in-section">
                    <div className="relative sm:w-64">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 appearance-none bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden fade-in-section">
                    {loading ? <LoadingSpinner message="Loading your requests..." /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Leave Type</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Dates</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Reason</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Action By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{req.leaveType}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.startDate} to {req.endDate}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                            <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                {req.actionByName ? (
                                                    <div>
                                                        <p>{req.actionByName}</p>
                                                        <p className="text-xs">{new Date(req.actionTimestamp).toLocaleString()}</p>
                                                    </div>
                                                ) : 'Pending Action'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5">
                                            <EmptyState icon={Calendar} title="No Leave Requests Found" message="You haven't applied for any leaves yet." />
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LeaveManagement_Employee;