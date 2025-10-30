import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper components
import ScrollToTop from './utils/ScrollToTop';

// Auth Components
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Main Feature Components
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import EmployeeProfileView from './components/Employees/EmployeeProfileView';
import DepartmentList from './components/Departments/DepartmentList';
import MyProfile from './components/Profile/MyProfile';
import Performance from './components/Performance/Performance';
import Documents from './components/Documents/Documents';
import SuperAdminDashboard from './components/SuperAdmin/SuperAdminDashboard';
import LeaveManagement from './components/Leave/LeaveManagement';
import TaskManager from './components/Tasks/TaskManager';
import Payroll from './components/Payroll/Payroll';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import Chat from './components/Chat/Chat';
import CompanyCalendar from './components/Calendar/CompanyCalendar';
import Onboarding from './components/Onboarding/Onboarding';
import OrganizationChart from './components/OrganizationChart/OrganizationChart';
import Helpdesk from './components/Helpdesk/Helpdesk';
import TicketDetailView from './components/Helpdesk/TicketDetailView';

// Role-based Attendance Components
import Attendance_Admin from './components/Attendance/Attendance_Admin';
import Attendance_HR from './components/Attendance/Attendance_HR';
import Attendance_DeptManager from './components/Attendance/Attendance_DeptManager';
import Attendance_Employee from './components/Attendance/Attendance_Employee';

// A component to protect routes based on user authentication and roles
const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};

// The main layout that includes Sidebar, Header, and Footer
const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const getTitleFromPath = (path) => {
        if (path.startsWith('/employees/')) return 'Employee Profile';
        const name = path.replace('/', '').replace(/-/g, ' ');
        if (!name) return 'Dashboard';
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const currentTitle = getTitleFromPath(location.pathname);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 lg:p-4">
            <div className="lg:flex">
                <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col w-full lg:ml-[272px]">
                    <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} title={currentTitle} />
                    <main className="flex-grow">
                        <Outlet /> {/* Child routes will render here */}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

// A component to render the correct attendance page based on user role
const AttendancePage = () => {
    const { user } = useAuth();
    switch (user.role) {
        case 'admin': return <Attendance_Admin />;
        case 'hr_manager': return <Attendance_HR />;
        case 'department_manager': return <Attendance_DeptManager />;
        case 'employee': return <Attendance_Employee />;
        default: return <Navigate to="/dashboard" />;
    }
};

// The main component that handles all the application's routing logic
const AppContent = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public routes for login and signup */}
                <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupForm />} />

                {/* Special route for the Super Admin */}
                <Route path="/super-admin" element={user?.role === 'super_admin' ? <SuperAdminDashboard /> : <Navigate to="/login" />} />

                {/* All regular user routes are nested within the MainLayout */}
                <Route element={<MainLayout />}>
                    {/* Routes accessible to ALL logged-in users */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<MyProfile />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/performance" element={<Performance />} />
                        <Route path="/attendance" element={<AttendancePage />} />
                        <Route path="/tasks" element={<TaskManager />} />
                        <Route path="/leave" element={<LeaveManagement />} />
                        <Route path="/helpdesk" element={<Helpdesk />} />
                        <Route path="/helpdesk/:ticketId" element={<TicketDetailView />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/calendar" element={<CompanyCalendar />} />
                        <Route path="/org-chart" element={<OrganizationChart />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                    </Route>

                    {/* Routes for Managers, HR, and Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'hr_manager', 'department_manager']} />}>
                        <Route path="/employees" element={<EmployeeList />} />
                        <Route path="/employees/:employeeId" element={<EmployeeProfileView />} />
                    </Route>

                    {/* Routes for HR and Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'hr_manager']} />}>
                        <Route path="/departments" element={<DepartmentList />} />
                        <Route path="/payroll" element={<Payroll />} />
                        <Route path="/reports" element={<Reports />} />
                        
                    </Route>

                    {/* Routes for Admin only */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Default and wildcard routes for redirection */}
                    <Route path="/" element={<Navigate to={user?.role === 'super_admin' ? "/super-admin" : "/dashboard"} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </>
    );
};

// The root App component that wraps everything in context providers
function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
                <ToastContainer
                    position="bottom-right"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

