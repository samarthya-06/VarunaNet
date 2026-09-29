const Report = require('../models/report.model');
const { Op, fn, col, literal } = require('sequelize');
const logger = require('../config/logger');

/**
 * Analytics Controller
 * Provides keyword trends and analytics data for the analyst dashboard
 */

exports.getKeywordTrends = async (req, res) => {
    try {
        const { since } = req.query;
        let whereClause = {};

        if (since) {
            whereClause.created_at = {
                [Op.gte]: new Date(since)
            };
        }

        // Get hazard type distribution
        const hazardCounts = await Report.findAll({
            where: whereClause,
            attributes: [
                'hazard_type',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['hazard_type'],
            order: [[literal('count'), 'DESC']]
        });

        // Get status distribution
        const statusCounts = await Report.findAll({
            where: whereClause,
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status']
        });

        // Get total reports count
        const totalReports = await Report.count({ where: whereClause });

        // Get average confidence score
        const avgConfidence = await Report.findOne({
            where: whereClause,
            attributes: [
                [fn('AVG', col('confidence_score')), 'avg_confidence']
            ]
        });

        res.status(200).json({
            status: 'success',
            data: {
                totalReports,
                avgConfidence: parseFloat(avgConfidence?.dataValues?.avg_confidence || 0).toFixed(2),
                hazardTypes: hazardCounts.map(h => ({
                    name: h.hazard_type,
                    count: parseInt(h.dataValues.count)
                })),
                statusDistribution: statusCounts.map(s => ({
                    status: s.status,
                    count: parseInt(s.dataValues.count)
                }))
            }
        });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching analytics');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};
