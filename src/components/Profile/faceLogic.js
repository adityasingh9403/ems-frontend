import { showToast } from '../../utils/uiHelpers';

export const registerFace = (descriptor, user) => {
    const allUsers = JSON.parse(localStorage.getItem('ems_users')) || [];
    const userIndex = allUsers.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
        // Convert the Float32Array to a regular array for JSON serialization
        const descriptorArray = Array.from(descriptor);
        allUsers[userIndex].faceDescriptor = descriptorArray;
        
        // Save the updated list of all users back to localStorage
        localStorage.setItem('ems_users', JSON.stringify(allUsers));
        
        // --- IMPORTANT: Update the user's session in sessionStorage as well ---
        sessionStorage.setItem('ems_user', JSON.stringify(allUsers[userIndex]));
        
        // Notify other components (like the dashboard) of the update
        window.dispatchEvent(new Event('storageUpdated'));
        showToast('Face registered successfully!');
    }
};
