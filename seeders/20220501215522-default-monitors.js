'use strict';

const { MONITOR_TYPES } = require('../src/repositories/monitorsRepository');

module.exports = {
    async up(queryInterface, Sequelize) {
        const seedSymbol = '*'
        const symbolName = await queryInterface.rawSelect('monitors', {
            where: {
                symbol: seedSymbol
            },
        }, ['symbol'])

        if (!symbolName)
            return queryInterface.bulkInsert('monitors', [{
                type: MONITOR_TYPES.MINI_TICKER,
                broadcastLabel: 'miniTicker',
                symbol: '*',
                interval: null,
                isActive: true,
                isSystemMon: true,
                indexes: null,
                logs: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                type: MONITOR_TYPES.BOOK,
                broadcastLabel: 'book',
                symbol: '*',
                interval: null,
                isActive: true,
                isSystemMon: true,
                indexes: null,
                logs: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                type: MONITOR_TYPES.USER_DATA,
                broadcastLabel: 'balance,execution',
                symbol: '*',
                interval: null,
                isActive: true,
                isSystemMon: true,
                indexes: null,
                logs: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                type: MONITOR_TYPES.CANDLES,
                broadcastLabel: null,
                symbol: 'BTCUSDT',
                interval: '1m',
                isActive: true,
                isSystemMon: false,
                indexes: 'RSI,MACD',
                logs: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('monitors', {
            symbol: 'BTCBUSD',
        });
    }
};
