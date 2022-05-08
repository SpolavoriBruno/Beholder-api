'use strict';

const tableName = 'automations'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(tableName, {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            symbol: {
                type: Sequelize.STRING,
                allowNull: false
            },
            indexes: {
                type: Sequelize.STRING,
                allowNull: false
            },
            conditions: {
                type: Sequelize.STRING,
                allowNull: false
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            logs: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        })
        await queryInterface.addIndex(tableName, ['symbol', 'name'], {
            name: `${tableName}_symbol_name_index`,
            unique: true
        })

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable(tableName)
    }
};
