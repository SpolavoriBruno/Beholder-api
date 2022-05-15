'use strict'

const tableName = 'actions'

module.exports = {
    async up(queryInterface, Sequelize) {

        const actionId = await queryInterface.rawSelect(tableName, {
            where: {},
            limit: 1,
        }, ['id'])

        if (!actionId) {
            const automationId = await queryInterface.rawSelect('automations', {
                where: {},
                limit: 1,
            }, ['id'])

            return queryInterface.bulkInsert(tableName, [{
                automationId,
                type: 'ALERT_EMAIL',
                createdAt: new Date(),
                updatedAt: new Date()
            }])
        }
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete(tableName, null, {})
    }
};
