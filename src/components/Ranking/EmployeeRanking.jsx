import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckSquare, XCircle, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetRanking } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Metric = ({ icon: Icon, value, label, color }) => (
    <div title={label} className={`flex items-center gap-1 text-xs ${color}`}>
        <Icon className="w-4 h-4" /> {value}
    </div>
);

const EmployeeRanking = () => {
    const { user } = useAuth();
    const [rankedEmployees, setRankedEmployees] = useState([]);
    const [rankingPeriod, setRankingPeriod] = useState('monthly');
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
    }, [setElements, loading, rankingPeriod]); // Rerun when period changes
    // --- END OF ANIMATION LOGIC ---

    useEffect(() => {
        const fetchRankingData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await apiGetRanking(rankingPeriod);
                // --- FIX: Correctly extract the array from .$values ---
                const rankingData = response.data?.$values || [];
                setRankedEmployees(rankingData);
            } catch (error) {
                showToast("Could not load employee ranking.", "error");
                setRankedEmployees([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRankingData();
    }, [user, rankingPeriod]);

    const getVisibleEmployees = () => {
        if (!user || !Array.isArray(rankedEmployees)) return [];
        if (user.role === 'admin' || user.role === 'hr_manager') {
            return rankedEmployees;
        }
        if (user.role === 'department_manager') {
            const userDeptId = user.departmentId;
            return rankedEmployees.filter(emp => emp.departmentId === userDeptId);
        }
        // Employees see their own rank in the card, but not the full list
        return [];
    };

    const myRankData = rankedEmployees.find(emp => emp.employeeId === user.id);
    const myRankIndex = rankedEmployees.findIndex(emp => emp.employeeId === user.id);

    const getRankBadge = (rank) => {
        if (rank === 0) return <span className="text-2xl" title="1st Place">🥇</span>;
        if (rank === 1) return <span className="text-2xl" title="2nd Place">🥈</span>;
        if (rank === 2) return <span className="text-2xl" title="3rd Place">🥉</span>;
        return <span className="text-sm font-bold text-slate-500 dark:text-slate-400">#{rank + 1}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 w-fit fade-in-section">
                <button onClick={() => setRankingPeriod('monthly')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${rankingPeriod === 'monthly' ? 'bg-teal-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>This Month</button>
                <button onClick={() => setRankingPeriod('all-time')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${rankingPeriod === 'all-time' ? 'bg-teal-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>All-Time</button>
            </div>

            {myRankData && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-teal-500/50 dark:border-teal-500/30 fade-in-section">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Award className="w-10 h-10 text-teal-500" />
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Your Rank ({rankingPeriod === 'monthly' ? 'This Month' : 'All-Time'})</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">#{myRankIndex + 1} <span className="text-base font-normal">/ {rankedEmployees.length}</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Your Score</p>
                            <p className="text-2xl font-bold text-teal-500">{myRankData.score}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <LoadingSpinner message="Calculating rankings..." /> : (
                (user.role === 'admin' || user.role === 'hr_manager' || user.role === 'department_manager') && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden fade-in-section">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-slate-600 dark:text-slate-300">Rank</th>
                                        <th className="px-6 py-3 text-slate-600 dark:text-slate-300">Employee</th>
                                        <th className="px-6 py-3 text-center text-slate-600 dark:text-slate-300">Metrics</th>
                                        <th className="px-6 py-3 text-center text-slate-600 dark:text-slate-300">Overall Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {getVisibleEmployees().map((emp, index) => (
                                        <tr key={emp.employeeId} className={emp.employeeId === user.id ? 'bg-teal-50 dark:bg-teal-500/10' : ''}>
                                            <td className="px-6 py-4 text-center">{getRankBadge(index)}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800 dark:text-slate-100">{emp.fullName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{emp.designation}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Metric icon={TrendingUp} value={emp.presentDays} label="Present Days" color="text-green-500" />
                                                    <Metric icon={Clock} value={emp.lateDays} label="Late Days" color="text-yellow-500" />
                                                    <Metric icon={XCircle} value={emp.absentDays} label="Absent Days" color="text-red-500" />
                                                    <Metric icon={CheckSquare} value={emp.tasksCompleted} label="Tasks Completed" color="text-blue-500" />
                                                    <Metric icon={Calendar} value={emp.leaveDays} label="Leave Days" color="text-orange-500" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-teal-600 dark:text-teal-400 text-lg">{emp.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default EmployeeRanking;