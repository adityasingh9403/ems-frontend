import React from 'react';
import { X, Users } from 'lucide-react';

const DashboardInfoModal = ({ isOpen, onClose, title, data, columns }) => {
    if (!isOpen) return null;

    const getDisplayValue = (item, accessor) => {
        const value = item[accessor];
        if (accessor.toLowerCase().includes('salary')) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
            }).format(value || 0);
        }
        if (accessor.toLowerCase().includes('status')) {
            // This is the line that contains JSX
            return <span className="capitalize">{value}</span>;
        }
        return value || 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto">
                    {data && data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                                    <tr>
                                        {columns.map((col) => (
                                            <th key={col.accessor} scope="col" className="px-6 py-3 font-medium">
                                                {col.header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {data.map((item, index) => (
                                        <tr key={item.id || index}>
                                            {columns.map((col) => (
                                                <td key={col.accessor} className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {getDisplayValue(item, col.accessor)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No Data Available</h3>
                            <p>There is no data to display for this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardInfoModal;