'use strict';

const { monitorTypes } = require('../src/repositories/monitorsRepository');

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
                type: monitorTypes.MINI_TICKER,
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
                type: monitorTypes.BOOK,
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
                type: monitorTypes.USER_DATA,
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
                type: monitorTypes.CANDLES,
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
