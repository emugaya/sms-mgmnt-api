const User = require('../models').User;
const Sms = require('../models').Sms;

var _truncateUsers = function truncate(){
	return User.destroy({where: {}, force: true})
		.then((del) => {
			return true;
		})
		.catch((err) => {
			return false;
		})
}

var _truncateSmsMsgs = function truncateSms(){
	return Sms.destroy({where: {}, force: true})
	.then((del) => {
		return true;
	})
	.catch((err) => {
		return false;
	})
}

module.exports = {
	truncateUsers: _truncateUsers,
	truncateSms: _truncateSmsMsgs
}
