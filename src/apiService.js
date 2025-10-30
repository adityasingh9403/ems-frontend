import axios from 'axios';
import { showToast } from './utils/uiHelpers';

const apiClient = axios.create({
    baseURL: 'http://localhost:5198/api', // Your .NET server URL
    headers: {
        'Content-Type': 'application/json',
    }
});

// This interceptor sends the JWT token with every request
apiClient.interceptors.request.use(
    (config) => {
        // Har request bhejne se THEEK PEHLE sessionStorage se token fetch karo.
        const token = sessionStorage.getItem('ems_token');
        if (token) {
            // Agar token hai, to header mein add karo.
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Agar request bhejte waqt koi error aaye, to use handle karo.
        return Promise.reject(error);
    }
);

// This interceptor handles 401 Unauthorized errors (like an expired token)
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            showToast('Your session has expired. Please log in again.', 'error');
            sessionStorage.removeItem('ems_user');
            sessionStorage.removeItem('ems_token');
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        }
        return Promise.reject(error);
    }
);

// ========== AUTH APIs ==========
export const apiRegister = (data) => apiClient.post('/Auth/register', data);
export const apiLogin = (data) => apiClient.post('/Auth/login', data);

// ========== DASHBOARD API ==========
export const apiGetDashboardStats = () => apiClient.get('/Dashboard/stats');

// ========== PROFILE & EMPLOYEE APIs ==========
export const apiGetEmployees = () => apiClient.get('/Employees');
export const apiGetMyProfile = () => apiClient.get('/Employees/my-profile');
export const apiAddEmployee = (data) => apiClient.post('/Employees', data);
export const apiUpdateEmployee = (id, data) => apiClient.put(`/Employees/${id}`, data);
export const apiUpdateMyProfile = (data) => apiClient.put('/Employees/my-profile', data);
export const apiUpdateEmployeeStatus = (id, statusData) => apiClient.patch(`/Employees/${id}/status`, statusData);
export const apiDeleteEmployee = (id) => apiClient.delete(`/Employees/${id}`);
export const apiRegisterFace = (descriptor) => apiClient.post('/Employees/register-face', descriptor);
export const apiResetFace = (id) => apiClient.post(`/Employees/${id}/reset-face`);
export const apiBulkImportEmployees = (data) => apiClient.post('/Employees/bulk', data);

// ========== DEPARTMENT & SETTINGS APIs ==========
export const apiGetDepartments = () => apiClient.get('/Departments');
export const apiAddDepartment = (data) => apiClient.post('/Departments', data);
export const apiUpdateDepartment = (id, data) => apiClient.put(`/Departments/${id}`, data);
export const apiDeleteDepartment = (id) => apiClient.delete(`/Departments/${id}`);
export const apiGetDesignations = () => apiClient.get('/Settings/designations');
export const apiAddDesignation = (data) => apiClient.post('/Settings/designations', data);
export const apiDeleteDesignation = (id) => apiClient.delete(`/Settings/designations/${id}`);
export const apiGetHolidays = () => apiClient.get('/Settings/holidays');
export const apiAddHoliday = (data) => apiClient.post('/Settings/holidays', data);
export const apiDeleteHoliday = (id) => apiClient.delete(`/Settings/holidays/${id}`);
export const apiGetOfficeTimings = () => apiClient.get('/Settings/office-timings');
export const apiSaveOfficeTimings = (data) => apiClient.post('/Settings/office-timings', data);

// ========== ATTENDANCE API ==========
export const apiGetAttendance = () => apiClient.get('/Attendance');
export const apiGetMyAttendance = () => apiClient.get('/Attendance/my-records');
export const apiMarkAttendance = (data) => apiClient.post('/Attendance/mark', data);

// ========== LEAVE APIs ==========
export const apiGetLeaveRequests = () => apiClient.get('/Leave');
export const apiApplyForLeave = (data) => apiClient.post('/Leave', data);
export const apiUpdateLeaveStatus = (id, data) => apiClient.put(`/Leave/${id}/status`, data);

// ========== TASK APIs ==========
export const apiGetTasks = () => apiClient.get('/Tasks');
export const apiAddTask = (data) => apiClient.post('/Tasks', data);
export const apiUpdateTask = (id, data) => apiClient.put(`/Tasks/${id}`, data);
export const apiDeleteTask = (id) => apiClient.delete(`/Tasks/${id}`);
export const apiUpdateTaskStatus = (id, data) => apiClient.patch(`/Tasks/${id}/status`, data);

// ========== HELPDESK APIs ==========
export const apiGetHelpdeskTickets = () => apiClient.get('/Helpdesk/tickets');
export const apiGetTicketById = (ticketId) => apiClient.get(`/Helpdesk/tickets/${ticketId}`);
export const apiCreateTicket = (data) => apiClient.post('/Helpdesk/tickets', data);
export const apiAddTicketReply = (ticketId, data) => apiClient.post(`/Helpdesk/tickets/${ticketId}/replies`, data);
export const apiUpdateTicketStatus = (ticketId, data) => apiClient.put(`/Helpdesk/tickets/${ticketId}/status`, data);

// ========== ONBOARDING APIs ==========
export const apiGetOnboardingChecklist = (employeeId) => apiClient.get(`/Onboarding/${employeeId}`);
export const apiUpdateOnboardingChecklist = (data) => apiClient.post('/Onboarding', data);

// ========== PAYROLL APIs ==========
export const apiGetSalaryStructure = (employeeId) => apiClient.get(`/Payroll/structure/${employeeId}`);
export const apiSaveSalaryStructure = (data) => apiClient.post('/Payroll/structure', data);

// ========== PERFORMANCE APIs ==========
export const apiGetGoals = (employeeId) => apiClient.get(`/Performance/goals/${employeeId}`);
export const apiAddGoal = (data) => apiClient.post('/Performance/goals', data);
export const apiDeleteGoal = (goalId) => apiClient.delete(`/Performance/goals/${goalId}`);
export const apiGetReviews = (employeeId) => apiClient.get(`/Performance/reviews/${employeeId}`);
export const apiAddReview = (data) => apiClient.post('/Performance/reviews', data);
export const apiGetRanking = (period) => apiClient.get(`/Performance/ranking?period=${period}`);

// ========== DOCUMENTS API ==========
export const apiGetDocuments = () => apiClient.get('/Documents');
export const apiUploadDocument = (formData) => {
    return apiClient.post('/Documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
export const apiDeleteDocument = (id) => apiClient.delete(`/Documents/${id}`);

// ========== ANNOUNCEMENTS API ==========
export const apiGetAnnouncements = () => apiClient.get('/Announcements');
export const apiAddAnnouncement = (data) => apiClient.post('/Announcements', data);
export const apiDeleteAnnouncement = (id) => apiClient.delete(`/Announcements/${id}`);

// ========== CHAT API ==========
// ========== CHAT API ==========
export const apiGetChatMessages = () => {
    // Add a unique timestamp to the URL to prevent browser caching
    const cacheBuster = `_t=${new Date().getTime()}`;
    return apiClient.get(`/Chat?${cacheBuster}`);
};
export const apiPostChatMessage = (data) => apiClient.post('/Chat', data);
export const apiUpdateGoalStatus = (goalId, data) => apiClient.patch(`/Performance/goals/${goalId}/status`, data);


// ========== CALENDAR API ==========
export const apiGetCalendarEvents = () => apiClient.get('/Calendar/events');

// ========== ORG CHART API ==========
export const apiGetOrgChart = () => apiClient.get('/OrgChart');

// ========== REPORTS API ==========
export const apiGetReportSummary = () => apiClient.get('/Reports/summary');

// ========== SUPER ADMIN API ==========
export const apiGetSuperAdminDashboard = () => apiClient.get('/SuperAdmin/dashboard');

// ========== PROFILE & EMPLOYEE APIs ==========
export const apiUpdateEmployeeRole = (id, roleData) => apiClient.put(`/Employees/${id}/role`, roleData);
// ... baaki functions ...

// Add this line inside apiService.js, for example, after the Announcements API
export const apiGetNotifications = () => apiClient.get('/Notifications');

// Add this line inside apiService.js, for example, after the Dashboard API
export const apiGetCompanyDetails = () => apiClient.get('/Company/details');