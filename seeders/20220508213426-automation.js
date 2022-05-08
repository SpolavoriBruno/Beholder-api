'use strict';

const { MONITOR_TYPES } = require('../src/repositories/monitorsRepository');
const tableName = 'automations'

module.exports = {
    async up(queryInterface, Sequelize) {
        const seedSymbol = '*'
        const symbolName = await queryInterface.rawSelect(tableName, {
            where: {
                symbol: seedSymbol
            },
        }, ['symbol'])

        if (!symbolName)
            return queryInterface.bulkInsert(tableName, [{
                name: 'Estrategia infalivel',
                symbol: 'BTCUSDT',
                indexes: 'BTCUSDT:RSI',
                conditions: "",
                isActive: true,
                logs: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete(tableName, null, {});
    }
};
