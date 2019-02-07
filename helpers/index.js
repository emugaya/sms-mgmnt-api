const schemaValidators = require('./validators.js');

module.exports = {
	userValidator: schemaValidators.userSchema,
	smsValidator: schemaValidators.smsSchema
};
