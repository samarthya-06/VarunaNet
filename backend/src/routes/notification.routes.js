/**
 * Notification Routes
 * API endpoints for user notifications
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get user's notifications (paginated)
 */
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const offset = parseInt(req.query.offset) || 0;

        const { rows, count } = await notificationService.getUserNotifications(
            req.user.id,
            limit,
            offset
        );

        const unreadCount = await notificationService.getUnreadCount(req.user.id);

        res.json({
            status: 'success',
            data: {
                notifications: rows,
                total: count,
                unread_count: unreadCount,
                limit,
                offset
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications'
        });
    }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        res.json({
            status: 'success',
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get unread count'
        });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(
            parseInt(req.params.id),
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found'
            });
        }

        res.json({
            status: 'success',
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark as read'
        });
    }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark all as read'
        });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await notificationService.deleteNotification(
            parseInt(req.params.id),
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Notification deleted'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete notification'
        });
    }
});

module.exports = router;
