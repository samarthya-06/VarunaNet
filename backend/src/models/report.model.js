const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hazard_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, verified, dismissed
    },
    confidence_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Nullable for anonymous reports initially
    }
}, {
    tableName: 'reports',
    timestamps: true,
    underscored: true
});

module.exports = Report;
