'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true
            },
            automationId: Sequelize.INTEGER,
            symbol: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            orderId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            clientOrderId: {
                type: Sequelize.STRING,
                allowNull: false
            },
            trasactTime: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            side: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false
            },
            quantity: {
                type: Sequelize.STRING,
                allowNull: false
            },
            icebergQuantity: Sequelize.STRING,
            isMaker: Sequelize.BOOLEAN,
            limitPrice: Sequelize.STRING,
            stopPrice: Sequelize.STRING,
            avgPrive: Sequelize.DECIMAL,
            commission: Sequelize.STRING,
            net: Sequelize.DECIMAL,
            obs: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        })
        await queryInterface.addIndex('orders', ['clientOrderId', 'orderId'], {
            name: 'orders_clientOrderId_orderId_index',
            unique: true
        })
        await queryInterface.addIndex('orders', ['symbol'], {
            name: 'orders_symbols_index'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('orders')
    }
};
