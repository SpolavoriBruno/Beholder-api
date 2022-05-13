'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('automations', 'coolDown', {
            type: Sequelize.STRING,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('automations', 'coolDown', {
            type: Sequelize.STRING,
        })
    }
};
