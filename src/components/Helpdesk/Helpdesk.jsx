import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreateTicketModal from './CreateTicketModal';
import { Plus, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showToast, getStatusBadge } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { apiGetHelpdeskTickets, apiCreateTicket } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Helpdesk = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
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
            const response = await apiGetHelpdeskTickets();
            const ticketsData = response.data?.$values || [];
            setTickets(ticketsData);
        } catch (error) {
            showToast("Could not fetch helpdesk tickets.", "error");
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [user]);

    const handleCreateTicket = async (ticketData) => {
        try {
            await apiCreateTicket(ticketData);
            showToast("Helpdesk ticket created successfully!");
            fetchData(); // Refresh list from backend
        } catch (error) {
            showToast("Failed to create ticket.", "error");
        }
    };

    const isManagerOrAdmin = user.role === 'admin' || user.role === 'hr_manager';
    
    const visibleTickets = tickets.filter(t => filter === 'all' || t.status === filter);

    return (
        <>
            <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateTicket} />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen">
                <div className="flex justify-between items-center mb-6 fade-in-section">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Helpdesk</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700">
                        <Plus size={18}/> New Ticket
                    </button>
                </div>

                {isManagerOrAdmin && (
                    <div className="mb-4 flex gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg w-fit fade-in-section">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>All</button>
                        <button onClick={() => setFilter('open')} className={`px-4 py-1 text-sm rounded-md ${filter === 'open' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Open</button>
                        <button onClick={() => setFilter('closed')} className={`px-4 py-1 text-sm rounded-md ${filter === 'closed' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Closed</button>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden fade-in-section">
                    {loading ? <LoadingSpinner message="Loading tickets..." /> : (
                        <div className="overflow-x-auto">
                            {visibleTickets.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Ticket ID</th>
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Subject</th>
                                            {isManagerOrAdmin && <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Raised By</th>}
                                            <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {visibleTickets.map(ticket => (
                                            <tr key={ticket.id}>
                                                <td className="px-6 py-4"><Link to={`/helpdesk/${ticket.id}`} className="text-blue-600 hover:underline font-semibold">#{ticket.id}</Link></td>
                                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{ticket.subject}</td>
                                                {isManagerOrAdmin && <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{ticket.raisedByName}</td>}
                                                <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyState icon={LifeBuoy} title="No Tickets Found" message="You haven't raised any tickets yet, or no tickets match the current filter." />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Helpdesk;