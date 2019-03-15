'use strict';
var ENUM = require('../models/enums.json');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Sms', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey:true,
        autoIncrement:true
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(ENUM.SmsStatus),
        allowNull:true
      },
      fromNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt:Sequelize.DATE
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Sms')
  }
};
