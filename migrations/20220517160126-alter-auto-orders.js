'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(transaction =>
            Promise.all([
                queryInterface.addColumn('actions', 'orderTemplateId', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'orderTemplates',
                        key: 'id'
                    },
                    onDelete: 'SET NULL'
                }, { transaction }),
                queryInterface.changeColumn('orders', 'automationId', {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'automations',
                        key: 'id',
                    },
                    onDelete: 'SET NULL'
                }, { transaction }),
                queryInterface.addColumn('symbols', 'stepSize', {
                    type: Sequelize.STRING,
                }, { transaction }),
                queryInterface.addColumn('symbols', 'tickSize', {
                    type: Sequelize.STRING,
                }, { transaction }),
            ])
        )
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(transaction =>
            Promise.all([
                queryInterface.removeColumn('symbols', 'tickSize', { transaction }),
                queryInterface.removeColumn('symbols', 'stepSize', { transaction }),
                queryInterface.changeColumn('orders', 'automationId', {
                    type: Sequelize.INTEGER,
                }, { transaction }),
                queryInterface.removeColumn('actions', 'orderTemplateId', { transaction }),
            ])
        )
    }
};
