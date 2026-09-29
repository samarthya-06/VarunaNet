/**
 * Test Report Verification Notification
 * Simulates an admin verifying a report to check if notification is generated
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/user.model');
const Report = require('../models/report.model');
const Notification = require('../models/notification.model');  // Assuming index.js exports these

// Login as admin (simulated or using a token if we had one, 
// strictly we need an admin token to hit the endpoint)
// But to simplify, we can use the internal service or models if we run as a script.
// However, to test the controller logic, we MUST hit the API (or import controller).
// Hitting API requires Auth. 
// Let's use the models directly to create a scenario, then mock the controller call?
// No, better to use the actual flow. 

// Actually, I can just create a unit test-style script that imports the controller directly?
// But controller expects req, res. Mocking them is verbose.

// EASIEST: Just use the `test_notification.js` approach but actually trigger the verify logic 
// by creating a mock request object and calling the controller function directly.

const reportController = require('../controllers/report.controller');
const notificationService = require('../services/notification.service');
const sequelize = require('../config/db');

// Mock Req/Res
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const main = async () => {
    try {
        await sequelize.authenticate();
        console.log('🔌 DB Connected');

        // 1. Get or Create a pending report
        let report = await Report.findOne({
            where: { status: 'pending' }
        });

        if (!report) {
            console.log('⚠️ No pending reports found. Creating one...');
            report = await Report.create({
                hazard_type: 'debris',
                description: 'Test Report for Notification Verification',
                latitude: 19.0760,
                longitude: 72.8777,
                user_id: 6, // Sammy101
                status: 'pending'
            });
            console.log(`✅ Created test report #${report.id}`);
        } else {
            console.log(`📋 Found pending report #${report.id} from User ${report.user_id}`);
        }

        // 2. Simulate Controller Call
        const req = {
            params: { id: report.id },
            body: { status: 'verified' },
            user: { id: 1, role: 'admin' } // Mock admin
        };
        const res = mockRes();

        console.log('🚀 Calling reportController.verifyReport()...');
        await reportController.verifyReport(req, res);

        console.log(`✅ Response: ${res.statusCode}`, res.data);

        // 3. Check Notification
        const notif = await require('../models/notification.model').findOne({
            where: {
                user_id: report.user_id,
                type: 'report_verified',
                is_read: false
            },
            order: [['created_at', 'DESC']]
        });

        if (notif) {
            console.log('🔔 SUCCESS! Notification Found:', notif.toJSON());
        } else {
            console.log('❌ FAILED! No notification found for user.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

main();
