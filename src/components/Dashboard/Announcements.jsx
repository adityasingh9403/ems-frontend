import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, Trash2 } from 'lucide-react';
import { apiGetAnnouncements, apiAddAnnouncement, apiDeleteAnnouncement } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await apiGetAnnouncements();

            // --- FINAL FIX FOR THIS FILE ---
            // Extract the actual array from the '$values' property
            const announcementsData = res.data?.$values || [];
            setAnnouncements(announcementsData);

        } catch (error) { // Added error parameter
            showToast("Could not load announcements.", "error");
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (newContent.trim()) {
            try {
                const newAnnouncement = await apiAddAnnouncement({ content: newContent });
                // --- IMPROVEMENT: Manually update state for instant feedback ---
                setAnnouncements(prev => [newAnnouncement.data, ...prev]);
                showToast("Announcement posted successfully!");
                setNewContent('');
                setShowForm(false);
            } catch {
                showToast("Failed to post announcement.", "error");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            try {
                await apiDeleteAnnouncement(id);
                // --- IMPROVEMENT: Manually update state for instant feedback ---
                setAnnouncements(prev => prev.filter(a => a.id !== id));
                showToast("Announcement deleted.", "info");
            } catch {
                showToast("Failed to delete announcement.", "error");
            }
        }
    };

    const canAnnounce = user.role === 'admin' || user.role === 'hr_manager';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Announcements</h2>
                {canAnnounce && !showForm && (
                    <button onClick={() => setShowForm(true)} className="text-sm bg-teal-500 text-white px-3 py-1 rounded-lg">New</button>
                )}
            </div>
            {showForm && (
                <form onSubmit={handleAdd} className="mb-4">
                    <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full p-2 border rounded" placeholder="Type your announcement..."></textarea>
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-4 py-1 rounded-lg">Post</button>
                    </div>
                </form>
            )}
            <div className="space-y-4 max-h-48 overflow-y-auto">
                {loading ? <LoadingSpinner /> : announcements.length > 0 ? announcements.map(a => (
                    <div key={a.id} className="border-l-4 border-teal-500 pl-4 relative">
                        <p>{a.content}</p>
                        <small className="text-slate-500">{a.authorName} - {new Date(a.createdAt).toLocaleDateString()}</small>
                        {canAnnounce && (
                            <button onClick={() => handleDelete(a.id)} className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                )) : <p className="text-slate-500">No announcements yet.</p>}
            </div>
        </div>
    );
};

export default Announcements;