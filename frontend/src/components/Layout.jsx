import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../index.css';

const Layout = () => {
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Map', path: '/map' },
        { label: 'Report', path: '/report' },
        { label: 'Feed', path: '/feed' },
        { label: 'Dash', path: '/dashboard' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* ═══════════════════════════════════════════════════════════════
                TOP BAR
            ═══════════════════════════════════════════════════════════════ */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '0.75rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
                zIndex: 1000,
                position: 'sticky',
                top: 0
            }}>
                {/* Logo - Reload current page */}
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
                    <div style={{
                        width: 8,
                        height: 8,
                        background: 'var(--accent-cyan)',
                        borderRadius: '50%',
                        boxShadow: 'var(--glow-cyan)',
                        animation: 'pulse-dot 2s ease-in-out infinite'
                    }}></div>
                    <h2 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                        VARUNA<span style={{ color: 'var(--accent-cyan)' }}>_NET</span>
                    </h2>
                </button>

                {/* Right Side */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Global Notifications */}
                    {isAuthenticated && <NotificationBell />}

                    {/* Network Status */}
                    <span className="status-online" style={{
                        fontSize: '0.65rem',
                        display: window.innerWidth < 500 ? 'none' : 'inline-flex'
                    }}>
                        CONNECTED
                    </span>

                    {isAuthenticated ? (
                        <>
                            <span style={{
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-dim)'
                            }}>
                                {user?.name || user?.email?.split('@')[0]}
                            </span>
                            <button
                                onClick={logout}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-muted)',
                                    padding: '0.4rem 0.6rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.05em',
                                    transition: 'var(--transition)'
                                }}
                            >
                                <FaSignOutAlt size={10} /> EXIT
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/auth"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                border: '1px solid var(--accent-cyan)',
                                padding: '0.4rem 0.8rem',
                                color: 'var(--accent-cyan)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                letterSpacing: '0.05em',
                                transition: 'var(--transition)'
                            }}
                        >
                            <FaUser size={10} /> LOGIN
                        </Link>
                    )}
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════════════════════════ */}
            <main style={{
                flex: 1,
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: '70px'
            }} className="scanline">
                <Outlet />
            </main>

            {/* ═══════════════════════════════════════════════════════════════
                BOTTOM NAVIGATION
            ═══════════════════════════════════════════════════════════════ */}
            <nav style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '0.5rem 0',
                display: 'flex',
                justifyContent: 'space-around',
                borderTop: '1px solid var(--border-subtle)',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000
            }}>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 16px',
                            color: isActive(item.path) ? 'var(--accent-cyan)' : 'var(--text-dim)',
                            fontWeight: isActive(item.path) ? '600' : '400',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            textShadow: isActive(item.path) ? 'var(--glow-cyan)' : 'none',
                            transition: 'var(--transition)',
                            position: 'relative'
                        }}
                    >
                        {/* Active Indicator Line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: isActive(item.path) ? '20px' : '0px',
                            height: '2px',
                            background: 'var(--accent-cyan)',
                            boxShadow: isActive(item.path) ? 'var(--glow-cyan)' : 'none',
                            transition: 'width 0.3s ease'
                        }}></div>
                        <span>{item.label.toUpperCase()}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
