/**
 * Clean Notifications Table
 * Deletes all existing notifications to start fresh.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/db');
const Notification = require('../models/notification.model');

const main = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to database');

        const count = await Notification.count();
        console.log(`🧹 Found ${count} notifications. Deleting...`);

        await Notification.destroy({
            where: {},
            truncate: true
        });

        console.log('✅ Notifications table verified empty.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

main();
