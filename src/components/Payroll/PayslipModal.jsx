import React from 'react';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PayslipModal = ({ isOpen, onClose, employee, salaryStructure }) => {
    if (!isOpen || !employee || !salaryStructure) {
        return null;
    }

    const { basic = 0, hra = 0, allowances = 0, pf = 0, tax = 0 } = salaryStructure;
    
    const totalEarnings = basic + hra + allowances;
    const totalDeductions = pf + tax;
    const netSalary = totalEarnings - totalDeductions;
    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const handleDownloadPdf = () => {
        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(20);
        doc.text("Payslip", 105, 20, null, null, "center");
        doc.setFontSize(12);
        doc.text(`For the month of ${currentMonthYear}`, 105, 28, null, null, "center");

        // Add Employee Details
        doc.autoTable({
            startY: 40,
            head: [['Employee Details', '']],
            body: [
                ['Employee Name', `${employee.firstName} ${employee.lastName}`],
                ['Designation', `${employee.designation || employee.role.replace('_', ' ')}`],
                ['Department', `${employee.departmentName}`],
                ['Employee ID', `${employee.id}`],
                ['Payslip Date', `${new Date().toLocaleDateString()}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] }, // Teal color
        });

        // Add Earnings and Deductions
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Earnings', 'Amount ($)', 'Deductions', 'Amount ($)']],
            body: [
                ['Basic Salary', basic.toFixed(2), 'Provident Fund (PF)', pf.toFixed(2)],
                ['House Rent Allowance (HRA)', hra.toFixed(2), 'Income Tax (TDS)', tax.toFixed(2)],
                ['Other Allowances', allowances.toFixed(2), '', ''],
            ],
            theme: 'striped',
        });
        
        // Add Totals
        doc.autoTable({
            startY: doc.lastAutoTable.finalY,
            body: [
                [{ content: 'Total Earnings', styles: { fontStyle: 'bold' } }, totalEarnings.toFixed(2), { content: 'Total Deductions', styles: { fontStyle: 'bold' } }, totalDeductions.toFixed(2)],
            ],
            theme: 'striped',
        });

        // Add Net Salary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Net Salary Payable: $${netSalary.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 15);

        // Save the PDF
        doc.save(`Payslip-${employee.firstName}-${currentMonthYear}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl text-slate-800 dark:text-slate-200">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold">Payslip for {currentMonthYear}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X /></button>
                </div>
                <div className="p-6">
                    {/* ... (rest of the modal content remains the same) ... */}
                    {/* Employee Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                            <p className="text-slate-500 dark:text-slate-400">{employee.designation || employee.role.replace('_', ' ')}</p>
                            <p className="text-slate-500 dark:text-slate-400">{employee.departmentName}</p>
                        </div>
                        <div className="text-right text-slate-600 dark:text-slate-300">
                            <p><strong>Payslip Date:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Employee ID:</strong> {employee.id}</p>
                        </div>
                    </div>
                    {/* Salary Details Table */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-bold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">Earnings</h4>
                            <div className="flex justify-between py-1"><p className="text-slate-500 dark:text-slate-400">Basic Salary</p> <p>${basic.toFixed(2)}</p></div>
                            <div className="flex justify-between py-1"><p className="text-slate-500 dark:text-slate-400">House Rent Allowance (HRA)</p> <p>${hra.toFixed(2)}</p></div>
                            <div className="flex justify-between py-1"><p className="text-slate-500 dark:text-slate-400">Other Allowances</p> <p>${allowances.toFixed(2)}</p></div>
                        </div>
                        <div>
                            <h4 className="font-bold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">Deductions</h4>
                            <div className="flex justify-between py-1"><p className="text-slate-500 dark:text-slate-400">Provident Fund (PF)</p> <p>${pf.toFixed(2)}</p></div>
                            <div className="flex justify-between py-1"><p className="text-slate-500 dark:text-slate-400">Income Tax (TDS)</p> <p>${tax.toFixed(2)}</p></div>
                        </div>
                    </div>
                    {/* Summary */}
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-2 gap-6 font-bold text-sm">
                         <div className="flex justify-between"><p>Total Earnings</p> <p>${totalEarnings.toFixed(2)}</p></div>
                         <div className="flex justify-between"><p>Total Deductions</p> <p>${totalDeductions.toFixed(2)}</p></div>
                    </div>
                     <div className="mt-6 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                        <p className="font-bold text-lg text-teal-600 dark:text-teal-400">Net Salary Payable: ${netSalary.toFixed(2)}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end rounded-b-xl">
                    <button onClick={handleDownloadPdf} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayslipModal;