'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.renameColumn('orders', 'avgPrive', 'avgPrice')
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.renameColumn('orders', 'avgPrice', 'avgPrive')
    }
};
