import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaUser, FaLock, FaEnvelope, FaWater, FaArrowLeft } from 'react-icons/fa';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                result = await register(email, password, name);
            }
            // Redirect based on user role
            const userRole = result?.data?.user?.role;
            if (userRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-deep)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <header style={{
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)'
            }}>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    <FaWater size={24} color="var(--accent-cyan)" />
                    <h2 style={{ margin: 0, fontSize: '1rem', letterSpacing: '0.1rem', color: 'var(--text-primary)' }}>
                        VARUNA<span style={{ color: 'var(--accent-cyan)' }}>NET</span>
                    </h2>
                </button>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)'
                }}>
                    <FaArrowLeft size={12} /> BACK
                </Link>
            </header>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.5rem' }}>{isLogin ? 'SYSTEM_LOGIN' : 'NEW_USER'} //</h1>
                        <p className="text-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--accent-cyan)' }}>●</span> {isLogin ? 'AUTHENTICATE_TO_ACCESS' : 'CREATE_ACCOUNT'}
                        </p>
                    </header>

                    {error && (
                        <div className="card" style={{ marginBottom: '1rem', borderColor: '#EF4444', padding: '0.75rem' }}>
                            <p style={{ color: '#EF4444', margin: 0, fontSize: '0.85rem' }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {!isLogin && (
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                                    <FaUser /> NAME
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-void)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-subtle)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                                <FaEnvelope /> EMAIL
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-void)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                                <FaLock /> PASSWORD
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-void)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button type="submit" className="btn" disabled={loading} style={{ width: '100%', letterSpacing: '0.1em' }}>
                            {loading ? <><FaSpinner className="spin" /> PROCESSING...</> : (isLogin ? 'AUTHENTICATE' : 'CREATE_ACCOUNT')}
                        </button>

                        {/* Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            margin: '0.5rem 0'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                        </div>

                        {/* Google Login Button */}
                        <a
                            href="http://localhost:3000/api/auth/google"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-void)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            CONTINUE WITH GOOGLE
                        </a>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-cyan)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                textDecoration: 'underline'
                            }}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
