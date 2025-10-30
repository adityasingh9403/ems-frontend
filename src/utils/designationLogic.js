// This file currently uses localStorage.
// Our next step will be to connect this to the backend.

export const getDesignations = (companyId) => {
    const key = `ems_designations_${companyId}`;
    const data = JSON.parse(localStorage.getItem(key));
    // If no custom designations, return a default set
    if (!data || data.length === 0) {
        return [
            { id: 'des_admin', title: 'Administrator', mapsToRole: 'admin' },
            { id: 'des_hr', title: 'HR Manager', mapsToRole: 'hr_manager' },
            { id: 'des_dm', title: 'Department Manager', mapsToRole: 'department_manager' },
            { id: 'des_emp', title: 'Employee', mapsToRole: 'employee' },
        ];
    }
    return data;
};

const saveDesignations = (designations, companyId) => {
    const key = `ems_designations_${companyId}`;
    localStorage.setItem(key, JSON.stringify(designations));
    window.dispatchEvent(new Event('storageUpdated'));
};

export const addDesignation = (designationData, companyId) => {
    const allDesignations = getDesignations(companyId);
    const newDesignation = {
        id: `des_${Date.now()}`,
        ...designationData
    };
    const updatedDesignations = [...allDesignations, newDesignation];
    saveDesignations(updatedDesignations, companyId);
    return updatedDesignations;
};

export const deleteDesignation = (designationId, companyId) => {
    let allDesignations = getDesignations(companyId);
    const updatedDesignations = allDesignations.filter(d => d.id !== designationId);
    saveDesignations(updatedDesignations, companyId);
    return updatedDesignations;
};

