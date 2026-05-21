import { useState, useCallback, useEffect } from 'react';
import * as userService from '@/services/userService';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) return;

        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsLoggedIn(true);
        } catch {
            localStorage.removeItem('user');
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const login = useCallback(async (username) => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.login(username);
            setUser(response);
            setIsLoggedIn(true);
            localStorage.setItem('user', JSON.stringify(response));
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.register(userData);
            const normalizedUser = response?.data || response;

            setUser(normalizedUser);
            setIsLoggedIn(true);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            return normalizedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCurrentUser = useCallback((updatedFields) => {
        setUser((prev) => {
            if (!prev) return prev;

            const nextUser = {
                ...prev,
                ...updatedFields,
                appearance: updatedFields.appearance
                    ? {
                        ...prev.appearance,
                        ...updatedFields.appearance
                    }
                    : prev.appearance
            };
            localStorage.setItem('user', JSON.stringify(nextUser));
            return nextUser;
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                loading,
                error,
                login,
                register,
                logout,
                clearError,
                updateCurrentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
