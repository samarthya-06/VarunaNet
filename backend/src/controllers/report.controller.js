const { Op } = require('sequelize');
const Report = require('../models/report.model');
const logger = require('../config/logger');
const notificationService = require('../services/notification.service');

/**
 * Get reports with pagination and optional bbox filtering
 */
exports.getReports = async (req, res) => {
    try {
        const { bbox, page = 1, limit = 20 } = req.query;
        let whereClause = {};

        // Pagination params
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        // Handle Bounding Box Filtering
        // Format: bbox=minLon,minLat,maxLon,maxLat
        if (bbox) {
            const parts = bbox.split(',').map(Number);
            if (parts.length === 4 && parts.every(n => !isNaN(n))) {
                const [minLon, minLat, maxLon, maxLat] = parts;

                whereClause = {
                    longitude: {
                        [Op.between]: [minLon, maxLon]
                    },
                    latitude: {
                        [Op.between]: [minLat, maxLat]
                    }
                };
            }
        }

        // Get total count for pagination
        const total = await Report.count({ where: whereClause });

        const reports = await Report.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: limitNum,
            offset: offset
        });

        res.status(200).json({
            status: 'success',
            results: reports.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            data: reports
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching reports');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.createReport = async (req, res) => {
    try {
        const { type, description, lat, lon } = req.body;

        let imageUrl = null;
        if (req.file) {
            // Construct relative URL
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Validation (now handled by Zod, but keep as safety check)
        if (!type || !lat || !lon) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: type, lat, lon'
            });
        }

        // Use authenticated user's ID from JWT token (more secure than client-provided)
        const userId = req.user?.id || null;

        // Create Report
        const newReport = await Report.create({
            hazard_type: type,
            description,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            user_id: userId,
            image_url: imageUrl,
            status: 'pending'
        });

        logger.info({ reportId: newReport.id }, 'Report created successfully');

        res.status(201).json({
            status: 'success',
            data: newReport
        });

    } catch (error) {
        logger.error({ err: error }, 'Error creating report');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while creating report.'
        });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findByPk(id);

        if (!report) {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: report
        });
    } catch (error) {
        logger.error({ err: error, reportId: req.params.id }, 'Error fetching report');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.verifyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: newStatus } = req.body;

        if (!['verified', 'dismissed'].includes(newStatus)) {
            return res.status(400).json({
                status: 'error',
                message: 'Status must be "verified" or "dismissed"'
            });
        }

        const report = await Report.findByPk(id);

        if (!report) {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found'
            });
        }

        // Update report status and boost confidence if verified
        report.status = newStatus;
        if (newStatus === 'verified') {
            report.confidence_score = Math.min(1.0, (report.confidence_score || 0) + 0.3);
        }
        await report.save();

        logger.info({ reportId: id, newStatus }, 'Report status updated');

        // Send notification to the reporter
        try {
            await notificationService.notifyReportStatusChange(report, newStatus);

            // If verified, notify nearby users
            if (newStatus === 'verified') {
                // Run in background (fire and forget) to not block response
                notificationService.notifyNearbyUsers(report).catch(err =>
                    logger.error({ err }, 'Failed to notify nearby users')
                );
            }
        } catch (notifError) {
            logger.error({ err: notifError }, 'Failed to send verification notification');
            // Don't fail the request if notification fails
        }

        res.status(200).json({
            status: 'success',
            message: `Report ${newStatus}`,
            data: report
        });
    } catch (error) {
        logger.error({ err: error, reportId: req.params.id }, 'Error verifying report');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.getPendingReports = async (req, res) => {
    try {
        const reports = await Report.findAll({
            where: { status: 'pending' },
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.status(200).json({
            status: 'success',
            results: reports.length,
            data: reports
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching pending reports');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

/**
 * Get authenticated user's own reports
 * Returns only reports created by the logged-in user
 */
exports.getMyReports = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const { page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        const total = await Report.count({ where: { user_id: userId } });

        const reports = await Report.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: limitNum,
            offset: offset
        });

        res.status(200).json({
            status: 'success',
            results: reports.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            data: reports
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id }, 'Error fetching user reports');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};
