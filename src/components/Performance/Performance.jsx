import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeRanking from '../Ranking/EmployeeRanking';
import ReviewsAndGoals from './ReviewsAndGoals';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const Performance = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('ranking');
    const canManagePerformance = ['admin', 'hr_manager', 'department_manager'].includes(user.role);

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
        // We observe all sections initially, and also when the activeTab changes
        const sections = document.querySelectorAll('.fade-in-section');
        setElements(sections);
    }, [setElements, activeTab]);
    // --- END OF ANIMATION LOGIC ---

    const tabButtonClass = (tabName) =>
        `py-2 px-4 font-medium text-sm transition-colors ${activeTab === tabName
            ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
            : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Performance Center</h1>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 mb-6 fade-in-section">
                <nav className="flex space-x-2">
                    <button onClick={() => setActiveTab('ranking')} className={tabButtonClass('ranking')}>
                        Ranking
                    </button>
                    <button onClick={() => setActiveTab('reviews')} className={tabButtonClass('reviews')}>
                        Reviews & Goals
                    </button>
                </nav>
            </div>

            <div className="fade-in-section">
                {activeTab === 'ranking' && <EmployeeRanking />}
                {activeTab === 'reviews' && canManagePerformance && <ReviewsAndGoals />}
            </div>
        </div>
    );
};

export default Performance;