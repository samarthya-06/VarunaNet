import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaCamera, FaChartBar, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import { reportService } from '../services/api';

const Landing = () => {
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
    const [coordinates] = useState({ lat: '19.0760', lon: '72.8777' }); // Mumbai

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await reportService.getReports();
                if (result?.data) {
                    const verified = result.data.filter(r => r.status === 'verified').length;
                    const pending = result.data.filter(r => r.status === 'pending').length;
                    setStats({ total: result.data.length, verified, pending });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid-overlay" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem 2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}></div>

                {/* Status Indicator */}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
                    <div className="status-online" style={{ marginBottom: '2rem' }}>
                        SYSTEM ONLINE
                    </div>

                    {/* Hero Title */}
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 5rem)',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.05em',
                        lineHeight: 1
                    }}>
                        VARUNA_NET
                    </h1>

                    {/* Tagline */}
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--text-muted)',
                        maxWidth: '500px',
                        marginBottom: '3rem',
                        fontFamily: 'var(--font-sans)',
                        lineHeight: 1.7
                    }}>
                        Crowdsourced ocean hazard reporting with real-time social media
                        intelligence for coastal safety. Forensic analysis of maritime
                        threats in real-time.
                    </p>

                    {/* CTA Button */}
                    <Link to="/map" className="btn" style={{
                        padding: '1rem 2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        INITIALIZE SEQUENCE <FaArrowRight size={12} />
                    </Link>
                </div>

                {/* Coordinates Display - Bottom Right */}
                <div className="coords-display" style={{
                    position: 'absolute',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 2
                }}>
                    <div className="label">COORDS: {coordinates.lat}° N, {coordinates.lon}° W</div>
                    <div>NET_STATUS: STABLE</div>
                </div>

                {/* Scroll Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                }}>
                    <div style={{
                        width: '1px',
                        height: '40px',
                        background: 'linear-gradient(to bottom, var(--accent-cyan), transparent)'
                    }}></div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CORE MODULES SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section style={{
                padding: '6rem 2rem',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '4rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '1rem'
                }}>
                    <h2 style={{ margin: 0 }}>CORE_MODULES</h2>
                    <Link to="/feed" style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.05em'
                    }}>
                        LIVE_FEED
                    </Link>
                </div>

                {/* Module 01 */}
                <div className="numbered-section">
                    <div className="number">01 //</div>
                    <div className="content">
                        <h3>REAL-TIME MAPPING</h3>
                        <p>
                            Interactive map with live hazard reports and hotspot detection.
                            Autonomous identification of danger patterns using spatial clustering.
                        </p>
                    </div>
                </div>

                {/* Module 02 */}
                <div className="numbered-section">
                    <div className="number">02 //</div>
                    <div className="content">
                        <h3>INSTANT REPORTING</h3>
                        <p>
                            Submit reports with photo and GPS in just 2 taps.
                            High-fidelity geolocation with offline queue capability.
                        </p>
                    </div>
                </div>

                {/* Module 03 */}
                <div className="numbered-section">
                    <div className="number">03 //</div>
                    <div className="content">
                        <h3>NLP INTELLIGENCE</h3>
                        <p>
                            Social media monitoring with NLP-powered hazard detection.
                            Sub-millisecond classification of public channel data streams.
                        </p>
                    </div>
                </div>

                {/* Module 04 */}
                <div className="numbered-section">
                    <div className="number">04 //</div>
                    <div className="content">
                        <h3>VERIFICATION PROTOCOL</h3>
                        <p>
                            Official verification workflow with confidence scoring.
                            Multi-layer validation from citizen to authority.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SYSTEM METRICS SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section style={{
                padding: '4rem 2rem',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Stats Card */}
                    <div className="metrics-panel">
                        <div style={{
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-dim)',
                            marginBottom: '1rem',
                            letterSpacing: '0.1em'
                        }}>
                            SYSTEM_METRICS
                            <span style={{ float: 'right', color: 'var(--accent-cyan)' }}>OPTIMAL</span>
                        </div>
                        <div className="metrics-row">
                            <span className="label">Total Reports</span>
                            <span className="value">{stats.total}</span>
                        </div>
                        <div className="metrics-row">
                            <span className="label">Verified</span>
                            <span className="value" style={{ color: 'var(--accent-green)' }}>{stats.verified}</span>
                        </div>
                        <div className="metrics-row">
                            <span className="label">Pending</span>
                            <span className="value" style={{ color: 'var(--accent-violet)' }}>{stats.pending}</span>
                        </div>
                    </div>

                    {/* Network Status */}
                    <div className="metrics-panel">
                        <div style={{
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-dim)',
                            marginBottom: '1rem',
                            letterSpacing: '0.1em'
                        }}>
                            NETWORK_STATUS
                            <span style={{ float: 'right', color: 'var(--accent-green)' }}>CONNECTED</span>
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
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CTA SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section style={{
                padding: '6rem 2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border-subtle)'
            }}>
                <h2 style={{ marginBottom: '1rem' }}>JOIN_NETWORK</h2>
                <p className="text-muted" style={{
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    margin: '0 auto 2rem'
                }}>
                    Initialize your connection. Report hazards. Protect coasts.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/auth" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
                        GET STARTED
                    </Link>
                    <Link to="/map" className="btn btn-secondary" style={{ padding: '1rem 2.5rem' }}>
                        <FaMapMarkedAlt /> VIEW MAP
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════════════ */}
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border-subtle)',
                color: 'var(--text-dim)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
            }}>
                <p style={{ margin: 0 }}>VARUNANET // COASTAL HAZARD INTELLIGENCE</p>
                <p style={{ opacity: 0.5, marginTop: '0.5rem' }}>© 2026 All rights reserved</p>
            </footer>
        </div>
    );
};

export default Landing;
