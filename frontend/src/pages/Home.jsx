import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView/MapView';
import { reportService } from '../services/api';
import { FaCamera, FaLayerGroup, FaFilter } from 'react-icons/fa';

const Home = () => {
    const [latestAlert, setLatestAlert] = useState('Initializing system...');
    const [showHotspots, setShowHotspots] = useState(false);
    const [showReportsOnly, setShowReportsOnly] = useState(true); // Default to reports only since social has no coords
    const [confidence, setConfidence] = useState(0);

    // Fetch latest alert and overall confidence from backend
    useEffect(() => {
        const fetchLatestData = async () => {
            try {
                const result = await reportService.getReports();
                if (result && result.data && result.data.length > 0) {
                    // Find latest verified report for alert
                    const verifiedReports = result.data.filter(r => r.status === 'verified');
                    if (verifiedReports.length > 0) {
                        const latest = verifiedReports[0];
                        setLatestAlert(`${latest.hazard_type.toUpperCase()} detected near coast`);
                    } else {
                        setLatestAlert('Monitoring active - no verified hazards');
                    }

                    // Calculate average confidence
                    const avgConf = result.data.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / result.data.length;
                    setConfidence(Math.round(avgConf * 100));
                } else {
                    setLatestAlert('No hazard reports in system');
                    setConfidence(0);
                }
            } catch (error) {
                console.error('Error fetching latest data:', error);
                setLatestAlert('System offline - using cached data');
                setConfidence(0);
            }
        };

        fetchLatestData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLatestData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ position: 'relative', height: '100%' }}>

            {/* 1. Status Strip */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '0.25rem 1rem',
                zIndex: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)'
            }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    ⚠ {latestAlert.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    CONFIDENCE: {confidence}%
                </span>
            </div>

            {/* Map Container */}
            <div style={{ height: '100%', width: '100%' }}>
                <MapView showHotspots={showHotspots} />
            </div>

            {/* 2. Map Controls (Hotspot Toggle) */}
            <button
                onClick={() => setShowHotspots(!showHotspots)}
                style={{
                    position: 'absolute',
                    top: '50px',
                    right: '10px',
                    zIndex: 400,
                    background: showHotspots ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: showHotspots ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: '1px solid ' + (showHotspots ? 'var(--accent-cyan)' : 'var(--border-subtle)'),
                    borderRadius: 0,
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
                title="Toggle Hotspots"
            >
                <FaLayerGroup />
            </button>

            {/* Source Filter Toggle */}
            <button
                onClick={() => setShowReportsOnly(!showReportsOnly)}
                style={{
                    position: 'absolute',
                    top: '95px',
                    right: '10px',
                    zIndex: 400,
                    background: showReportsOnly ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: showReportsOnly ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: '1px solid ' + (showReportsOnly ? 'var(--accent-cyan)' : 'var(--border-subtle)'),
                    borderRadius: 0,
                    padding: '0 10px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em'
                }}
                title="Toggle Report Filter"
            >
                <FaFilter size={12} />
                {showReportsOnly ? 'REPORTS' : 'ALL'}
            </button>

            {/* 3. Floating Action Button (FAB) */}
            <Link
                to="/report"
                style={{
                    position: 'absolute',
                    bottom: '80px', // Above bottom nav
                    right: '20px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid var(--accent-cyan)',
                    color: 'var(--accent-cyan)',
                    width: '56px',
                    height: '56px',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--glow-cyan)',
                    animation: 'pulse-cyan 3s infinite'
                }}
            >
                <FaCamera size={24} />
            </Link>
        </div>
    );
};

export default Home;
