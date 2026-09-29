const sequelize = require('../config/db');
const logger = require('../config/logger');

const initViews = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database for View Initialization.');

        // 1. View: Dashboard Stats
        // Aggregates total reports, verified count, and most common hazard
        const createDashboardView = `
            CREATE OR REPLACE VIEW view_dashboard_stats AS
            SELECT 
                COUNT(*) as total_reports,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_count,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                MODE() WITHIN GROUP (ORDER BY hazard_type) as most_common_hazard
            FROM reports;
        `;

        // 2. View: Hotspot Data
        // Simplified grid clustering for the map view
        const createHotspotView = `
            CREATE OR REPLACE VIEW view_hotspot_data AS
            SELECT 
                ROUND(latitude::numeric, 2) as lat_grid,
                ROUND(longitude::numeric, 2) as lon_grid,
                COUNT(*) as intensity,
                MODE() WITHIN GROUP (ORDER BY hazard_type) as dominant_hazard
            FROM reports
            GROUP BY ROUND(latitude::numeric, 2), ROUND(longitude::numeric, 2);
        `;

        // 3. View: Citizen Leaderboard
        // Rankings for who submits the most reports
        const createLeaderboardView = `
            CREATE OR REPLACE VIEW view_citizen_leaderboard AS
            SELECT 
                u.name as user_name,
                COUNT(r.id) as reports_submitted,
                SUM(CASE WHEN r.status = 'verified' THEN 10 ELSE 0 END) as impact_score
            FROM users u
            JOIN reports r ON u.id = r.user_id
            GROUP BY u.id, u.name
            ORDER BY impact_score DESC;
        `;

        console.log('🛠 Creating View: view_dashboard_stats...');
        await sequelize.query(createDashboardView);

        console.log('🛠 Creating View: view_hotspot_data...');
        await sequelize.query(createHotspotView);

        console.log('🛠 Creating View: view_citizen_leaderboard...');
        await sequelize.query(createLeaderboardView);

        console.log('✨ All Views created successfully.');

    } catch (error) {
        console.error('❌ Error initializing views:', error);
    } finally {
        await sequelize.close();
    }
};

initViews();
