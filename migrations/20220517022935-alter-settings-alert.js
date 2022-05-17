'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize
            .transaction(transaction => Promise.all([
                queryInterface.addColumn('settings', 'phone', Sequelize.STRING, { transaction }),
                queryInterface.addColumn('settings', 'sendGridKey', Sequelize.STRING, { transaction }),
                queryInterface.addColumn('settings', 'twilioSid', Sequelize.STRING, { transaction }),
                queryInterface.addColumn('settings', 'twilioToken', Sequelize.STRING, { transaction }),
                queryInterface.addColumn('settings', 'twilioPhone', Sequelize.STRING, { transaction }),
            ]))
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize
            .transaction(transaction => Promise.all([
                queryInterface.removeColumn('settings', 'phone', { transaction }),
                queryInterface.removeColumn('settings', 'sendGridKey', { transaction }),
                queryInterface.removeColumn('settings', 'twilioSid', { transaction }),
                queryInterface.removeColumn('settings', 'twilioToken', { transaction }),
                queryInterface.removeColumn('settings', 'twilioPhone', { transaction }),
            ]))
    }
};
