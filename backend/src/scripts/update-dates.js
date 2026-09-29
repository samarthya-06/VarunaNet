/**
 * Update existing reports with created_at dates
 * Run with: node src/scripts/update-dates.js
 */

const sequelize = require('../config/db');
const Report = require('../models/report.model');

async function updateDates() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Get all reports
        const reports = await Report.findAll();

        console.log(`Found ${reports.length} reports to update`);

        // Update all reports with dates distributed over past 7 days
        for (let i = 0; i < reports.length; i++) {
            const report = reports[i];
            const daysAgo = (i % 7) + 1;
            const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            // Use raw SQL to force update the created_at column
            await sequelize.query(
                `UPDATE reports SET created_at = ? WHERE id = ?`,
                { replacements: [date, report.id] }
            );
            process.stdout.write('.');
        }

        console.log(`\n✓ Updated ${reports.length} reports with dates`);

        // Verify with raw query
        const [sample] = await sequelize.query('SELECT id, hazard_type, created_at FROM reports LIMIT 5');
        console.log('\n📊 Sample records:');
        sample.forEach(r => {
            console.log(`   ID ${r.id} ${r.hazard_type}: ${r.created_at}`);
        });

    } catch (error) {
        console.error('✗ Error updating dates:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

updateDates();
