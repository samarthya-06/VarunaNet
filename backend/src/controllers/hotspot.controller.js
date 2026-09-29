const { Op } = require('sequelize');
const Report = require('../models/report.model');
const logger = require('../config/logger');

// Simple grid-based clustering (approx. 1km blocks)
// Since PostGIS is unavailable, we process this in Node.js
const CLUSTER_PRECISION = 2; // Decimal places for grid (2 decimal places ~ 1.1km)
const MAX_REPORTS_FOR_CLUSTERING = 10000; // Safety limit

exports.getHotspots = async (req, res) => {
    try {
        const { since, limit = 50 } = req.query;
        let whereClause = {};

        // Filter by time window if provided
        if (since) {
            whereClause.created_at = {
                [Op.gte]: new Date(since)
            };
        }

        // Fetch reports with safety limit
        const reports = await Report.findAll({
            where: whereClause,
            attributes: ['id', 'latitude', 'longitude', 'hazard_type', 'confidence_score'],
            limit: MAX_REPORTS_FOR_CLUSTERING,
            order: [['created_at', 'DESC']]
        });

        // Server-side Clustering (Grid-based aggregation)
        const clusters = {};

        reports.forEach(report => {
            // Create a grid key (Simple bucketing)
            const gridLat = report.latitude.toFixed(CLUSTER_PRECISION);
            const gridLon = report.longitude.toFixed(CLUSTER_PRECISION);
            const key = `${gridLat}_${gridLon}`;

            if (!clusters[key]) {
                clusters[key] = {
                    latSum: 0,
                    lonSum: 0,
                    count: 0,
                    types: {},
                    avgConfidence: 0
                };
            }

            const cluster = clusters[key];
            cluster.latSum += report.latitude;
            cluster.lonSum += report.longitude;
            cluster.count += 1;
            cluster.avgConfidence += report.confidence_score || 0;

            // Track hazard types
            cluster.types[report.hazard_type] = (cluster.types[report.hazard_type] || 0) + 1;
        });

        // Format output: Calculate centroids
        let results = Object.values(clusters).map(c => {
            // Determine dominant hazard type
            const dominantType = Object.entries(c.types).reduce((a, b) => a[1] > b[1] ? a : b)[0];

            return {
                latitude: c.latSum / c.count,
                longitude: c.lonSum / c.count,
                count: c.count,
                intensity: Math.min(1.0, c.count * 0.2 + (c.avgConfidence / c.count) * 0.5),
                hazard_type: dominantType
            };
        });

        // Sort by count (descending) and apply limit
        results.sort((a, b) => b.count - a.count);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        results = results.slice(0, limitNum);

        res.status(200).json({
            status: 'success',
            count: results.length,
            reportsProcessed: reports.length,
            data: results
        });

    } catch (error) {
        logger.error({ err: error }, 'Error calculating hotspots');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error processing hotspots'
        });
    }
};
