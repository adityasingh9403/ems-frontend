import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';

const UploadDocumentModal = ({ isOpen, onClose, onUpload, employees }) => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('Personal');
    const [employeeId, setEmployeeId] = useState(''); // For admin/hr to select employee
    const [isUploading, setIsUploading] = useState(false);

    const canSelectEmployee = user.role === 'admin' || user.role === 'hr_manager';

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            showToast("Please select a file to upload.", "error");
            return;
        }
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('File', file);
        formData.append('DocumentType', documentType);
        // Only admin/hr can assign to other employees
        if (canSelectEmployee && employeeId) {
            formData.append('EmployeeId', employeeId);
        }

        await onUpload(formData); // Parent component handles the API call
        setIsUploading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Upload Document</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Document Type</label>
                            <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option>Personal</option>
                                <option>Offer Letter</option>
                                <option>Payslip</option>
                                <option>Company Policy</option>
                            </select>
                        </div>

                        {canSelectEmployee && (
                             <div>
                                <label className="block text-sm font-medium mb-1">Assign to Employee (Optional)</label>
                                <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full p-2 border rounded-lg">
                                    <option value="">Company-Wide Document</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                             </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">File</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">{file ? file.name : 'PDF, DOCX, PNG, JPG up to 10MB'}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={isUploading} className="bg-teal-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadDocumentModal;