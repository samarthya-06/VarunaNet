const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SocialPost = sequelize.define('SocialPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    platform: {
        type: DataTypes.ENUM('twitter', 'instagram', 'facebook'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sentiment_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    location: {
        type: DataTypes.STRING, // e.g. "Mumbai, India"
        allowNull: true
    },
    posted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'social_posts',
    timestamps: true,
    underscored: true
});

module.exports = SocialPost;
