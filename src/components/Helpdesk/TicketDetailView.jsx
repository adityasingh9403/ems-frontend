import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, LifeBuoy } from 'lucide-react'; // Added LifeBuoy
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
// --- CHANGE: Use the new, specific API function ---
import {
    apiGetTicketById, // Changed from apiGetHelpdeskTickets
    apiAddTicketReply,
    apiUpdateTicketStatus
} from '../../apiService';

const TicketDetailView = () => {
    const { ticketId } = useParams();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user || !ticketId) return;
        setLoading(true);
        try {
            const response = await apiGetTicketById(ticketId);

            // --- THIS IS THE FIX ---
            const ticketData = response.data;

            // Check if replies exist and have the .$values structure
            if (ticketData && ticketData.replies && ticketData.replies.$values) {
                // Replace the replies object with the actual array inside it
                ticketData.replies = ticketData.replies.$values;
            } else if (!ticketData.replies) {
                // Ensure replies is always an array, even if it's null from the API
                ticketData.replies = [];
            }

            setTicket(ticketData);

        } catch (error) {
            showToast("Could not fetch ticket details or you don't have permission.", "error");
            setTicket(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [ticketId, user]);

    const handleReply = async () => {
        if (replyText.trim()) {
            try {
                await apiAddTicketReply(ticketId, { replyText });
                showToast("Reply sent successfully!");
                setReplyText('');
                fetchData(); // Refresh the ticket details
            } catch (error) {
                showToast(error.response?.data?.message || "Failed to send reply.", "error");
            }
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await apiUpdateTicketStatus(ticketId, { status: newStatus });
            showToast(`Ticket status updated to ${newStatus}.`, 'info');
            fetchData(); // Refresh the ticket details
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update status.", "error");
        }
    };

    if (loading) return <LoadingSpinner message="Loading ticket details..." />;
    if (!ticket) return (
        <div className="p-6">
            <Link to="/helpdesk" className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-semibold mb-6">
                <ArrowLeft size={18} /> Back to All Tickets
            </Link>
            <EmptyState icon={LifeBuoy} title="Ticket Not Found" message="The requested ticket does not exist or you don't have permission to view it." />
        </div>
    );

    const canManageTicket = user.role === 'admin' || user.role === 'hr_manager';

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen">
            <Link to="/helpdesk" className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-semibold mb-6">
                <ArrowLeft size={18} /> Back to All Tickets
            </Link>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div>
                        <span className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{ticket.category}</span>
                        <h1 className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-100">{ticket.subject}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Raised by {ticket.raisedByName} on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    {canManageTicket ? (
                        <select value={ticket.status} onChange={handleStatusChange} className="p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-sm">
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>
                    ) : (
                        <span className="font-bold capitalize p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">{ticket.status}</span>
                    )}
                </div>
                <div className="mt-4 space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {ticket.replies && ticket.replies.map(reply => (
                            <div key={reply.id} className={`p-3 rounded-lg ${reply.repliedById === user.id ? 'bg-teal-50 dark:bg-teal-500/10' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{reply.repliedByName}</p>
                                <p className="text-sm mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.replyText}</p>
                                <small className="text-slate-400 dark:text-slate-500 mt-2 block text-right">{new Date(reply.createdAt).toLocaleString()}</small>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Add a Reply</h3>
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows="4" className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg"></textarea>
                        <button onClick={handleReply} className="bg-teal-600 text-white px-4 py-2 rounded-lg mt-2 flex items-center gap-2 hover:bg-teal-700">
                            <Send size={16} /> Send Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailView;