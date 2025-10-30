import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
    const navigate = useNavigate();
    const [companyId, setCompanyId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await login(email, password, companyId);
            
            if (result.success) {
                // On successful login, navigate to the default route.
                // App.jsx will then handle redirecting to the correct dashboard.
                navigate('/');
            } else {
                // On failure, show the error message
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-black flex flex-col justify-center items-center p-8 md:p-12 text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-4 border-gray-700">
                    <Building2 className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Employee Management</h1>
                <p className="text-gray-400 text-lg">The central hub for your organization's talent.</p>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16">
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-semibold mb-2">Welcome Back</h2>
                    <p className="text-gray-400 mb-8">Sign in to continue to your dashboard.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-300">{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Company ID</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input id="companyId" type="text" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full bg-gray-800 pl-10 pr-4 py-3 border border-gray-700 rounded-lg" placeholder="e.g., my-awesome-college" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 pl-10 pr-4 py-3 border border-gray-700 rounded-lg" placeholder="you@company.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 pl-10 pr-4 py-3 border border-gray-700 rounded-lg" placeholder="••••••••" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center justify-center">
                            {isLoading ? 'Verifying...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                setCompanyId('superadmin');
                                setEmail('superadmin@ems.com');
                                setPassword('superpassword');
                            }}
                            className="text-xs text-gray-400 hover:text-green-400 flex items-center justify-center gap-2 mx-auto"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Login as Super Admin
                        </button>
                    </div>
                    <div className="mt-10 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-400">
                            Want to register a new company?{' '}
                            <button
                                onClick={() => navigate('/signup')}
                                className="font-medium text-green-500 hover:underline"
                            >
                                Sign Up Here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginForm;

