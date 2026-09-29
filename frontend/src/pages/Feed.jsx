import React, { useState, useEffect } from 'react';
import api, { reportService } from '../services/api';
import { FaSpinner, FaCamera, FaTwitter } from 'react-icons/fa';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                // Fetch both social and reports data
                const [socialRes, reportsRes] = await Promise.all([
                    api.get('/social'),
                    reportService.getReports()
                ]);

                // Process social posts
                const socialPosts = (socialRes.data.data || []).map(post => ({
                    ...post,
                    source: 'social',
                    sortDate: new Date(post.timestamp || Date.now())
                }));

                // Process reports
                const reportPosts = (reportsRes.data || []).map(report => ({
                    id: `report-${report.id}`,
                    source: 'report',
                    hazard_type: report.hazard_type,
                    description: report.description,
                    image_url: report.image_url,
                    status: report.status,
                    latitude: report.latitude,
                    longitude: report.longitude,
                    confidence_score: report.confidence_score,
                    sortDate: new Date(report.createdAt || Date.now()),
                    createdAt: report.createdAt
                }));

                // Merge and sort by date (newest first)
                const merged = [...socialPosts, ...reportPosts].sort(
                    (a, b) => b.sortDate - a.sortDate
                );

                setPosts(merged);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <FaSpinner className="spin" size={32} style={{ color: 'var(--accent-cyan)' }} />
                <p className="text-muted" style={{ marginTop: '1rem' }}>SCANNING_CHANNELS...</p>
            </div>
        );
    }

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${imageUrl}`;
    };

    return (
        <div className="container" style={{ paddingBottom: '5rem', paddingTop: '1rem' }}>
            {/* Header */}
            <header style={{
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '0.5rem' }}>UNIFIED_FEED_//</h1>
                    <p className="status-online" style={{ margin: 0 }}>
                        REPORTS + SOCIAL_INTELLIGENCE
                    </p>
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--accent-violet)',
                    animation: 'pulse-cyan 2s infinite'
                }}>
                    LIVE_FEED
                </span>
            </header>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {posts.map((post, index) => (
                    <div key={post.id} className="card" style={{
                        padding: '1rem',
                        position: 'relative',
                        overflow: 'hidden',
                        borderLeft: post.source === 'report'
                            ? '2px solid var(--accent-cyan)'
                            : '2px solid var(--accent-violet)'
                    }}>
                        {/* Source Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.6rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '3px 8px',
                            border: `1px solid ${post.source === 'report' ? 'var(--accent-cyan)' : 'var(--accent-violet)'}`,
                            color: post.source === 'report' ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                            background: post.source === 'report' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(167, 139, 250, 0.1)',
                            letterSpacing: '0.05em'
                        }}>
                            {post.source === 'report' ? <FaCamera size={8} /> : <FaTwitter size={8} />}
                            {post.source === 'report' ? 'REPORT' : 'SOCIAL'}
                        </div>

                        {/* Post Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingRight: '70px' }}>
                            <span style={{
                                fontSize: '0.65rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-dim)',
                                letterSpacing: '0.05em'
                            }}>
                                {post.source === 'report'
                                    ? `TYPE: ${(post.hazard_type || 'UNKNOWN').toUpperCase()}`
                                    : `USER_ID: ${post.user}`
                                }
                            </span>
                            <span style={{
                                fontSize: '0.65rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-dim)'
                            }}>
                                {post.source === 'report' && post.status && (
                                    <span style={{
                                        color: post.status === 'verified' ? 'var(--accent-cyan)' : 'var(--accent-violet)'
                                    }}>
                                        [{post.status.toUpperCase()}]
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Image for Reports */}
                        {post.source === 'report' && post.image_url && (
                            <div id={`img-container-${post.id}`} style={{ marginBottom: '0.75rem' }}>
                                <a
                                    href={getImageUrl(post.image_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={getImageUrl(post.image_url)}
                                        alt="Report evidence"
                                        style={{
                                            width: '100%',
                                            maxHeight: '150px',
                                            objectFit: 'cover',
                                            border: '1px solid var(--border-subtle)'
                                        }}
                                        onError={(e) => {
                                            // Hide the entire parent container when image fails
                                            e.target.closest('div[id^="img-container"]').style.display = 'none';
                                        }}
                                    />
                                </a>
                            </div>
                        )}

                        {/* Post Content */}
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            lineHeight: 1.6,
                            color: 'var(--text-primary)'
                        }}>
                            {post.source === 'report' ? post.description : post.text}
                        </p>

                        {/* Analysis Data (Social only) */}
                        {post.source === 'social' && post.analysis && (
                            <div style={{
                                background: 'rgba(5, 5, 16, 0.4)',
                                padding: '0.75rem',
                                borderTop: '1px dashed var(--border-subtle)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {/* Keywords */}
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {(post.analysis.keywordsFound || []).map(k => (
                                            <span key={k} style={{
                                                color: 'var(--accent-cyan)',
                                                fontSize: '0.6rem',
                                                border: '1px solid var(--accent-cyan)',
                                                padding: '2px 6px',
                                                fontFamily: 'var(--font-mono)',
                                                letterSpacing: '0.05em',
                                                textShadow: 'var(--glow-cyan)'
                                            }}>
                                                {k.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Confidence */}
                                    <div style={{
                                        fontSize: '0.65rem',
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--accent-violet)',
                                        letterSpacing: '0.05em'
                                    }}>
                                        CONFIDENCE: {(post.analysis.confidence * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Location Data (Reports only) */}
                        {post.source === 'report' && (
                            <div style={{
                                background: 'rgba(0, 217, 255, 0.05)',
                                padding: '0.6rem 0.75rem',
                                borderTop: '1px solid var(--border-subtle)',
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                {/* Coordinates */}
                                {post.latitude && post.longitude && (
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        📍 {post.latitude.toFixed(4)}, {post.longitude.toFixed(4)}
                                    </span>
                                )}
                                {/* Date */}
                                <span style={{
                                    color: 'var(--accent-cyan)',
                                    textShadow: 'var(--glow-cyan)'
                                }}>
                                    📅 {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'No date'}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="text-muted">No intelligence data available.</p>
                </div>
            )}
        </div>
    );
};

export default Feed;
