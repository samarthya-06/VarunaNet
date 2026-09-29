/**
 * Notification Service
 * Business logic for creating and sending notifications
 */

const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Report = require('../models/report.model');
const logger = require('../config/logger');

// Store Socket.io instance (set by index.js)
let io = null;

const setSocketIO = (socketIO) => {
    io = socketIO;
    logger.info('Socket.IO instance set in notification service');
};

/**
 * Create a notification and send real-time if socket connected
 */
const createNotification = async (userId, type, title, message, metadata = {}) => {
    try {
        const notification = await Notification.create({
            user_id: userId,
            type,
            title,
            message,
            metadata
        });

        logger.info({ userId, type, title }, 'Notification created');

        // Send real-time notification if socket.io is set
        if (io) {
            io.to(`user_${userId}`).emit('notification', {
                id: notification.id,
                type,
                title,
                message,
                metadata,
                is_read: false,
                created_at: notification.createdAt
            });
            logger.info({ userId }, 'Real-time notification sent');
        }

        return notification;
    } catch (error) {
        logger.error({ error: error.message, userId }, 'Failed to create notification');
        throw error;
    }
};

/**
 * Notify user when their report status changes
 */
const notifyReportStatusChange = async (report, newStatus) => {
    if (!report.user_id) {
        logger.info('Anonymous report, skipping notification');
        return null;
    }

    const typeMap = {
        'verified': 'report_verified',
        'dismissed': 'report_rejected'
    };

    const type = typeMap[newStatus];
    if (!type) return null;

    const titleMap = {
        'verified': '✅ Report Verified!',
        'dismissed': '❌ Report Dismissed'
    };

    const messageMap = {
        'verified': `Your ${report.hazard_type} report has been verified by an official.`,
        'dismissed': `Your ${report.hazard_type} report was dismissed. It may be a duplicate or false report.`
    };

    return createNotification(
        report.user_id,
        type,
        titleMap[newStatus],
        messageMap[newStatus],
        { report_id: report.id, hazard_type: report.hazard_type }
    );
};

/**
 * Notify users near a newly verified hazard
 * @param {Report} report - The verified report
 * @param {number} radiusKm - Radius in kilometers (default 5km)
 */
const notifyNearbyUsers = async (report, radiusKm = 5) => {
    try {
        // Get all reports from other users within radius to find active users in area
        // For MVP, we notify all users (can be enhanced with user location tracking)
        const users = await User.findAll({
            where: {
                id: { [require('sequelize').Op.ne]: report.user_id || 0 }
            },
            attributes: ['id'],
            limit: 100
        });

        const notifications = [];
        for (const user of users) {
            const notif = await createNotification(
                user.id,
                'nearby_hazard',
                '⚠️ Nearby Hazard Alert',
                `A ${report.hazard_type} hazard has been verified in your area.`,
                {
                    report_id: report.id,
                    hazard_type: report.hazard_type,
                    latitude: report.latitude,
                    longitude: report.longitude
                }
            );
            notifications.push(notif);
        }

        logger.info({ count: notifications.length, reportId: report.id }, 'Nearby users notified');
        return notifications;
    } catch (error) {
        logger.error({ error: error.message }, 'Failed to notify nearby users');
        return [];
    }
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, limit = 20, offset = 0) => {
    return Notification.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId }
    });

    if (!notification) {
        return null;
    }

    notification.is_read = true;
    await notification.save();
    return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    await Notification.update(
        { is_read: true },
        { where: { user_id: userId, is_read: false } }
    );
    return true;
};

/**
 * Get unread count for a user
 */
const getUnreadCount = async (userId) => {
    return Notification.count({
        where: { user_id: userId, is_read: false }
    });
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
    const result = await Notification.destroy({
        where: { id: notificationId, user_id: userId }
    });
    return result > 0;
};

module.exports = {
    setSocketIO,
    createNotification,
    notifyReportStatusChange,
    notifyNearbyUsers,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification
};
