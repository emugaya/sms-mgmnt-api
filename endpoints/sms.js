const Joi = require('joi');
var restifyErrors = require('restify-errors');
var Sms = require('../models').Sms;
var User = require('../models').User;
var Validator = require('../helpers').smsValidator;

const deleteSmsErrorMsg = 'Please ensure that the SMS message your deleting exists';

var _sendSms = async function sendMessage(req, res, next) {
  let sms = req.body.sms
  sms.userId = req.user.id;
  sms.fromNumber = req.user.telephoneNumber;

  const { error, value } = Joi.validate(sms, Validator);
  if(error){
    return next(new restifyErrors.BadRequestError(error.message));
  }

  let validRecipient = await checkIfRecipientNumberIsForRegisteredUser(sms.toNumber);
  if(!validRecipient){
    return next(new restifyErrors.BadRequestError('Your allowed to send sms to registerd users only.'));
  }

  Sms.create(sms)
    .then((sms) => {
      res.send(200, sms);
      return next();
    })
}

var checkIfRecipientNumberIsForRegisteredUser = function checkNumber(toNumber) {
  const whereClause = { where: { telephoneNumber: toNumber } };
  return User.findOne(whereClause)
    .then((user) => {
      if(user){ 
        return true;
      }
      return false;
    })
}

var _getSentSms = function getMySmsMsgs(req, res, next){
  let telephoneNumber = req.user.telephoneNumber;

  const sentMessages = {
    where: {
      'fromNumber': telephoneNumber,
    }
  };

  Sms.findAll(sentMessages)
    .then((smsMsgs) => {
      res.send(200, smsMsgs);
      return next();
    })
    .catch((err) => {
      console.log(err);
      return next(new restifyErrors.InternalServerError('There was a problem with your request'));
    })
}

var _getRecievedSms = function getMySmsMsgs(req, res, next){
  let telephoneNumber = req.user.telephoneNumber;

  const receivedMessages = {
    where: {
      'toNumber': telephoneNumber,
    }
  };

  Sms.findAll(receivedMessages)
    .then((smsMsgs) => {
      res.send(200, smsMsgs);
      return next();
    })
    .catch((err) => {
      console.log(err);
      return next(new restifyErrors.InternalServerError('There was a problem with your request'));
    })
}

var _getSms = function getSingleSms(req, res, next){
  const smsId = req.params.smsId;
  const currentUserTelephoneNumber = req.user.telephoneNumber
  const queryOptions = { where: { id: smsId }};

  Sms.findOne(queryOptions)
    .then((sms) => {
      if(sms) {
        if(sms.toNumber == currentUserTelephoneNumber || sms.fromNumber.currentUserTelephoneNumber){
          if((sms.fromNumber == currentUserTelephoneNumber && sms.status == 'DeletedBySender') || 
              (sms.toNumber == currentUserTelephoneNumber && sms.status == 'DeletedByRecipient')) {
                return next(new restifyErrors.NotFoundError('Sms not found'));
              }
          res.send(200, sms);
          return next();
        }
      }

      return next(new restifyErrors.NotFoundError('Sms does not exist'));
    })
    .catch((err) => {
      console.log(err);
      return next(new restifyErrors.InternalServerError('An error occured while retrieving SMS. Makes sure the Sms exist'));
    })
}

var _deleteSms = function deleteSingleSms(req, res, next){
  let smsId = req.params.smsId;
  let currentUserTelephoneNumber = req.user.telephoneNumber;
  const queryOptions = { 'where': { 'id': smsId} };

  Sms.findOne(queryOptions)
    .then(async (sms) => {
      if(sms){
        if(sms.fromNumber == currentUserTelephoneNumber || sms.toNumber == currentUserTelephoneNumber){
          if(sms.fromNumber !== currentUserTelephoneNumber && sms.toNumber !== currentUserTelephoneNumber){
            return next(new restifyErrors.UnauthorizedError('Your not authorized to delete this sms'));
          }

          if(sms.fromNumber == currentUserTelephoneNumber && sms.status == null){
            const updateSingelSms = await updateSmsDeletStatus(smsId, 'DeletedBySender');
            if(updateSingelSms){
              res.send(200, 'Sms deleted succesfully');
              return next(); 
            }
  
            return next(new restifyErrors.BadRequestError(deleteSmsErrorMsg));
          }

          if(sms.toNumber == currentUserTelephoneNumber && sms.status == null){
            const updateSingelSms = await updateSmsDeletStatus(smsId, 'DeletedByRecipient');
            if(updateSingelSms){
              res.send(200, 'Sms deleted succesfully');
              return next(); 
            }
            
            return next(new restifyErrors.BadRequestError(deleteSmsErrorMsg));
          }

          if((sms.status == 'DeletedBySender' && sms.fromNumber == currentUserTelephoneNumber) ||
          (sms.status == 'DeletedByRecipient' && sms.toNumber == currentUserTelephoneNumber)){
            return next(new restifyErrors.NotFoundError('Sms does not exist'));
          }

          if(sms.status){
            return Sms.destroy(queryOptions)
              .then((result) => {
                res.send(200, 'Sms deleted succesfully');
                return next(); 
              })
              .catch((err) => {
                console.log(err)
                return next(new restifyErrors.InternalServerError(deleteSmsErrorMsg));
              });
          }
        }

        return next(new restifyErrors.UnauthorizedError('Your not allowed to delete this message'));
      }

      return next(new restifyErrors.NotFoundError('Sms does not exist'));
    })
    .catch((err) => {
      console.log(err);
      return next(new restifyErrors.InternalServerError(deleteSmsErrorMsg));
    })
}

var updateSmsDeletStatus = function updateSms(smsId, status){
  const whereClause = { id: smsId };
  return Sms.update({'status': status}, {'where': whereClause})
    .then((sms) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

module.exports = {
  sendSms: _sendSms,
  getSentSms: _getSentSms,
  getRecievedSms: _getRecievedSms,
  getSms: _getSms,
  deleteSms: _deleteSms
};
