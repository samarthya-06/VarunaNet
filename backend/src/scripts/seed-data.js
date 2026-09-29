/**
 * Seed Script - Populate database with sample hazard reports
 * Run with: node src/scripts/seed-data.js
 */

const sequelize = require('../config/db');
const Report = require('../models/report.model');

// Sample reports around Mumbai coastal areas
const sampleReports = [
    {
        hazard_type: 'debris',
        description: 'Large accumulation of plastic bottles and bags washed up on the beach. Approximately 50m stretch affected.',
        latitude: 19.0989,
        longitude: 72.8265,
        status: 'verified',
        confidence_score: 0.85,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
        hazard_type: 'pollution',
        description: 'Oil sheen visible on water surface near fishing boats. Strong petroleum smell.',
        latitude: 18.9388,
        longitude: 72.8355,
        status: 'pending',
        confidence_score: 0.72,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
        hazard_type: 'wildlife',
        description: 'Turtle found stranded on Versova beach. Appears to be entangled in fishing net. Authorities notified.',
        latitude: 19.1380,
        longitude: 72.8140,
        status: 'verified',
        confidence_score: 0.95,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
        hazard_type: 'debris',
        description: 'Medical waste including syringes found on beach. Highly dangerous - area cordoned off.',
        latitude: 19.0607,
        longitude: 72.8195,
        status: 'verified',
        confidence_score: 0.98,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },
    {
        hazard_type: 'erosion',
        description: 'Significant coastal erosion observed. Beach has receded approximately 2m from last month.',
        latitude: 19.0872,
        longitude: 72.8269,
        status: 'pending',
        confidence_score: 0.65,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
        hazard_type: 'pollution',
        description: 'Sewage outflow visible at low tide. Water discolored in a 100m radius.',
        latitude: 19.0170,
        longitude: 72.8205,
        status: 'verified',
        confidence_score: 0.88,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    },
    {
        hazard_type: 'debris',
        description: 'Construction debris dumped illegally near mangroves. Concrete blocks and metal bars visible.',
        latitude: 19.2147,
        longitude: 72.8542,
        status: 'verified',
        confidence_score: 0.70,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
        hazard_type: 'wildlife',
        description: 'Dead fish washing up on shore. Possible algal bloom or pollution event. About 20-30 fish affected.',
        latitude: 19.1076,
        longitude: 72.8292,
        status: 'verified',
        confidence_score: 0.82,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
        hazard_type: 'pollution',
        description: 'Chemical foam observed on water. Factory discharge suspected. Unusual color and smell.',
        latitude: 19.0312,
        longitude: 72.8478,
        status: 'pending',
        confidence_score: 0.78,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
        hazard_type: 'debris',
        description: 'Fishing nets abandoned on reef area. Risk of ghost fishing and marine life entanglement.',
        latitude: 18.9022,
        longitude: 72.8118,
        status: 'verified',
        confidence_score: 0.75,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },
    {
        hazard_type: 'erosion',
        description: 'Wave action undermining seawall foundation. Cracks visible. Infrastructure at risk.',
        latitude: 18.9262,
        longitude: 72.8232,
        status: 'pending',
        confidence_score: 0.83,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
        hazard_type: 'wildlife',
        description: 'Dolphin pod spotted unusually close to shore. May indicate offshore disturbance or pollution.',
        latitude: 19.0760,
        longitude: 72.8228,
        status: 'dismissed',
        confidence_score: 0.45,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    },
    {
        hazard_type: 'debris',
        description: 'Festival debris - garlands, flowers, and non-biodegradable items accumulating post-Ganesh Visarjan.',
        latitude: 19.0368,
        longitude: 72.8155,
        status: 'verified',
        confidence_score: 0.92,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
        hazard_type: 'pollution',
        description: 'Tar balls found on beach. Likely from ship cleaning or offshore spill.',
        latitude: 19.1532,
        longitude: 72.8015,
        status: 'verified',
        confidence_score: 0.68,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
        hazard_type: 'other',
        description: 'Unusual water coloration near drain outlet. Brown-green color with foam. Investigation needed.',
        latitude: 19.0028,
        longitude: 72.8445,
        status: 'verified',
        confidence_score: 0.55,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
];

async function seedData() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Check existing count
        const existingCount = await Report.count();
        if (existingCount > 0) {
            console.log(`ℹ Database already has ${existingCount} reports.`);
            const answer = process.argv.includes('--force') ? 'y' : 'n';
            if (answer === 'n' && !process.argv.includes('--force')) {
                console.log('  Use --force to add more sample data anyway.');
                console.log('  Exiting without changes.');
                process.exit(0);
            }
        }

        // Insert sample reports
        console.log('➤ Inserting sample reports...');
        for (const report of sampleReports) {
            await Report.create(report);
            process.stdout.write('.');
        }

        console.log('\n✓ Sample data inserted successfully!');

        // Summary
        const counts = await Report.findAll({
            attributes: ['hazard_type', [sequelize.fn('COUNT', '*'), 'count']],
            group: ['hazard_type']
        });

        console.log('\n📊 Summary:');
        counts.forEach(c => {
            console.log(`   ${c.hazard_type}: ${c.dataValues.count}`);
        });

        const total = await Report.count();
        console.log(`\n   Total: ${total} reports`);

    } catch (error) {
        console.error('✗ Error seeding data:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

seedData();
