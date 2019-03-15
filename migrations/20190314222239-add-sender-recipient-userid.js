'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return(
      queryInterface.addColumn('Sms',
        'recipientUserId',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }),
      queryInterface.addColumn('Sms',
        'senderUserId',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      )
    );
  },

  down: function (queryInterface, Sequelize) {
    return [
      queryInterface.removeColumn('Sms','recipientUserId'),
      queryInterface.removeColumn('Sms', 'senderUserId')
    ];
  }
};
