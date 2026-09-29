/**
 * Simulate Notification Workflow
 * Creates a notification for a user (ID 6 - Sammmy101) to verify database and socket event
 * 
 * Usage: node src/scripts/test_notification.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/db');
const notificationService = require('../services/notification.service');

const main = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to database');

        // Target user ID 6 (from previous db output)
        const userId = 6;

        console.log(`🔔 Creating test notification for User ${userId}...`);

        const notification = await notificationService.createNotification(
            userId,
            'report_verified',
            '✅ Live Test Alert',
            'This is a test notification generated from the CLI script.',
            { test: true, timestamp: new Date() }
        );

        console.log('✅ Notification created successfully!');
        console.log(JSON.stringify(notification.toJSON(), null, 2));

        console.log('\n👀 Check the live watcher terminal - you should see this new row!');
        console.log('👀 Check the frontend app - the bell should show a badge!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

main();
