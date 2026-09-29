/**
 * Live Database Table Viewer - ALL TABLES (FULL DATA)
 * Shows ALL table data and refreshes every 3 seconds
 * 
 * Usage: node src/scripts/watch_db.js
 * Press Ctrl+C to stop
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/db');
const User = require('../models/user.model');
const Report = require('../models/report.model');
const SocialPost = require('../models/social_post.model');

const clearScreen = () => {
    process.stdout.write('\x1B[2J\x1B[0f');
};

const printTables = async () => {
    try {
        clearScreen();

        console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
        console.log('║  🔴 LIVE DATABASE TABLES - VarunaNet     ⏱️  ' + new Date().toLocaleTimeString() + '                    ║');
        console.log('║     (Auto-refresh every 3 sec | Ctrl+C to stop)                           ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

        // ═══════════════════════════════════════════════════════════════
        // 1. USERS TABLE (ALL ROWS)
        // ═══════════════════════════════════════════════════════════════
        const users = await User.findAll({
            order: [['id', 'ASC']],
            raw: true
        });

        console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
        console.log(`│  📋 TABLE 1: users (${users.length} rows)                                              │`);
        console.log('├─────┬──────────────────────┬─────────────────────────────────┬────────────┤');
        console.log('│ ID  │ Name                 │ Email                           │ Role       │');
        console.log('├─────┼──────────────────────┼─────────────────────────────────┼────────────┤');

        users.forEach(user => {
            const id = String(user.id).padEnd(3);
            const name = (user.name || 'N/A').substring(0, 20).padEnd(20);
            const email = user.email.substring(0, 31).padEnd(31);
            const role = user.role.padEnd(10);
            console.log(`│ ${id} │ ${name} │ ${email} │ ${role} │`);
        });
        console.log('└─────┴──────────────────────┴─────────────────────────────────┴────────────┘');

        // ═══════════════════════════════════════════════════════════════
        // 2. REPORTS TABLE (ALL ROWS)
        // ═══════════════════════════════════════════════════════════════
        const reports = await Report.findAll({
            order: [['id', 'ASC']],
            raw: true
        });

        console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
        console.log(`│  📋 TABLE 2: reports (${reports.length} rows)                                            │`);
        console.log('├─────┬─────────────┬────────────┬───────────────────────┬─────────────────┤');
        console.log('│ ID  │ Hazard Type │ Status     │ Location (lat, lon)   │ Confidence      │');
        console.log('├─────┼─────────────┼────────────┼───────────────────────┼─────────────────┤');

        reports.forEach(report => {
            const id = String(report.id).padEnd(3);
            const type = report.hazard_type.padEnd(11);
            const status = report.status.padEnd(10);
            const location = `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`.padEnd(21);
            const conf = String(report.confidence_score.toFixed(2)).padEnd(15);
            console.log(`│ ${id} │ ${type} │ ${status} │ ${location} │ ${conf} │`);
        });
        console.log('└─────┴─────────────┴────────────┴───────────────────────┴─────────────────┘');

        // ═══════════════════════════════════════════════════════════════
        // 3. SOCIAL POSTS TABLE (ALL ROWS)
        // ═══════════════════════════════════════════════════════════════
        try {
            const posts = await SocialPost.findAll({
                order: [['id', 'ASC']],
                raw: true
            });

            console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
            console.log(`│  📋 TABLE 3: social_posts (${posts.length} rows)                                       │`);
            console.log('├─────┬─────────────┬────────────────────┬──────────────────────────────────┤');
            console.log('│ ID  │ Platform    │ Author             │ Content (snippet)                │');
            console.log('├─────┼─────────────┼────────────────────┼──────────────────────────────────┤');

            posts.forEach(post => {
                const id = String(post.id).padEnd(3);
                const platform = post.platform.padEnd(11);
                const author = (post.author || 'Unknown').substring(0, 18).padEnd(18);
                const content = post.content.substring(0, 32).padEnd(32);
                console.log(`│ ${id} │ ${platform} │ ${author} │ ${content} │`);
            });
            console.log('└─────┴─────────────┴────────────────────┴──────────────────────────────────┘');
        } catch (e) {
            console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
            console.log('│  📋 TABLE 3: social_posts - No data                                      │');
            console.log('└───────────────────────────────────────────────────────────────────────────┘');
        }

        // ═══════════════════════════════════════════════════════════════
        // 4. HOTSPOTS VIEW (ALL ROWS)
        // ═══════════════════════════════════════════════════════════════
        try {
            const [hotspots] = await sequelize.query("SELECT * FROM view_hotspot_data");

            console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
            console.log(`│  📋 TABLE 4: hotspots (${hotspots.length} clusters via view_hotspot_data)                 │`);
            console.log('├──────────────┬──────────────┬───────────────┬────────────────────────────┤');
            console.log('│ Latitude     │ Longitude    │ Intensity     │ Dominant Hazard            │');
            console.log('├──────────────┼──────────────┼───────────────┼────────────────────────────┤');

            hotspots.forEach(h => {
                const lat = String(h.lat_grid).padEnd(12);
                const lon = String(h.lon_grid).padEnd(12);
                const intensity = String(h.intensity).padEnd(13);
                const hazard = (h.dominant_hazard || 'N/A').padEnd(26);
                console.log(`│ ${lat} │ ${lon} │ ${intensity} │ ${hazard} │`);
            });
            console.log('└──────────────┴──────────────┴───────────────┴────────────────────────────┘');
        } catch (e) {
            console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
            console.log('│  📋 TABLE 4: hotspots - View not available                               │');
            console.log('└───────────────────────────────────────────────────────────────────────────┘');
        }

        // ═══════════════════════════════════════════════════════════════
        // 5. NOTIFICATIONS TABLE (ALL ROWS)
        // ═══════════════════════════════════════════════════════════════
        try {
            const Notification = require('../models/notification.model');
            // Fetch notifications with User details
            const notifications = await Notification.findAll({
                order: [['id', 'DESC']],
                limit: 5,
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }],
                // raw: true, // Cannot use raw:true with include if we want nested objects nicely, but Sequelize returns instances by default. 
                // Let's use clean plain objects
            });
            const totalNotifications = await Notification.count();

            console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
            console.log(`│  🔔 TABLE 5: notifications (${totalNotifications} total, showing latest 5)                     │`);
            console.log('├─────┬──────────────────────┬──────────────────────────┬──────────────┬────────┤');
            console.log('│ ID  │ Recipient (User)     │ Type                     │ Title        │ Read   │');
            console.log('├─────┼──────────────────────┼──────────────────────────┼──────────────┼────────┤');

            notifications.forEach(n => {
                const plainN = n.get({ plain: true });
                const id = String(plainN.id).padEnd(3);

                // User Name or Email fallback
                let userName = 'Unknown';
                if (plainN.User) {
                    userName = plainN.User.name || plainN.User.email.split('@')[0];
                } else if (plainN.user_id) {
                    userName = `ID: ${plainN.user_id}`;
                }
                userName = userName.substring(0, 20).padEnd(20);

                const type = plainN.type.substring(0, 24).padEnd(24);
                const title = plainN.title.substring(0, 12).padEnd(12);
                const read = plainN.is_read ? '✅' : '❌';

                console.log(`│ ${id} │ ${userName} │ ${type} │ ${title} │ ${read}      │`);
            });
            console.log('└─────┴──────────────────────┴──────────────────────────┴──────────────┴────────┘');
        } catch (e) {
            console.log('\n┌───────────────────────────────────────────────────────────────────────────┐');
            console.log(`│  🔔 TABLE 5: notifications - Error: ${e.message.substring(0, 40)}...        │`);
            console.log('└───────────────────────────────────────────────────────────────────────────┘');
        }

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 TOTALS: ${users.length} users | ${reports.length} reports`);
        console.log('💡 TIP: Submit a report or trigger verification to see notifications!');

    } catch (error) {
        console.error('Error:', error.message);
    }
};

const main = async () => {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected! Starting live table view...\n');

    await printTables();
    setInterval(printTables, 3000);
};

process.on('SIGINT', async () => {
    console.log('\n\n👋 Stopping database viewer...');
    await sequelize.close();
    process.exit(0);
});

main();
