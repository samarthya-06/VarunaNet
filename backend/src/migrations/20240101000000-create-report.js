'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('reports', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            hazard_type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            latitude: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            longitude: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'pending'
            },
            confidence_score: {
                type: Sequelize.FLOAT,
                defaultValue: 0.0
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add composite index for location queries
        await queryInterface.addIndex('reports', ['latitude', 'longitude']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('reports');
    }
};
