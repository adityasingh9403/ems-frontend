import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Users, UserPlus, LogOut, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import { apiGetSuperAdminDashboard } from '../../apiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState'; // Import EmptyState

// Reusable component for the statistics cards
const StatCard = ({ icon: Icon, title, value, color }) => {
    const colors = {
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
    };

    return (
        <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

const SuperAdminDashboard = () => {
    const { logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiGetSuperAdminDashboard();

                // --- FINAL FIX FOR THIS FILE ---
                // The response itself is an object, but the 'companies' property inside it is an array.
                // We need to extract the array from response.data.companies.$values.
                const data = response.data;
                if (data.companies && data.companies.$values) {
                    data.companies = data.companies.$values;
                } else {
                    data.companies = []; // Default to empty array if not found
                }
                setDashboardData(data);

            } catch (error) {
                showToast("Failed to load Super Admin data.", "error");
                setDashboardData(null); // Set to null on error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        // This logic is now correct because dashboardData.companies is a proper array
        if (!dashboardData?.companies) return [];
        return dashboardData.companies
            .map(c => ({ name: c.name, userCount: c.userCount }))
            .sort((a, b) => b.userCount - a.userCount);
    }, [dashboardData]);

    const maxUserCount = Math.max(...chartData.map(d => d.userCount), 1);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <LoadingSpinner message="Loading Super Admin Overview..." />
            </div>
        );
    }

    if (!dashboardData) {
        return <div className="min-h-screen bg-gray-900 p-8 text-center">Error loading data. Please try again.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Super Admin Overview</h1>
                    <p className="text-gray-400 mt-1">System-wide statistics and company management.</p>
                </div>
                <button
                    onClick={logout}
                    className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={Building2} title="Total Companies" value={dashboardData.totalCompanies} color="green" />
                <StatCard icon={Users} title="Total Users" value={dashboardData.totalUsers} color="blue" />
                <StatCard icon={UserPlus} title="New Companies (30d)" value={dashboardData.newCompaniesLast30Days} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="p-5 border-b border-gray-700">
                        <h2 className="text-xl font-semibold">Registered Companies</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {dashboardData.companies.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Company</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Owner Email</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-center">Users</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Date Registered</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {dashboardData.companies.map(company => (
                                        <tr key={company.id} className="hover:bg-gray-700/40 transition-colors">
                                            <td className="px-6 py-4 font-medium">{company.name}</td>
                                            <td className="px-6 py-4 text-gray-300">{company.ownerEmail}</td>
                                            <td className="px-6 py-4 text-center font-bold">{company.userCount}</td>
                                            <td className="px-6 py-4 text-gray-300">{new Date(company.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <EmptyState icon={Building2} title="No Companies Registered" message="No companies have signed up on the platform yet." />
                        )}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                    <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
                    <div className="space-y-4">
                        {chartData.length > 0 ? chartData.map(item => (
                            <div key={item.name}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className="font-bold">{item.userCount}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        style={{ width: `${(item.userCount / maxUserCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-8">No user data to display.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;