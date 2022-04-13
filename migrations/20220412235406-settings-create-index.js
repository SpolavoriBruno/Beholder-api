'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addIndex('settings', ['email'], {
        name: 'settings_email_index',
        unique: true
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeIndex('settings', 'settings_email_index')
  }
};
