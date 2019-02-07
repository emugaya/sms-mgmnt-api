var generatePassword = require("password-generator");
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var ExtractJwt = require('passport-jwt').ExtractJwt;
var JwtStrategy = require('passport-jwt').Strategy;
var crypto = require('crypto');

var User = require('../models').User;

var _tokenOptions = {};
_tokenOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
_tokenOptions.secretOrKey = 'UG0A9B8C7DLetsMakeSmsManagementEasyAndFunToPlayAroundWith0A9B8C7D';

function _passwordCompare(a, b) {
  return bcryptjs.compareSync(a, b);
};

function _createPasswordHash(plainTextPassword){
  let salt;
  salt = bcryptjs.genSaltSync(10);
  return bcryptjs.hashSync(plainTextPassword, salt);
}

var _generateJWTToken = function(user){
  var data = {
    'profile': {
      'id': user.id,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'telephoneNumber': user.telephoneNumber,
      'email': user.email,
    },
    'token': user.token
  }
  var token = jwt.sign(data, _tokenOptions.secretOrKey);
  return token;
}

var _jwtSetUp = function(){
  return new JwtStrategy(_tokenOptions, function(jwt_payload, done) {
    var user = jwt_payload.profile;
    var token = jwt_payload.token;

    if(user && token) {
      User.scope('auth').findOne({where: {id: user.id, 'token': token}}).asCallback(done);
    }
  });
}

var _generateToken = function(){
  return Math.floor(Math.random() * 999999999);
}

var Security = {
  passwordCompare : _passwordCompare,
  createPasswordHash : _createPasswordHash,
  generateJWTToken: _generateJWTToken,
  jwtSetUp: _jwtSetUp,
  generateToken: _generateToken
};

module.exports = Security;
