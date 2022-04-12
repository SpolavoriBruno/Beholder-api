'use strict';
require('dotenv').config()

const { encrypt, hashPassword } = require('../src/utils/crypto')
module.exports = {
    async up(queryInterface, Sequelize) {
        const settingsId = await queryInterface.rawSelect('settings', { where: {}, limit: 1 }, ['id'])
        if (!settingsId)
            return queryInterface.bulkInsert('settings', [{
                email: 'test@test.com',
                password: hashPassword('123'),
                apiUrl: "https://testnet.binance.vision/api/",
                accessKey: '',
                secretKey: '',
                createdAt: new Date(),
                updatedAt: new Date()
            }])
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('settings', null, {})
    }
};
