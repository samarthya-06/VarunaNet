import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

/**
 * OAuth Callback Handler
 * Receives token from backend after Google OAuth and saves it
 */
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthToken, user, loading } = useAuth();
    const [status, setStatus] = useState('processing');
    const [tokenSet, setTokenSet] = useState(false);

    // Step 1: Extract and set token on mount
    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        console.log('AuthCallback: Processing OAuth callback', { token: !!token, error });

        if (error) {
            console.error('AuthCallback: OAuth error', error);
            setStatus('error');
            navigate('/auth?error=' + error);
            return;
        }

        if (token) {
            console.log('AuthCallback: Token received, saving to auth context');
            // Save token to localStorage
            localStorage.setItem('token', token);
            // Update AuthContext - this will trigger profile fetch
            setAuthToken(token);
            setTokenSet(true);
        } else {
            console.error('AuthCallback: No token received');
            setStatus('error');
            navigate('/auth?error=no_token');
        }
    }, [searchParams, navigate, setAuthToken]);

    // Step 2: Wait for user to be loaded, then redirect
    useEffect(() => {
        if (tokenSet && !loading) {
            if (user) {
                console.log('AuthCallback: User loaded, redirecting based on role');
                setStatus('success');
                // Redirect based on role
                const destination = user.role === 'admin' ? '/admin' : '/dashboard';
                setTimeout(() => {
                    navigate(destination, { replace: true });
                }, 500);
            } else {
                // Token was set but user is null - token might be invalid
                console.error('AuthCallback: Token set but no user loaded');
                setStatus('error');
                localStorage.removeItem('token');
                navigate('/auth?error=invalid_token');
            }
        }
    }, [tokenSet, loading, user, navigate]);

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
                {status === 'processing' && 'AUTHENTICATING...'}
                {status === 'success' && 'SUCCESS! REDIRECTING...'}
                {status === 'error' && 'ERROR. REDIRECTING...'}
            </span>
        </div>
    );
};

export default AuthCallback;
