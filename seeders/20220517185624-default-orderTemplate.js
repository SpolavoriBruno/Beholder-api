'use strict'

const tableName = 'orderTemplates'

module.exports = {
    async up(queryInterface, Sequelize) {

        const orderTemplateId = await queryInterface.rawSelect(tableName, {
            where: {},
            limit: 1,
        }, ['id'])

        if (!orderTemplateId) {
            return queryInterface.bulkInsert(tableName, [{
                name: 'Default Template',
                symbol: 'BTCUSDT',
                type: 'MARKET',
                side: 'BUY',
                quantity: 'MIN_NOTIONAL',
                quantityMultiplier: 1,
                limitPrice: null,
                limitPriceMultiplier: 1,
                stopPrice: null,
                stopPriceMultiplier: 1,
                icebergQty: null,
                icebergQtyMultiplier: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }])
        }
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete(tableName, null, {})
    }
};
