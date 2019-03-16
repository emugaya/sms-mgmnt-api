var restify = require('restify');
var passport = require('passport-restify');

var version = require('../endpoints/version.js');
var user = require('../endpoints/user.js');
var sms = require('../endpoints/sms.js');



// helpers
var _ver = function(pathName, version){
  return { 'path': pathName, 'version': version || '1.0.0' };
}

var _auth = function(){
  return passport.authenticate('jwt', { session: false });
}

var _parsers = [
  restify.plugins.queryParser(),
  restify.plugins.bodyParser()
];

//endpoints
exports = module.exports = function(server){
  // API Version
  server.get(_ver('/api-versions'), _parsers, version.list);

  // USER Endpoints

  // Register User
  server.post(_ver('/users/register'), _parsers, user.registerUser);

  // Login User
  server.post(_ver('/users/login'), _parsers, user.login);

  // Logout User
  server.put(_ver('/users/logout'), _parsers, _auth(), user.logout);

  // Delete User
  server.del(_ver('/users/:id'), _auth(), user.deleteUser);

  // SMS Endpoints

  // Send SMS
  server.post(_ver('/sms'), _parsers, _auth(), sms.sendSms);

  // Get All User's Sent SMS Messages
  server.get(_ver('/sms/sent'), _parsers, _auth(), sms.getSentSms);

  // Get All User's Received SMS Messages
  server.get(_ver('/sms/received'), _parsers, _auth(), sms.getRecievedSms);

  // Get Single SMS
  server.get(_ver('/sms/:smsId'), _parsers, _auth(), sms.getSms);

  // Delete SMS
  server.del(_ver('/sms/:smsId'), _parsers, _auth(), sms.deleteSms);
  
  // Send Bulk SMS to All Users Contacts


  server.get('/',function(req,res,next){
    res.send(200, 'SMS Management API');
    return next();
  });
}