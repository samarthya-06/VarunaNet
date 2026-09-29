/**
 * Notification Bell Component
 * Shows notification icon with unread badge and dropdown panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheck, FaTimes, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'report_verified':
                return <FaCheckCircle style={{ color: '#22C55E' }} />;
            case 'report_rejected':
                return <FaTimesCircle style={{ color: '#EF4444' }} />;
            case 'nearby_hazard':
                return <FaExclamationTriangle style={{ color: '#F59E0B' }} />;
            default:
                return <FaBell style={{ color: 'var(--accent-cyan)' }} />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <FaBell size={20} color={unreadCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#EF4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '340px',
                    maxHeight: '400px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                            letterSpacing: '0.05em'
                        }}>
                            NOTIFICATIONS
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-cyan)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem'
                                }}
                            >
                                MARK ALL READ
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div style={{
                        maxHeight: '320px',
                        overflowY: 'auto'
                    }}>
                        {loading && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Loading...
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem'
                            }}>
                                No notifications yet
                            </div>
                        )}

                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    background: notification.is_read ? 'transparent' : 'rgba(0, 255, 255, 0.05)',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {/* Icon */}
                                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                    {getTypeIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: notification.is_read ? 400 : 600,
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {notification.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '0.25rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {notification.message}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-dim)',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        {formatTime(notification.created_at)}
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-dim)',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        opacity: 0.5,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0.5}
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
