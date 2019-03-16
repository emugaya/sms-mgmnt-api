'use strict';
var ENUM = require('../models/enums.json');

module.exports = function(sequelize, DataTypes) {
  var Sms = sequelize.define('Sms', {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(ENUM.SmsStatus),
      default: null,
      allowNull: true
    },
    recipientUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    senderUserId:{
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    timestamps: true,
    paranoid: true,
    defaultScope: {
      'attributes': ['id', 'message', 'fromNumber', 'status', 'toNumber', 'createdAt', 'recipientUserId', 'senderUserId']
    }
  });

  return Sms;
}