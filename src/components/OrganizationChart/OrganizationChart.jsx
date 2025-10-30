import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, User } from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiGetOrgChart } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const TreeNode = ({ node }) => (
    <li className="my-2 ml-6 fade-in-section">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-fit">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{node.firstName} {node.lastName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{node.role.replace(/_/g, ' ')}</p>
            </div>
        </div>
        {node.children && node.children.length > 0 && (
            <ul className="pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                {node.children.map(child => <TreeNode key={child.id} node={child} />)}
            </ul>
        )}
    </li>
);

const OrganizationChart = () => {
    const { user } = useAuth();
    const [chartData, setChartData] = useState(null);
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
    }, [setElements, loading, chartData]); // Rerun when chartData changes
    // --- END OF ANIMATION LOGIC ---

    useEffect(() => {
        const normalizeTree = (node) => {
            if (!node) return null;
            if (node.children && node.children.$values) {
                node.children = node.children.$values;
                node.children.forEach(child => normalizeTree(child));
            }
            return node;
        };

        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await apiGetOrgChart();
                const normalizedData = normalizeTree(response.data);
                setChartData(normalizedData);
            } catch (error) {
                showToast("Could not build organization chart.", "error");
                setChartData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Organization Chart</h1>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 fade-in-section">
                {loading ? (
                    <LoadingSpinner message="Building chart..." />
                ) : chartData && chartData.id ? (
                    <ul>
                        <TreeNode node={chartData} />
                    </ul>
                ) : (
                    <div className="text-center p-10 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-12 h-12 mx-auto text-slate-400" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">No Chart Data</h3>
                        <p className="mt-1 text-sm">Could not generate an organization chart. Ensure an admin exists for the company.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationChart;