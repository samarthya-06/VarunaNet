import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { reportService, analyticsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes, FaSpinner, FaSignOutAlt, FaShieldAlt, FaImage } from 'react-icons/fa';

const AdminPanel = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Moderation data
    const [pendingReports, setPendingReports] = useState([]);
    const [processingId, setProcessingId] = useState(null);

    // Analytics data
    const [analyticsData, setAnalyticsData] = useState([]);
    const [totalReports, setTotalReports] = useState(0);
    const [avgConfidence, setAvgConfidence] = useState(0);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch both moderation and analytics data
            const [reportsResult, analyticsResult] = await Promise.all([
                reportService.getPendingReports(),
                analyticsService.getKeywordTrends()
            ]);

            setPendingReports(reportsResult.data || []);

            if (analyticsResult.data) {
                setAnalyticsData(analyticsResult.data.hazardTypes || []);
                setTotalReports(analyticsResult.data.totalReports || 0);
                setAvgConfidence(analyticsResult.data.avgConfidence || 0);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to load data. Backend may be offline.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        setProcessingId(id);
        try {
            await reportService.verifyReport(id, status);
            setPendingReports(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Error verifying report:', err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    // Helper to construct full image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${imageUrl}`;
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <FaSpinner className="spin" size={32} style={{ color: 'var(--accent-cyan)' }} />
                <p className="text-muted" style={{ marginTop: '1rem' }}>LOADING_ADMIN_DATA...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
            {/* Admin Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FaShieldAlt size={20} color="var(--accent-cyan)" />
                    <h1 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                        ADMIN<span style={{ color: 'var(--accent-cyan)' }}>_PANEL</span>
                    </h1>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid var(--accent-red)',
                        color: 'var(--accent-red)',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em'
                    }}
                >
                    <FaSignOutAlt /> LOGOUT
                </button>
            </header>

            <div className="container" style={{ paddingBottom: '2rem', paddingTop: '1.5rem' }}>
                {error && (
                    <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--accent-red)', padding: '1rem' }}>
                        <p style={{ color: 'var(--accent-red)', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{error}</p>
                    </div>
                )}

                {/* Analytics Overview */}
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                        ANALYTICS_OVERVIEW
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="metrics-panel">
                            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>TOTAL_REPORTS</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{totalReports}</div>
                        </div>
                        <div className="metrics-panel">
                            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>AVG_CONFIDENCE</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{avgConfidence}%</div>
                        </div>
                    </div>

                    <div className="card" style={{ height: 240, padding: '1.25rem' }}>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            HAZARD_TREND_ANALYSIS
                        </h3>
                        {analyticsData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                                <p className="text-muted">No data available</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={analyticsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 150, 200, 0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-dim)"
                                        tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                                    />
                                    <YAxis
                                        stroke="var(--text-dim)"
                                        tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(10, 14, 39, 0.95)',
                                            border: '1px solid var(--accent-cyan)',
                                            borderRadius: 0,
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.8rem'
                                        }}
                                        itemStyle={{ color: 'var(--accent-cyan)' }}
                                    />
                                    <Bar dataKey="count" fill="var(--accent-cyan)" radius={0} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                {/* Moderation Queue */}
                <section>
                    <h2 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                        MODERATION_QUEUE
                        <span style={{ marginLeft: '0.75rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            [{pendingReports.length} PENDING]
                        </span>
                    </h2>
                    {pendingReports.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>✓ QUEUE_CLEAR</h3>
                            <p className="text-muted">No pending reports for review.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {pendingReports.map(report => (
                                <div key={report.id} className="card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                                            {(report.hazard_type || 'Unknown').toUpperCase()}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            ID: {report.id}
                                            {report.image_url && (
                                                <span style={{
                                                    background: 'rgba(0, 217, 255, 0.2)',
                                                    border: '1px solid var(--accent-cyan)',
                                                    padding: '2px 6px',
                                                    fontSize: '0.55rem',
                                                    color: 'var(--accent-cyan)'
                                                }}>
                                                    📷 HAS_IMAGE
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {report.description || 'No description provided'}
                                    </p>

                                    {/* Image Section */}
                                    {report.image_url && (
                                        <div style={{
                                            margin: '0.75rem 0',
                                            padding: '0.5rem',
                                            background: 'rgba(0, 217, 255, 0.05)',
                                            border: '1px solid var(--border-subtle)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem',
                                                fontSize: '0.65rem',
                                                fontFamily: 'var(--font-mono)',
                                                color: 'var(--accent-cyan)'
                                            }}>
                                                <FaImage size={10} />
                                                ATTACHED_EVIDENCE
                                            </div>
                                            <a
                                                href={getImageUrl(report.image_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Click to view full image"
                                            >
                                                <img
                                                    src={getImageUrl(report.image_url)}
                                                    alt="Report evidence"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '150px',
                                                        objectFit: 'cover',
                                                        border: '1px solid var(--accent-cyan)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.parentElement.parentElement.style.display = 'none';
                                                    }}
                                                />
                                            </a>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                            📍 {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleVerify(report.id, 'verified')}
                                                disabled={processingId === report.id}
                                                style={{
                                                    background: 'rgba(16, 185, 129, 0.15)',
                                                    border: '1px solid var(--accent-green)',
                                                    color: 'var(--accent-green)',
                                                    padding: '0.5rem 0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.7rem',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                {processingId === report.id ? <FaSpinner className="spin" size={10} /> : <FaCheck size={10} />} VERIFY
                                            </button>
                                            <button
                                                onClick={() => handleVerify(report.id, 'dismissed')}
                                                disabled={processingId === report.id}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    border: '1px solid var(--accent-red)',
                                                    color: 'var(--accent-red)',
                                                    padding: '0.5rem 0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.7rem',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                {processingId === report.id ? <FaSpinner className="spin" size={10} /> : <FaTimes size={10} />} DISMISS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* System Status */}
                <section style={{ marginTop: '2rem' }}>
                    <div className="metrics-panel">
                        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                            SYSTEM_HEALTH
                        </div>
                        <div className="metrics-row">
                            <span className="label">NLP Pipeline</span>
                            <span className="value" style={{ color: 'var(--accent-green)' }}>Active</span>
                        </div>
                        <div className="metrics-row">
                            <span className="label">Database</span>
                            <span className="value" style={{ color: 'var(--accent-green)' }}>Connected</span>
                        </div>
                        <div className="metrics-row">
                            <span className="label">Hotspot Engine</span>
                            <span className="value" style={{ color: 'var(--accent-green)' }}>Ready</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminPanel;
