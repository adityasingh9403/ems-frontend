import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import TaskModal from './TaskModal';
import TaskDetailModal from './TaskDetailModal';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import {
    apiGetTasks,
    apiAddTask,
    apiUpdateTask,
    apiDeleteTask,
    apiUpdateTaskStatus,
    apiGetEmployees,
    apiGetLeaveRequests
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const TaskManager = () => {
    const { user } = useAuth();
    const [allTasks, setAllTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [approvedLeaves, setApprovedLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

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

    const canCreateTasks = useMemo(() =>
        ['admin', 'hr_manager', 'department_manager'].includes(user?.role),
        [user]
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                if (canCreateTasks) {
                    const [tasksRes, usersRes, leavesRes] = await Promise.all([
                        apiGetTasks(),
                        apiGetEmployees(),
                        apiGetLeaveRequests()
                    ]);

                    const tasksData = tasksRes.data?.$values || [];
                    const usersData = usersRes.data?.$values || [];
                    const leavesData = leavesRes.data?.$values || [];

                    setAllTasks(tasksData);
                    setAllUsers(usersData);
                    setApprovedLeaves(leavesData.filter(l => l.status === 'approved'));
                } else {
                    const tasksRes = await apiGetTasks();
                    const tasksData = tasksRes.data?.$values || [];
                    setAllTasks(tasksData);
                }
            } catch (error) {
                showToast("Could not fetch task data.", "error");
                setAllTasks([]);
                setAllUsers([]);
                setApprovedLeaves([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, canCreateTasks]);

    // ... (rest of the handler functions like handleSaveTask, handleDeleteTask, etc. remain the same) ...
    // Purane handleSaveTask ko isse replace karein
    const handleSaveTask = async (taskData) => {
        let success = false;
        try {
            if (editingTask) {
                await apiUpdateTask(editingTask.id, taskData);
                showToast('Task updated successfully!');
            } else {
                await apiAddTask(taskData);
                showToast('Task created successfully!');
            }
            success = true;
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save task.', 'error');
            success = false;
        }

        // Sirf agar task save hua ho, tab hi data refresh karein
        if (success) {
            fetchData();
        }

        setIsCreateModalOpen(false);
        setEditingTask(null);
    };

    // Purane handleCompleteTask ko isse replace karein
    const handleCompleteTask = async (taskId) => {
        let success = false;
        try {
            await apiUpdateTaskStatus(taskId, { status: 'completed' });
            showToast('Task marked as complete!');
            success = true;
        } catch (error) {
            showToast('Failed to update task status.', 'error');
            success = false;
        }

        // Sirf agar task complete hua ho, tab hi data refresh karein
        if (success) {
            fetchData();
        }

        setIsDetailModalOpen(false);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await apiDeleteTask(taskId);
                showToast('Task deleted successfully.', 'info');
                fetchData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete task.', 'error');
            }
        }
    };

    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (task) => {
        setEditingTask(task);
        setIsCreateModalOpen(true);
    };

    const handleViewTask = (task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const assignableUsers = useMemo(() => {
        if (!user || !allUsers.length || !canCreateTasks) return [];
        if (user.role === 'admin' || user.role === 'hr_manager') {
            return allUsers.filter(u => u.role !== 'admin');
        }
        if (user.role === 'department_manager') {
            return allUsers.filter(u => u.departmentId === user.departmentId && u.role === 'employee');
        }
        return [];
    }, [user, allUsers, canCreateTasks]);

    const myTasks = allTasks.filter(t => t.assignedToId === user.id);
    const assignedByMe = canCreateTasks ? allTasks.filter(t => t.assignedById === user.id) : [];

    return (
        <>
            <TaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveTask}
                assignableUsers={assignableUsers}
                approvedLeaves={approvedLeaves}
                editingTask={editingTask}
            />
            <TaskDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                task={selectedTask}
                onComplete={handleCompleteTask}
                currentUser={user}
            />

            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Task Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {canCreateTasks ? "Assign and track tasks for your team." : "View tasks assigned to you."}
                        </p>
                    </div>
                    {canCreateTasks && (
                        <button onClick={handleOpenCreateModal} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-700">
                            <Plus /> <span>New Task</span>
                        </button>
                    )}
                </div>

                {loading ? <LoadingSpinner message="Loading tasks..." /> : (
                    <>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">My Tasks ({myTasks.length})</h2>
                            {myTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {myTasks.map(task => (
                                        <div key={task.id} onClick={() => handleViewTask(task)} className="p-3 border dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 flex justify-between">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Due: {task.dueDate}</p>
                                            </div>
                                            <span className="text-sm capitalize font-semibold text-slate-700 dark:text-slate-300">{task.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CheckSquare}
                                    title="All Caught Up!"
                                    message="You have no pending tasks assigned to you."
                                />
                            )}
                        </div>

                        {canCreateTasks && (
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Tasks I've Assigned ({assignedByMe.length})</h2>
                                {assignedByMe.length > 0 ? (
                                    <div className="space-y-2">
                                        {assignedByMe.map(task => (
                                            <div key={task.id} className="p-3 border dark:border-slate-600 rounded-lg flex justify-between items-center">
                                                <div onClick={() => handleViewTask(task)} className="cursor-pointer flex-grow">
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">To: {allUsers.find(u => u.id === task.assignedToId)?.firstName || 'N/A'} | Status: <span className="capitalize font-semibold">{task.status}</span></p>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <button onClick={() => handleOpenEditModal(task)} className="p-2 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400" title="Edit Task">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400" title="Delete Task">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={CheckSquare}
                                        title="No Tasks Assigned"
                                        message="You haven't assigned any tasks yet. Click 'New Task' to start."
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default TaskManager;