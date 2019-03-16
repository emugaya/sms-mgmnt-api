var restifyErrors = require('restify-errors');
const Joi = require('joi');
var sequelize = require('../models').sequelize;
var Security = require('../common/security.js');
var Validator = require('../helpers').userValidator;
var User = require('../models').User;
var Sms = require('../models').Sms;
const Op = sequelize.Op

var _registerUser = function register(req, res, next) {
  var user = req.body;
  console.log(user.role, 'user role')
  if(!user.role) { user.role = 'USER' };
  console.log(user.role, 'user role')

  const { error, value } = Joi.validate(user, Validator);
  if(error) {
    return next(new restifyErrors.BadRequestError(error.message));
  }
  
  User.findOrCreate({
    where: { 
      [Op.or]: [
        { email: user.email },
        { telephoneNumber: user.telephoneNumber }
      ]
    },
    attributes: ['firstName', 'lastName', 'telephoneNumber', 'email', 'password', 'token' ],
    defaults: {
      'firstName': user.firstName,
      'lastName': user.lastName,
      'telephoneNumber': user.telephoneNumber,
      'email': user.email,
      'role': user.role,
      'password': Security.createPasswordHash(user.password),
      'token': Security.generateToken()
    }
  }).spread((user, newUser) => {
    if (newUser) {
      res.send(200, {message: 'User account created succesfully'});
      return next();
    } else {
      return next(new restifyErrors.ConflictError('User already exists'));
    }
  }).catch((err) => {
     console.log(err)
    return next(new restifyErrors.BadRequestError('An error occured creating a creating user. try again'));
    });
}

var _login = function(req, res, next) {
  var user = req.body;

  if(user.email && user.password){
    User.scope('login').findOne({ where : { email: user.email.toLowerCase() } })
      .then((validUser) => {
        if (Security.passwordCompare(user.password, validUser.password)) {
          var token = Security.generateJWTToken(validUser);
          res.send(200, { 'token' : token });
          
          return next();
        } else {
          return next(new restifyErrors.UnauthorizedError("Error logging in user. Invalid email or password"));
        }
      })
      .catch((err) => {
        return next(new restifyErrors.UnauthorizedError("Error logging in user. Invalid email or password"));
      })
  } else {
    return next(new restifyErrors.UnauthorizedError("Error logging in user. Invalid email or password"));
  }
}

var _logout = function(req, res, next) {
  var user = req.user;
  User.scope('logout').findOne({ where: { id: user.id }})
    .then((loggedInUser) => {
      let oldToken = user.token;
      let newToken = Security.generateToken();
      if (oldToken === newToken) { newToken++ }

      User.update({token: newToken},{ where : { id: user.id }})
        .then(() => {
          res.send(200, { 'message': 'You are now logged out' });
          return next();
        });
    })
    .catch((err) => {
      return next(new restifyErrors.NotFoundError('Please login first'));
    });
}

var _deleteUser = function deleteUser(req, res, next){
  let user = req.user;
  let toBeDeletedUserId = req.params.id;
  if(user.role != 'ADMIN' && user.role != 'SUPER'){
    return next( new restifyErrors.NotAuthorizedError('Your not authorized to delete a user'));
  }

  if(user.id == toBeDeletedUserId){
    return next(new restifyErrors.BadRequestError('You can not deleted your own account.'));
  }

  return sequelize.transaction({autocommit: false}).then((t) => {
    let queryOptions = { where: {id: toBeDeletedUserId}, transaction: t};
    return User.findOne(queryOptions).then((user) => {
      if(!user) { return next(new restifyErrors.NotFoundError('User not found'))}

      return user.destroy({transaction: t}).then((deletedUser) => {
        return Sms.update({senderUserId: null},{where: { senderUserId: toBeDeletedUserId}}, {transaction: t}).then((sentSms)=> {
          Sms.update({recipientUserId: null}, {where: {recipientUserId: toBeDeletedUserId}}, {transaction: t}).then((receivedSms) => {
            res.send(200, {message: 'User Deleted succesfully'});
            return t.commit().then(() => {
              return next();
            });  
          });
        })
      })
    })
    .catch((err) => {
      return t.rollback().then(() => {
        return next(new restifyErrors.BadRequestError('Error deleting user'))
      })
    })
  })
}

module.exports = {
  registerUser: _registerUser,
  login: _login,
  logout: _logout,
  deleteUser: _deleteUser
};
