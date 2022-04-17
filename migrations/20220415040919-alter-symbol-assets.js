'use strict';

const Sequelize = require('sequelize')

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('symbols', 'base', Sequelize.STRING)
        await queryInterface.addColumn('symbols', 'quote', Sequelize.STRING)
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('symbols', 'base')
        await queryInterface.removeColumn('symbols', 'quote')
    }
};
