'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction =>
            Promise.all([
                queryInterface.changeColumn('orderTemplates', 'quantityMultiplier', {
                    type: Sequelize.DECIMAL(10, 4),
                }, { transaction }),
                queryInterface.changeColumn('orderTemplates', 'limitPriceMultiplier', {
                    type: Sequelize.DECIMAL(10, 4),
                }, { transaction }),
                queryInterface.changeColumn('orderTemplates', 'stopPriceMultiplier', {
                    type: Sequelize.DECIMAL(10, 4),
                }, { transaction }),
            ])
        )
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction =>
            Promise.all([
                queryInterface.changeColumn('orderTemplates', 'quantityMultiplier', {
                    type: Sequelize.DECIMAL(10, 2),
                }, { transaction }),
                queryInterface.changeColumn('orderTemplates', 'limitPriceMultiplier', {
                    type: Sequelize.DECIMAL(10, 2),
                }, { transaction }),
                queryInterface.changeColumn('orderTemplates', 'stopPriceMultiplier', {
                    type: Sequelize.DECIMAL(10, 2),
                }, { transaction }),
            ])
        )
    }
};
