'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('actions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            automationId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'automations',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('actions')
    }
};
