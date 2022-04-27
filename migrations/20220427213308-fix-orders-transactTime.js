'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.renameColumn('orders', 'trasactTime', 'transactTime')
    },

    async down(queryInterface, Sequelize) {
        queryInterface.renameColumn('orders', 'transactTime', 'trasactTime')
    }
};
