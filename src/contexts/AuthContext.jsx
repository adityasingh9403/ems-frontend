import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../apiService';
import { showToast } from '../utils/uiHelpers';

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This effect runs once on app startup to load the user from session storage
    useEffect(() => {
        const savedUserString = sessionStorage.getItem('ems_user');
        if (savedUserString && savedUserString !== 'undefined') {
            try {
                setUser(JSON.parse(savedUserString));
            } catch (error) {
                console.error("Failed to parse user from sessionStorage:", error);
                sessionStorage.removeItem('ems_user');
            }
        }
        setIsLoading(false);
    }, []);

    // Inside AuthContext.jsx

    const login = async (email, password, companyId) => {
        setIsLoading(true);
        try {
            const response = await apiLogin({ email, password, companyCode: companyId });

            const { token, user: userData } = response.data;

            setUser(userData);
            sessionStorage.setItem('ems_user', JSON.stringify(userData));
            // --- FIX: Always save the token, even for Super Admin ---
            sessionStorage.setItem('ems_token', token);

            return { success: true };

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('ems_user');
        sessionStorage.removeItem('ems_token');
    };

    const signupCompany = async (companyName, adminFirstName, adminLastName, adminEmail, adminPassword) => {
        setIsLoading(true);
        try {
            await apiRegister({
                companyName,
                firstName: adminFirstName,
                lastName: adminLastName,
                email: adminEmail,
                password: adminPassword
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data || "Registration failed. The company or email might already exist.";
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, signupCompany }}>
            {children}
        </AuthContext.Provider>
    );
};