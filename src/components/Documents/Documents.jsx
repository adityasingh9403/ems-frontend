import React, { useState, useEffect } from 'react';
import { Download, FileText, Upload, Trash2, Building, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import UploadDocumentModal from './UploadDocumentModal';
import { apiGetDocuments, apiUploadDocument, apiDeleteDocument, apiGetEmployees } from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

const DocumentList = ({ title, icon: Icon, documents, canDelete, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold p-5 border-b flex items-center gap-2">
            <Icon className="w-6 h-6 text-teal-500" /> {title}
        </h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700 p-3 max-h-96 overflow-y-auto">
            {documents.length > 0 ? documents.map(doc => (
                <li key={doc.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-500" />
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{doc.documentName}</p>
                            <p className="text-xs text-slate-500">{doc.documentType}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={`http://localhost:5230${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-blue-500"><Download size={16} /></a>
                        {canDelete && <button onClick={() => onDelete(doc.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>}
                    </div>
                </li>
            )) : <li className="p-3 text-center text-slate-500">No documents found.</li>}
        </ul>
    </div>
);

const Documents = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
    }, [setElements, loading]);
    // --- END OF ANIMATION LOGIC ---

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const docRes = await apiGetDocuments();
            const documentsData = docRes.data?.$values || [];
            setDocuments(documentsData);

            if (user.role === 'admin' || user.role === 'hr_manager') {
                const empRes = await apiGetEmployees();
                const employeesData = empRes.data?.$values || [];
                setEmployees(employeesData);
            }
        } catch (error) {
            showToast("Could not load documents.", "error");
            setDocuments([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleUpload = async (formData) => {
        try {
            await apiUploadDocument(formData);
            showToast("Document uploaded successfully!");
            fetchData(); // Refresh list
        } catch (error) {
            showToast("File upload failed.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await apiDeleteDocument(id);
                showToast("Document deleted.", "info");
                fetchData(); // Refresh list
            } catch (error) {
                showToast("Failed to delete document.", "error");
            }
        }
    };

    const myDocuments = documents.filter(d => d.employeeId === user.id);
    const companyDocuments = documents.filter(d => d.employeeId === null);
    const canDelete = user.role === 'admin' || user.role === 'hr_manager';

    return (
        <>
            <UploadDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleUpload}
                employees={employees}
            />
            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="flex justify-between items-center fade-in-section">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Documents</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700">
                        <Upload className="w-4 h-4" /> Upload Document
                    </button>
                </div>

                {loading ? <LoadingSpinner message="Loading documents..." /> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-section">
                        <DocumentList title="My Personal Documents" icon={User} documents={myDocuments} canDelete={false} />
                        <DocumentList title="Company Documents" icon={Building} documents={companyDocuments} canDelete={canDelete} onDelete={handleDelete} />
                    </div>
                )}
            </div>
        </>
    );
};

export default Documents;