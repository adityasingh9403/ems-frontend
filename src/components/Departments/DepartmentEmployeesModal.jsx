import React from 'react';
import { X, Building2, Users } from 'lucide-react';

const DepartmentEmployeesModal = ({ isOpen, onClose, departmentName, employees }) => {
  if (!isOpen) return null;

  const employeeList = employees || [];

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-teal-100 dark:bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {departmentName || 'Department Employees'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {employeeList.length} member(s) in this department
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Employee List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {employeeList.length > 0 ? (
            <ul className="space-y-2 p-2">
              {employeeList.map(employee => (
                <li
                  key={employee.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <img
                    className="w-10 h-10 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random&color=fff`}
                    alt={`${employee.firstName} ${employee.lastName} avatar`}
                  />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{employee.firstName} {employee.lastName}</p>
                    {/* --- FIXED: Use 'designation' instead of 'position' to match backend data --- */}
                    <p className="text-sm text-slate-500 dark:text-slate-400">{employee.designation}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-16 px-6">
              <Users className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-4">No Employees Found</h3>
              <p className="mt-1">There are no employees currently assigned to this department.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentEmployeesModal;
