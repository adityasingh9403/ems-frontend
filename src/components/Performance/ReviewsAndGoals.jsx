import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetEmployees, apiGetGoals, apiAddGoal, apiDeleteGoal, apiGetReviews, apiAddReview, apiUpdateGoalStatus } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { Plus, Trash2, Star, CheckSquare, Square } from 'lucide-react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const ReviewsAndGoals = () => {
    const { user } = useAuth();
    const isManager = ['admin', 'hr_manager', 'department_manager'].includes(user.role);

    const [goals, setGoals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [newGoal, setNewGoal] = useState({ goalDescription: '', targetDate: '' });
    const [newReview, setNewReview] = useState({ reviewPeriod: `Q4 ${new Date().getFullYear()}`, rating: 3, comments: '' });

    const [observer, setElements, entries] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px' });
    useEffect(() => { entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')) }, [entries, observer]);
    useEffect(() => { if (!loading) setElements(document.querySelectorAll('.fade-in-section')) }, [setElements, loading, selectedEmployeeId]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                if (isManager) {
                    const res = await apiGetEmployees();
                    const employeesData = res.data?.$values || (Array.isArray(res.data) ? res.data : []);
                    if (user.role === 'department_manager') {
                        setEmployees(employeesData.filter(e => e.departmentId === user.departmentId));
                    } else {
                        setEmployees(employeesData);
                    }
                    setLoading(false);
                } else { // Employee view
                    const [goalsRes, reviewsRes] = await Promise.all([apiGetGoals(user.id), apiGetReviews(user.id)]);
                    setGoals(goalsRes.data?.$values || (Array.isArray(goalsRes.data) ? goalsRes.data : []));
                    setReviews(reviewsRes.data?.$values || (Array.isArray(reviewsRes.data) ? reviewsRes.data : []));
                    setLoading(false);
                }
            } catch (error) {
                showToast("Could not fetch initial data.", "error");
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user, isManager]);

    useEffect(() => {
        if (isManager && selectedEmployeeId) {
            const fetchEmployeeData = async () => {
                setLoading(true);
                setGoals([]); setReviews([]);
                try {
                    const [goalsRes, reviewsRes] = await Promise.all([apiGetGoals(selectedEmployeeId), apiGetReviews(selectedEmployeeId)]);
                    setGoals(goalsRes.data?.$values || (Array.isArray(goalsRes.data) ? goalsRes.data : []));
                    setReviews(reviewsRes.data?.$values || (Array.isArray(reviewsRes.data) ? reviewsRes.data : []));
                } catch (error) {
                    showToast("Could not fetch performance data.", "error");
                } finally {
                    setLoading(false);
                }
            };
            fetchEmployeeData();
        }
    }, [selectedEmployeeId, isManager]);

    // --- FIX: Handler functions defined correctly in the component scope ---
    const handleAddGoal = useCallback(async (e) => {
        e.preventDefault();
        if (!newGoal.goalDescription || !newGoal.targetDate) return showToast("Please fill all goal fields.", "error");
        try {
            await apiAddGoal({ ...newGoal, employeeId: selectedEmployeeId });
            showToast("Goal added successfully!");
            setNewGoal({ goalDescription: '', targetDate: '' });
            const res = await apiGetGoals(selectedEmployeeId);
            setGoals(res.data?.$values || (Array.isArray(res.data) ? res.data : []));
        } catch (error) {
            showToast("Failed to add goal.", "error");
        }
    }, [newGoal, selectedEmployeeId]);

    const handleDeleteGoal = useCallback(async (goalId) => {
        if (window.confirm("Are you sure?")) {
            try {
                await apiDeleteGoal(goalId);
                showToast("Goal deleted.", "info");
                const res = await apiGetGoals(selectedEmployeeId);
                setGoals(res.data?.$values || (Array.isArray(res.data) ? res.data : []));
            } catch (error) {
                showToast("Failed to delete goal.", "error");
            }
        }
    }, [selectedEmployeeId]);

    const handleAddReview = useCallback(async (e) => {
        e.preventDefault();
        if (!newReview.comments) return showToast("Comments are required for a review.", "error");
        try {
            await apiAddReview({ ...newReview, employeeId: selectedEmployeeId });
            showToast("Review added successfully!");
            setNewReview({ reviewPeriod: `Q1 ${new Date().getFullYear() + 1}`, rating: 3, comments: '' });
            const res = await apiGetReviews(selectedEmployeeId);
            setReviews(res.data?.$values || (Array.isArray(res.data) ? res.data : []));
        } catch (error) {
            showToast("Failed to add review.", "error");
        }
    }, [newReview, selectedEmployeeId]);

    const handleGoalStatusUpdate = useCallback(async (goalId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
        try {
            await apiUpdateGoalStatus(goalId, { status: newStatus });
            showToast('Goal status updated!');
            setGoals(goals => goals.map(g => g.id === goalId ? { ...g, status: newStatus } : g));
        } catch {
            showToast('Failed to update goal status.', 'error');
        }
    }, []);
    
    if (loading && ((isManager && !employees.length) || !isManager)) {
        return <LoadingSpinner message="Loading performance data..." />;
    }

    return (
        isManager ? (
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm fade-in-section">
                    <label className="font-medium text-slate-700 dark:text-slate-200">Select Employee to Manage</label>
                    <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full p-2 mt-1 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                    </select>
                </div>
                {selectedEmployeeId ? (loading ? <LoadingSpinner /> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm space-y-4 fade-in-section">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Goals</h3>
                            {goals.length > 0 ? (<div className="space-y-2 max-h-60 overflow-y-auto">{goals.map(goal => (<div key={goal.id} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md flex justify-between items-center"><div><p>{goal.goalDescription}</p><small className="text-slate-500">Target: {goal.targetDate} | Status: {goal.status}</small></div><button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500"><Trash2 size={16}/></button></div>))}</div>) : <p className="text-sm text-slate-500">No goals set yet.</p>}
                            <form onSubmit={handleAddGoal} className="border-t pt-4 space-y-2"><input value={newGoal.goalDescription} onChange={e => setNewGoal({...newGoal, goalDescription: e.target.value})} placeholder="New Goal Description" className="w-full p-2 border rounded bg-white dark:bg-slate-700"/><input type="date" value={newGoal.targetDate} onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-slate-700"/><button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={16}/> Add Goal</button></form>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm space-y-4 fade-in-section">
                             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Performance Reviews</h3>
                            {reviews.length > 0 ? (<div className="space-y-2 max-h-60 overflow-y-auto">{reviews.map(review => (<div key={review.id} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md"><div className="flex justify-between items-center"><p className="font-bold">{review.reviewPeriod}</p><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400' : 'text-slate-300'}/>)}</div></div><p className="text-sm mt-1">{review.comments}</p></div>))}</div>) : <p className="text-sm text-slate-500">No reviews yet.</p>}
                             <form onSubmit={handleAddReview} className="border-t pt-4 space-y-2"><input value={newReview.reviewPeriod} onChange={e => setNewReview({...newReview, reviewPeriod: e.target.value})} placeholder="Review Period" className="w-full p-2 border rounded bg-white dark:bg-slate-700"/><textarea value={newReview.comments} onChange={e => setNewReview({...newReview, comments: e.target.value})} placeholder="Comments..." className="w-full p-2 border rounded bg-white dark:bg-slate-700" rows={3}></textarea><div><label>Rating:</label><select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} className="p-2 border rounded ml-2 bg-white dark:bg-slate-700"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select></div><button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Plus size={16}/> Add Review</button></form>
                        </div>
                    </div>
                )) : null}
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm space-y-4 fade-in-section">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Goals</h3>
                    {goals.length > 0 ? (<div className="space-y-3">{goals.map(goal => (<div key={goal.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3"><button onClick={() => handleGoalStatusUpdate(goal.id, goal.status)}>{goal.status === 'completed' ? <CheckSquare className="w-5 h-5 text-green-500 mt-0.5"/> : <Square className="w-5 h-5 text-slate-400 mt-0.5"/>}</button><div><p className={`text-slate-800 dark:text-slate-200 ${goal.status === 'completed' ? 'line-through text-slate-500' : ''}`}>{goal.goalDescription}</p><small className="text-slate-500 dark:text-slate-400">Target: {goal.targetDate}</small></div></div>))}</div>) : <EmptyState title="No Goals Set" message="Your manager has not set any goals for you yet." />}
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm space-y-4 fade-in-section">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Performance Reviews</h3>
                    {reviews.length > 0 ? (<div className="space-y-3">{reviews.map(review => (<div key={review.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div className="flex justify-between items-center"><p className="font-bold text-slate-800 dark:text-slate-200">{review.reviewPeriod}</p><div className="flex items-center">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400' : 'text-slate-300'}/>)}</div></div><p className="text-sm mt-1 text-slate-700 dark:text-slate-300">{review.comments}</p></div>))}</div>) : <EmptyState title="No Reviews Yet" message="You do not have any performance reviews yet." />}
                </div>
            </div>
        )
    );
};

export default ReviewsAndGoals;