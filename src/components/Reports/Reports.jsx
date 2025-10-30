import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../Common/LoadingSpinner';
import { showToast } from '../../utils/uiHelpers';
import { apiGetReportSummary } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-700 p-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
                <p className="font-bold text-slate-800 dark:text-slate-100">{`${label}`}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color }}>
                        {`${p.name}: ${p.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Reports = () => {
    const { user } = useAuth();
    const [reportData, setReportData] = useState(null);
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

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await apiGetReportSummary();
                const data = response.data || {};
                setReportData({
                    headcountData: data.headcountData?.$values || [],
                    attendanceTrendData: data.attendanceTrendData?.$values || [],
                    leaveTypeData: data.leaveTypeData?.$values || [],
                    salaryData: data.salaryData?.$values || []
                });
            } catch (error) {
                showToast("Failed to load report data from the server.", "error");
                setReportData({ headcountData: [], attendanceTrendData: [], leaveTypeData: [], salaryData: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return <LoadingSpinner message="Generating reports..." />;
    }

    if (!reportData) {
        return <div className="p-6 text-center text-slate-500">Could not load report data. Please try again later.</div>;
    }
    
    const { headcountData, attendanceTrendData, leaveTypeData, salaryData } = reportData;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Analytics & Reports</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Visual insights into your organization's data.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Headcount Chart */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm fade-in-section">
                    <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Headcount by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={headcountData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {headcountData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Average Salary Chart */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm fade-in-section">
                    <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Average Salary by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salaryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="value" name="Average Salary" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Attendance Trend Chart */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm lg:col-span-2 fade-in-section">
                    <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Attendance Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="present" name="Present" fill="#14b8a6" />
                            <Bar dataKey="late" name="Late" fill="#f59e0b" />
                            <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                 {/* Leave Type Chart */}
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm fade-in-section">
                    <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Approved Leave Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={leaveTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                               {leaveTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;