// migrations/20231023120002-create-searches-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('searches', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      query: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      media_type: {
        type: Sequelize.ENUM('image', 'audio', 'video'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('searches', ['user_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('searches');
  }
};