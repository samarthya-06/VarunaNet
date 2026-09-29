import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to /auth if user is not logged in
 * Optionally checks for required role (e.g., 'admin')
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth status
    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-deep)',
                gap: '1rem'
            }}>
                <FaSpinner className="spin" size={32} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--text-dim)',
                    letterSpacing: '0.1em'
                }}>
                    AUTHENTICATING...
                </span>
            </div>
        );
    }

    // Redirect to auth page if not authenticated
    if (!isAuthenticated) {
        // Save the attempted location for redirect after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Check for required role
    if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have required role, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Render protected content
    return children;
};

export default ProtectedRoute;

