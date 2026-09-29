const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/db');
const User = require('../models/user.model');
const Report = require('../models/report.model');
const SocialPost = require('../models/social_post.model');

// Helper to print section headers
const printHeader = (title) => {
    console.log('\n' + '='.repeat(60));
    console.log(` ${title.toUpperCase()}`);
    console.log('='.repeat(60));
};

const viewData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database.');

        console.log('Fetching data...');

        // 1. USERS
        const users = await User.findAll({ raw: true });
        printHeader(`1. Users Table ("users") - ${users.length} records`);
        if (users.length > 0) {
            const displayUsers = users.map(u => ({
                ID: u.id,
                Name: u.name,
                Role: u.role,
                Email: u.email
            }));
            console.table(displayUsers);
        } else {
            console.log('No users found.');
        }

        // 2. REPORTS
        const reports = await Report.findAll({ raw: true });
        printHeader(`2. Reports Table ("reports") - ${reports.length} records`);
        if (reports.length > 0) {
            const displayReports = reports.map(r => ({
                ID: r.id,
                Type: r.hazard_type,
                Status: r.status,
                Conf: r.confidence_score,
                Loc: `${r.latitude.toFixed(2)},${r.longitude.toFixed(2)}`
            }));
            console.table(displayReports);
        } else {
            console.log('No reports found.');
        }

        // 3. SOCIAL POSTS
        // Check if table exists (it might not if migration didn't run via direct model sync)
        try {
            // Force sync just in case for this demo script (usually handled by migration)
            await SocialPost.sync();
            const posts = await SocialPost.findAll({ raw: true });
            printHeader(`3. Social Posts Table ("social_posts") - ${posts.length} records`);
            if (posts.length > 0) {
                const displayPosts = posts.map(p => ({
                    ID: p.id,
                    Platform: p.platform,
                    Author: p.author,
                    Snippet: p.content.substring(0, 30) + '...',
                    Score: p.sentiment_score
                }));
                console.table(displayPosts);
            } else {
                console.log('No social posts found. (Try running seed script)');
            }
        } catch (e) {
            console.log('Social Post table not ready yet.');
        }

        // 4. VIEW: DASHBOARD STATS
        printHeader(`4. View: Dashboard Stats ("view_dashboard_stats")`);
        const [dashboardStats] = await sequelize.query("SELECT * FROM view_dashboard_stats");
        if (dashboardStats.length > 0) console.table(dashboardStats);
        else console.log("View is empty.");

        // 5. VIEW: HOTSPOTS
        printHeader(`5. View: Hotspot Map Data ("view_hotspot_data")`);
        const [hotspots] = await sequelize.query("SELECT * FROM view_hotspot_data LIMIT 5");
        console.table(hotspots);
        if (hotspots.length === 5) console.log("... (showing top 5 rows)");

        // 6. VIEW: LEADERBOARD
        printHeader(`6. View: Citizen Leaderboard ("view_citizen_leaderboard")`);
        const [leaderboard] = await sequelize.query("SELECT * FROM view_citizen_leaderboard LIMIT 5");
        console.table(leaderboard);

        console.log('\n✨ Database view complete.\n');

    } catch (error) {
        console.error('❌ Error fetching data:', error);
    } finally {
        await sequelize.close();
    }
};

viewData();
