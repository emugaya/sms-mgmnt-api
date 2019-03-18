'use strict'

process.env.NODE_ENV = 'test';
let request = require('supertest');
let chai = require('chai');
let server = require('../server');
const Op = require('sequelize').Op;
const expect = chai.expect;
const truncate = require('./truncate');
const security = require('../common/security');
const User = require('../models').User;
const Sms = require('../models').Sms;

let userOne, userTwo, validSmsOne, validSmsTwo, inValidSmsOne, inValidSmsTwo, userOneToken, userTwoToken, smsId

describe('Sms Routes "/sms"', function() {
  before(async function() {
    await truncate.truncateUsers();
    await truncate.truncateSms();
    userOne = {
        firstName: 'Joe',
        lastName: 'Doe',
        telephoneNumber: '0863053842',
        email: 'joe.doe@gmail.com',
        password: 'Test@1234',
        confirmPassword: 'Test@1234'
    }
    userTwo = {
        firstName: 'Jane',
        lastName: 'Doe',
        telephoneNumber: '0963053842',
        email: 'jane.doe@gmail.com',
        password: 'Test@1234',
        confirmPassword: 'Test@1234'
    }

    validSmsOne = {
        message: 'Hello World',
        toNumber: '0963053842'
    }

    validSmsTwo = {
        message: 'Hello World',
        toNumber: '0863053842'
    }

    inValidSmsOne = {
        message: '',
        toNumber: '0863053842'
    }

    inValidSmsTwo = {
        message: 'Hello World',
        toNumber: ''
    }

    await User.findOrCreate({
      where: { 
        [Op.or]: [
          { email: userOne.email },
          { telephoneNumber: userOne.telephoneNumber }
        ]
      },
      attributes: ['firstName', 'lastName', 'telephoneNumber', 'email', 'role', 'password', 'token' ],
      defaults: {
        'firstName': userOne.firstName,
        'lastName': userOne.lastName,
        'telephoneNumber': userOne.telephoneNumber,
        'email': userOne.email,
        'role': 'USER',
        'password': '$2a$10$3T.ePZLME8llF0KJ4AkQb.pfGOnMnQ2gO8iiX3YZ05Xf87B59OyCy',
        'token': 100324349
      }
    })
    .spread((user, newUser) => {
    })
    .catch((err) => {
    });

    await User.findOrCreate({
      where: { 
        [Op.or]: [
          { email: userTwo.email },
          { telephoneNumber: userTwo.telephoneNumber }
        ]
      },
      attributes: ['firstName', 'lastName', 'telephoneNumber', 'email', 'role','password', 'token' ],
      defaults: {
        'firstName': userTwo.firstName,
        'lastName': userTwo.lastName,
        'telephoneNumber': userTwo.telephoneNumber,
        'email': userTwo.email,
        'role': 'USER',
        'password': '$2a$10$3T.ePZLME8llF0KJ4AkQb.pfGOnMnQ2gO8iiX3YZ05Xf87B59OyCy',
        'token': 100324349
      }
    })
    .spread((user, newUser) => {
    })
    .catch((err) => {
    });

    await User.scope('login').findOne({ where: { email: userOne.email}})
    .then((result) => {
      userOneToken = 'JWT ' + security.generateJWTToken(result);
    });

    await User.scope('login').findOne({ where: { email: userTwo.email}})
    .then((result) => {
      userTwoToken = 'JWT ' + security.generateJWTToken(result)
    });
  });

  after(async() => {
    await truncate.truncateUsers();
    await truncate.truncateSms();
  });

  describe('Sending Sms', () => {
    it('should send Sms Succesfully', done => {
      request(server)
        .post('/sms')
        .set('Authorization', userOneToken)
        .set('Accept', 'application/json')
        .send(validSmsOne)
        .end((err, response) => {
          expect(response.statusCode).to.equal(200, done());
        });
    });

    it('should not send Sms with any missing field', done => {
      request(server)
        .post('/sms')
        .set('Authorization', userOneToken)
        .set('Accept', 'application/json')
        .send(inValidSmsOne)
        .end((err, response) => {
          expect(response.statusCode).to.equal(400, done());
        });
    });

    it('should not send Sms to unregistered user/ contact', done => {
      inValidSmsOne.message = 'Hello Msg';
      inValidSmsOne.toNumber = '0123435678'
      request(server)
        .post('/sms')
        .set('Authorization', userOneToken)
        .set('Accept', 'application/json')
        .send(inValidSmsOne)
        .end((err, response) => {
          expect(response.statusCode).to.equal(400);
          expect(response.body.message).to.equal('Your allowed to send sms to registerd users only.', done());
        });
    });
  });

  describe('Getting Sms', () => {
    before(async function () {
      await Sms.findOne({where: { }})
        .then((sms) =>{
          if(sms){
            smsId = sms.id
          }
        })
    });

    it("should get user's sent Sms Msgs", done => {
      request(server)
        .get('/sms/sent')
        .set('Authorization', userOneToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200, done());
        });
    });
  
    it("should get a user's received Sms Msgs", done => {
      request(server)
        .get('/sms/received')
        .set('Authorization', userTwoToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200, done());
        });
    });

    it("should get a single Sms message", done => {
      request(server)
        .get(`/sms/${smsId}`)
        .set('Authorization', userTwoToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200, done());
        });
    });
  });

  describe('Deleting Sms', () => {
    before(async function () {
      await Sms.findOne({where: { }})
        .then((sms) =>{
          if(sms){
            smsId = sms.id
          }
        })
    });

    it('should delete sent Sms succesfully', done => {
      request(server)
        .del(`/sms/${smsId}`)
        .set('Authorization', userOneToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200, done());
        });
    });

    it('Sender should not get Sms deleted by sender', done => {
      request(server)
        .get(`/sms/${smsId}`)
        .set('Authorization', userOneToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(404, done());
        });
    });

    it('should delete received Sms succesfully', done => {
      request(server)
        .del(`/sms/${smsId}`)
        .set('Authorization', userTwoToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200, done());
        });
    });

    it('Sender should not get Sms deleted by recipient', done => {
      request(server)
        .get(`/sms/${smsId}`)
        .set('Authorization', userTwoToken)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(404, done());
        });
    });
  });
});