const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const sequelize = require('../config/db');
const SocialPost = require('../models/social_post.model');

const MOCK_ORPHAN_POSTS = [
    {
        platform: 'twitter',
        author: '@eco_warrior',
        content: 'Huge plastic pileup at Juhu Beach today! #cleanseas',
        sentiment_score: -0.8,
        location: 'Mumbai'
    },
    {
        platform: 'instagram',
        author: 'beach_cleanup_mumbai',
        content: 'Join us this Sunday for a massive cleanup drive. Link in bio!',
        sentiment_score: 0.9,
        location: 'Versova'
    },
    {
        platform: 'twitter',
        author: '@ocean_saver',
        content: 'Saw an oil slick near the port. Authorities please check!',
        sentiment_score: -0.9,
        location: 'Mumbai Port'
    },
    {
        platform: 'facebook',
        author: 'Save Our Seas Group',
        content: 'Great progress on the new barrier reef project.',
        sentiment_score: 0.7,
        location: 'Goa'
    },
    {
        platform: 'twitter',
        author: '@citizen_journal',
        content: 'Industrial waste being dumped into the river again. #report',
        sentiment_score: -0.95,
        location: 'Thane'
    }
];

const seedSocial = async () => {
    try {
        await sequelize.authenticate();
        await SocialPost.sync({ force: true }); // Reset table for demo
        console.log('✅ Social Post Table Reset.');

        await SocialPost.bulkCreate(MOCK_ORPHAN_POSTS);
        console.log(`✅ Seeded ${MOCK_ORPHAN_POSTS.length} social posts.`);

    } catch (error) {
        console.error('❌ Error seeding social data:', error);
    } finally {
        await sequelize.close();
    }
};

seedSocial();
