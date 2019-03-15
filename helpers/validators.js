// Define Joi Schema for use when validating user payload.
const Joi = require('joi');

const _userSchema = Joi.object().keys({
  firstName: Joi.string().min(3).max(100).required(),
  lastName: Joi.string().min(3).max(100).required(),
	telephoneNumber: Joi.string().regex(/^[0-9]+$/).min(10).max(10).required(),
  email: Joi.string().min(3).required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().min(8).required(),
  password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).min(8).required(),
  confirmPassword: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).min(8).required()
});

const _smsSchema = Joi.object().keys({
	message: Joi.string().min(1).max(140).required(),
	fromNumber: Joi.string().min(10).max(10).required(),
	toNumber: Joi.string().min(10).max(10).required(),
	senderUserId: Joi.number().required()
});

module.exports = {
	userSchema: _userSchema,
	smsSchema: _smsSchema
};
