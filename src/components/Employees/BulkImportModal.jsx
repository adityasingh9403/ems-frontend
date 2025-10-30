import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, UploadCloud, FileText } from 'lucide-react';
import { showToast } from '../../utils/uiHelpers';

const BulkImportModal = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid .csv file.');
        }
    };

    const handleImport = () => {
        if (!file) {
            setError('Please select a file to import.');
            return;
        }
        setIsProcessing(true);
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transform: (value, header) => {
                // Convert numeric and date fields from string to their proper types
                const numericFields = ['salary', 'departmentId'];
                const dateFields = ['dob', 'joinDate'];

                if (numericFields.includes(header) && value) {
                    return parseFloat(value) || null;
                }
                if (dateFields.includes(header) && value) {
                    return value || null; // Dates are already in yyyy-mm-dd format
                }
                return value;
            },
            complete: (results) => {
                if (!results.data.length || !results.data[0].email || !results.data[0].firstName) {
                    setError('Invalid CSV format. Make sure it has at least "email" and "firstName" columns.');
                    setIsProcessing(false);
                    return;
                }
                onImport(results.data);
                onClose();
                setIsProcessing(false);
            },
            error: (err) => {
                setError('Error parsing file: ' + err.message);
                setIsProcessing(false);
            }
        });
    };
    
    const csvHeaders = "firstName,lastName,email,phone,dob,gender,maritalStatus,currentAddress,permanentAddress,emergencyContactName,emergencyContactRelation,password,designation,departmentId,position,salary,joinDate,panNumber,bankAccountNumber,bankName,ifscCode";
    const csvExample = "\nJohn,Doe,john.doe@example.com,9876543210,1995-03-15,Male,Single,\"123 Main St, Anytown\",\"123 Main St, Anytown\",Jane Doe,Spouse,password123,Software Engineer,1,Software Engineer,75000,2024-01-10,ABCDE1234F,1234567890,State Bank,SBIN000123";
    const csvTemplate = csvHeaders + csvExample;
    
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const templateLink = URL.createObjectURL(blob);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Import Employees</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        <p>Upload a CSV file with employee data. Please use the provided template to ensure all columns are correct.</p>
                        <a href={templateLink} download="employee_template.csv" className="text-teal-600 hover:underline font-medium mt-2 inline-block">
                            <FileText className="w-4 h-4 inline-block mr-1" />
                            Download CSV Template
                        </a>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                        <label htmlFor="file-upload" className="mt-4 block text-sm font-medium text-teal-600 hover:text-teal-500 cursor-pointer">
                            <span>{file ? file.name : 'Select a CSV file'}</span>
                            <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="mt-1 text-xs text-slate-500">Maximum file size: 5MB</p>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="flex justify-end space-x-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">Cancel</button>
                    <button onClick={handleImport} disabled={!file || isProcessing} className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-sm disabled:opacity-50">
                        {isProcessing ? 'Processing...' : 'Import Employees'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;