'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('monitors', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            symbol: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: '*'
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            broadcastLabel: Sequelize.STRING,
            interval: Sequelize.STRING,
            indexes: Sequelize.STRING,
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isSystemMon: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            logs: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        })
        await queryInterface.addIndex('monitors', ['interval', 'type', 'symbol'], {
            name: 'monitors_type_symbol_interval_index',
            unique: true
        })
        await queryInterface.addIndex('monitors', ['symbol'], {
            name: 'monitors_symbols_index'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('monitors')
    }
};
