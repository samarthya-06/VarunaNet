import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Set auth header when token changes
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Check auth status when token changes
    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setLoading(false);
                setUser(null);
                return;
            }

            // IMPORTANT: Set loading true to signal we're fetching profile
            setLoading(true);

            try {
                const response = await api.get('/auth/profile');
                setUser(response.data.data);
            } catch (error) {
                // Token invalid, clear it
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        setToken(response.data.data.token);
        setUser(response.data.data.user);
        return response.data;
    };

    const register = async (email, password, name) => {
        const response = await api.post('/auth/register', { email, password, name });
        setToken(response.data.data.token);
        setUser(response.data.data.user);
        return response.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    // Allow external token setting (for OAuth callback)
    const setAuthToken = (newToken) => {
        setToken(newToken);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        setAuthToken,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
