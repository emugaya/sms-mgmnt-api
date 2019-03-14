var ENUM = require(__dirname + '/enums.json');

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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: true,
    paranoid: true,
    defaultScope: {
      'attributes': ['id', 'message', 'fromNumber', 'status', 'toNumber', 'createdAt']
    }
  });

  return Sms;
}