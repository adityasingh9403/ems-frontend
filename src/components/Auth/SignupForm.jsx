import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/uiHelpers';

const SignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '', firstName: '', lastName: '', email: '', password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signupCompany } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const result = await signupCompany(
                formData.companyName, formData.firstName, formData.lastName,
                formData.email, formData.password
            );
            
            if (result.success) {
                showToast("Registration successful! Please log in with your new credentials.");
                navigate('/login');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-black flex flex-col justify-center items-center p-8 md:p-12 text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-4 border-gray-700">
                    <Building2 className="w-12 h-12 text-orange-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Create Your Workspace</h1>
                <p className="text-gray-400 text-lg max-w-sm">
                    Join hundreds of companies streamlining their HR processes with our platform.
                </p>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16">
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-semibold mb-2">Get Started</h2>
                    <p className="text-gray-400 mb-8">Create an admin account for your company.</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-300">{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-gray-800 pl-10 pr-4 py-3 border border-gray-700 rounded-lg" placeholder="Your Company Inc." required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-800 px-4 py-3 border border-gray-700 rounded-lg" placeholder="Alex" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-800 px-4 py-3 border border-gray-700 rounded-lg" placeholder="Doe" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Email (Admin)</label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-800 pl-10 pr-4 py-3 border border-gray-700 rounded-lg" placeholder="you@company.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                             <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-800 pl-10 pr-4 py-3 border border-gray-700 rounded-lg" placeholder="Min. 8 characters" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50">
                            {isLoading ? 'Creating Account...' : 'Sign Up & Create Company'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <button onClick={() => navigate('/login')} className="font-medium text-orange-500 hover:underline">
                                Login Here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
