'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('settings', 'streamUrl', {
            type: Sequelize.STRING,
        })
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeCollumn('settings', 'streamUrl')
    }
};
