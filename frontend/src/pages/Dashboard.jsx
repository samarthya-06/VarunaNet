import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [myReports, setMyReports] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch only the current user's reports
            const result = await reportService.getMyReports();
            setMyReports((result.data || []).slice(0, 5));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load data. Backend may be offline.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <FaSpinner className="spin" size={32} style={{ color: 'var(--accent-cyan)' }} />
                <p className="text-muted" style={{ marginTop: '1rem' }}>LOADING_DATA...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '5rem', paddingTop: '1rem' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem'
            }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem' }}>DASHBOARD_//</h1>
            </header>

            {error && (
                <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--accent-violet)', padding: '1rem' }}>
                    <p style={{ color: 'var(--accent-violet)', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{error}</p>
                </div>
            )}

            {/* ═══════ CITIZEN VIEW ═══════ */}
            <div>
                <div className="metrics-panel" style={{ marginBottom: '2rem' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-dim)',
                        marginBottom: '1rem',
                        letterSpacing: '0.1em'
                    }}>
                        YOUR_REPORTS
                        <span style={{ float: 'right', color: 'var(--accent-cyan)' }}>{myReports.length}</span>
                    </div>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-cyan)',
                        textShadow: 'var(--glow-cyan)'
                    }}>
                        {myReports.length}
                    </div>
                    <p className="text-muted">Your submitted reports</p>
                </div>

                <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>RECENT_LOGS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myReports.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <p className="text-muted">No reports found. Create your first report!</p>
                        </div>
                    ) : (
                        myReports.map(r => (
                            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                        {(r.hazard_type || 'Unknown').toUpperCase()}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 8px',
                                    fontSize: '0.6rem',
                                    fontFamily: 'var(--font-mono)',
                                    border: '1px solid ' + (r.status === 'verified' ? 'var(--accent-cyan)' : 'var(--border-subtle)'),
                                    color: r.status === 'verified' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                                    textShadow: r.status === 'verified' ? 'var(--glow-cyan)' : 'none',
                                    letterSpacing: '0.05em'
                                }}>
                                    [{(r.status || 'pending').toUpperCase()}]
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
