import React, { useState, useEffect } from 'react';
import { Check, X, Users, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getStatusBadge, showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { apiGetLeaveRequests, apiUpdateLeaveStatus } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const LeaveManagement_Admin = () => {
    const { user } = useAuth();
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
            const leavesRes = await apiGetLeaveRequests();
            const leavesData = leavesRes.data?.$values || [];
            setAllRequests(leavesData);
        } catch (error) {
            showToast("Could not fetch leave requests.", "error");
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await apiUpdateLeaveStatus(requestId, { status: newStatus });
            showToast(`Request has been ${newStatus}.`);
            fetchData();
        } catch (error) {
            showToast("Failed to update leave status.", "error");
        }
    };

    // --- NEW LOGIC: Separate requests into pending and resolved ---
    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    const resolvedRequests = allRequests.filter(r => r.status !== 'pending');

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Leave Administration</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage all leave requests for the company.</p>
            </div>
            
            {loading ? <LoadingSpinner message="Loading leave requests..." /> : (
                <>
                    {/* --- NEW PENDING REQUESTS TABLE --- */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">Pending Requests ({pendingRequests.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Dates</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Reason</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {pendingRequests.length > 0 ? pendingRequests.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{req.requestorName}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.startDate} to {req.endDate}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => handleStatusChange(req.id, 'approved')} title="Approve" className="p-2 text-slate-400 hover:text-green-500 rounded-full hover:bg-green-100 dark:hover:bg-green-500/10"><Check className="w-5 h-5" /></button>
                                                    <button onClick={() => handleStatusChange(req.id, 'rejected')} title="Reject" className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-500/10"><X className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4"><EmptyState icon={CalendarCheck} title="All Clear!" message="There are no pending leave requests to review."/></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- NEW RESOLVED REQUESTS TABLE --- */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">Resolved Requests</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Employee</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Leave Type</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Dates</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                        <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Action By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {resolvedRequests.length > 0 ? resolvedRequests.map(req => (
                                        <tr key={req.id}>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{req.requestorName}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.leaveType}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{req.startDate} to {req.endDate}</td>
                                            <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{req.actionByName || 'N/A'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5"><EmptyState icon={Users} title="No History" message="No leave requests have been resolved yet."/></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LeaveManagement_Admin;