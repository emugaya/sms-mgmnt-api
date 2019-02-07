var restifyErrors = require('restify-errors');
const Joi = require('joi');
const Op = require('sequelize').Op;
var Security = require('../common/security.js');
var Validator = require('../helpers').userValidator;
var User = require('../models').User;

var _registerUser = function register(req, res, next) {
  var user = req.body.user;
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
      'password': Security.createPasswordHash(user.password),
      'token': Security.generateToken()
    }
  }).spread((user, newUser) => {
    if (newUser) {
      res.send(200, 'User account created succesfully');
      return next();
    } else {
      return next(new restifyErrors.ConflictError('User already exists'));
    }
  }).catch((err) => {
    // console.log(err);
    return next(new restifyErrors.BadRequestError('An error occured creating a creating user. try again'));
    });
}

var _login = function(req, res, next) {
  var user = req.body.user;

  if(user.email && user.password){
    User.scope('login').findOne({ where : { email: user.email.toLowerCase() } })
      .then((validUser) => {
        if (Security.passwordCompare(user.password, validUser.password)) {
          var token = Security.generateJWTToken(validUser);
          res.send(200, { 'token' : token });
          return next();
        }
      })
      .catch((err) => {
        // console.log(err);
        return next(new restifyErrors.UnauthorizedError("Error logging in user. Invalid email or password"));
      })
  } else {
    return next(new restifyErrors.BadRequestError("Email and password required"));
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
      // console.log(err);
      return next(new restifyErrors.NotFoundError('Please login first'));
    });
}

module.exports = {
  registerUser: _registerUser,
  login: _login,
  logout: _logout
};
