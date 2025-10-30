import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Building2, Calendar, Edit, Save, X, Camera,
    Briefcase, Info, AlertTriangle, CheckCircle, DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';
import FaceRegistrationModal from './FaceRegistrationModal';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import { 
    apiGetMyProfile, 
    apiUpdateMyProfile, 
    apiRegisterFace, 
    apiGetDepartments, 
    apiGetOnboardingChecklist 
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver'; // Import the animation hook

// Reusable component for displaying a field in view mode
const ProfileField = ({ icon: Icon, label, value }) => (
    <div>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>
        <div className="flex items-center mt-1">
            <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 flex-shrink-0" />
            <p className="text-slate-800 dark:text-slate-200">{value || 'N/A'}</p>
        </div>
    </div>
);

// Reusable component for an input field in edit mode
const InputField = ({ label, name, value, onChange, error, placeholder, type = 'text', as = 'input' }) => {
    const commonProps = {
        name, value, onChange, placeholder,
        className: `w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`
    };
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            {as === 'textarea' ? (<textarea {...commonProps} rows={3} />) : (<input type={type} {...commonProps} />)}
            {error && <p className="text-red-600 text-xs mt-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{error}</p>}
        </div>
    );
};

const MyProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [departmentName, setDepartmentName] = useState('N/A');
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [onboardingChecklist, setOnboardingChecklist] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (!loading) { // Only run after initial data has loaded
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading, activeTab]); // Rerun when tab changes
    // --- END OF ANIMATION LOGIC ---
    
    const getInitialState = (userData) => ({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        phone: userData?.phone || '',
        currentAddress: userData?.currentAddress || '',
        emergencyContactName: userData?.emergencyContactName || '',
        emergencyContactRelation: userData?.emergencyContactRelation || ''
    });

    const [formData, setFormData] = useState(getInitialState(null));
    const [errors, setErrors] = useState({});

    const fetchData = async () => {
        if (!user || !user.id) return;
        setLoading(true);
        try {
            const [profileRes, deptsRes, checklistRes] = await Promise.all([
                apiGetMyProfile(),
                apiGetDepartments(),
                apiGetOnboardingChecklist(user.id)
            ]);

            const profileData = profileRes.data;
            const departmentsData = deptsRes.data?.$values || [];
            const checklistData = checklistRes.data?.$values || [];

            setCurrentUser(profileData);
            setFormData(getInitialState(profileData));
            setOnboardingChecklist(checklistData);

            if (profileData.departmentId && departmentsData.length > 0) {
                const dept = departmentsData.find(d => d.id === profileData.departmentId);
                setDepartmentName(dept ? dept.name : 'Not Assigned');
            }
        } catch (error) {
            showToast("Failed to load your profile data.", "error");
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSave = async () => {
        try {
            const response = await apiUpdateMyProfile(formData);
            sessionStorage.setItem('ems_user', JSON.stringify(response.data));
            window.dispatchEvent(new Event('storageUpdated'));
            showToast('Profile updated successfully!');
            fetchData();
            setIsEditing(false);
        } catch (error) {
            showToast("Failed to update profile.", "error");
        }
    };
    
    const handleFaceRegistered = async (descriptor) => {
        try {
            const descriptorArray = Array.from(descriptor);
            await apiRegisterFace(descriptorArray);
            showToast('Face registered successfully!');
            fetchData();
        } catch (error) {
            showToast('Failed to register face.', 'error');
        }
        setIsFaceModalOpen(false);
    };

    const handleCancel = () => {
        setFormData(getInitialState(currentUser));
        setErrors({});
        setIsEditing(false);
    };
    
    const getRoleDisplayName = (role) => {
        const roleNames = { admin: 'Administrator', hr_manager: 'HR Manager', department_manager: 'Department Manager', employee: 'Employee' };
        return roleNames[role] || role;
    };
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.lastName}&background=14b8a6&color=fff&size=128&font-size=0.4`;

    if (loading) return <LoadingSpinner message="Loading your profile..." />;
    if (!currentUser) return <EmptyState icon={User} title="Profile Not Found" message="Could not load your profile data. Please try refreshing the page." />;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
            <FaceRegistrationModal 
                isOpen={isFaceModalOpen}
                onClose={() => setIsFaceModalOpen(false)}
                onFaceRegistered={handleFaceRegistered}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">View and manage your personal information.</p>
                </div>
                <div className="flex items-center space-x-3">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2">
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors flex items-center space-x-2">
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6 fade-in-section">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="h-24 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                        <div className="p-6 pt-0 -mt-12 text-center">
                            <img src={avatarUrl} alt="Profile Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg mx-auto" />
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-3">{currentUser.firstName} {currentUser.lastName}</h2>
                            <p className="text-slate-600 dark:text-slate-400">{currentUser.designation || getRoleDisplayName(currentUser.role)}</p>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-4 text-sm">
                            <p className="flex items-center text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 mr-3 text-slate-400" /><span>{currentUser.email}</span></p>
                            <p className="flex items-center text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 mr-3 text-slate-400" /><span>{currentUser.phone || 'Not provided'}</span></p>
                            {currentUser.joinDate && <p className="flex items-center text-slate-600 dark:text-slate-400"><Calendar className="w-4 h-4 mr-3 text-slate-400" /><span>Joined on {new Date(currentUser.joinDate).toLocaleDateString()}</span></p>}
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                            {currentUser.faceDescriptor ? (
                                <div className="flex items-center justify-center text-green-600"><CheckCircle className="w-5 h-5 mr-2" /> <span className="font-semibold">Face Registered</span></div>
                            ) : (
                                <button onClick={() => setIsFaceModalOpen(true)} className="w-full flex items-center justify-center space-x-2 px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                    <Camera className="w-5 h-5"/><span>Register Your Face</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 fade-in-section">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="border-b border-slate-200 dark:border-slate-700">
                            <nav className="flex space-x-2 px-6">
                                {['personal', 'job', 'additional'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-1 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('job', 'Job').replace('personal', 'Personal').replace('additional', 'More Info')}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="p-6">
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {isEditing ? <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} /> : <ProfileField icon={User} label="First Name" value={currentUser.firstName} />}
                                    {isEditing ? <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} /> : <ProfileField icon={User} label="Last Name" value={currentUser.lastName} />}
                                    {isEditing ? <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} /> : <ProfileField icon={Phone} label="Phone Number" value={currentUser.phone} />}
                                    {isEditing ? <InputField label="Address" name="currentAddress" value={formData.currentAddress} onChange={handleChange} /> : <ProfileField icon={Building2} label="Address" value={currentUser.currentAddress} />}
                                </div>
                            )}
                            {activeTab === 'job' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ProfileField icon={Briefcase} label="Designation" value={currentUser.designation} />
                                    <ProfileField icon={Building2} label="Department" value={departmentName} />
                                    <ProfileField icon={DollarSign} label="Salary" value={currentUser.salary ? `$${currentUser.salary.toLocaleString()}` : 'N/A'} />
                                    {currentUser.joinDate && <ProfileField icon={Calendar} label="Join Date" value={new Date(currentUser.joinDate).toLocaleDateString()} />}
                                </div>
                            )}
                            {activeTab === 'additional' && (
                                <div className="space-y-6">
                                    {isEditing ? <InputField label="Bio" name="bio" value={formData.bio} onChange={handleChange} as="textarea" /> : <ProfileField icon={Info} label="Bio" value={currentUser.bio} />}
                                    {isEditing ? <InputField label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} /> : <ProfileField icon={User} label="Emergency Contact Name" value={currentUser.emergencyContactName} />}
                                    {isEditing ? <InputField label="Emergency Contact Relation" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} /> : <ProfileField icon={User} label="Emergency Contact Relation" value={currentUser.emergencyContactRelation} />}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;