'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const hasSymbol = await queryInterface.rawSelect('symbols', {
            where: {},
            limit: 1,
        }, ['symbol'])

        if (!hasSymbol)
            return queryInterface.bulkInsert('symbols', [{
                symbol: 'BTCBUSD',
                base: "BTC",
                quote: "BUSD",
                basePrecision: 8,
                quotePrecision: 8,
                minNotional: '0.001',
                minLotSize: '0.001',
                isFavorite: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('symbols', {
            symbol: 'BTCUSDT',
        });
    }
};
