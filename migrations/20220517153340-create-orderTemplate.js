'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.createTable('orderTemplates', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            symbol: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            side: {
                type: Sequelize.STRING,
                allowNull: false
            },
            quantity: {
                type: Sequelize.STRING,
                allowNull: false
            },
            quantityMultiplier: Sequelize.DECIMAL(10, 2),
            limitPrice: Sequelize.STRING,
            limitPriceMultiplier: Sequelize.DECIMAL(10, 2),
            stopPrice: Sequelize.STRING,
            stopPriceMultiplier: Sequelize.DECIMAL(10, 2),
            icebergQty: Sequelize.STRING,
            icebergQtyMultiplier: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        })
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.dropTable('orderTemplates')
    }
};
