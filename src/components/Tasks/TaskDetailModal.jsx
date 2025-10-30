import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

const TaskDetailModal = ({ isOpen, onClose, task, currentUser, onComplete }) => {
    const [completionNotes, setCompletionNotes] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !task) return null;

    const handleComplete = async () => {
        setIsSaving(true);
        // The onComplete function is passed from TaskManager.js
        // It will handle the API call to update the status.
        // We are passing the task ID. Completion notes/proof can be added later if needed.
        await onComplete(task.id);
        setIsSaving(false);
        onClose();
    };

    const isAssignee = task.assignedToId === currentUser.id;
    const canComplete = isAssignee && task.status !== 'completed';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{task.title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                    <p><strong>Description:</strong> {task.description || 'No description provided.'}</p>
                    <p><strong>Due Date:</strong> {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span className="capitalize font-semibold">{task.status.replace('_', ' ')}</span></p>
                    <p><strong>Priority:</strong> <span className="capitalize font-semibold">{task.priority}</span></p>
                    
                    {task.status === 'completed' && (
                        <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg mt-4">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Completion Details</h4>
                            <p><strong>Notes:</strong> {task.completionNotes || 'N/A'}</p>
                            <p><strong>Proof:</strong> {task.completionProofUrl || 'No proof submitted.'}</p>
                        </div>
                    )}

                    {canComplete && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Mark as Complete</h3>
                            <textarea
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                placeholder="Add completion notes (optional)"
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1">Attach Proof (optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 dark:file:bg-teal-500/10 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100"
                                />
                            </div>
                            <button onClick={handleComplete} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 disabled:opacity-60">
                                <CheckCircle className="w-5 h-5"/>
                                <span>{isSaving ? 'Completing...' : 'Complete Task'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
