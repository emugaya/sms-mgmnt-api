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


let userOne, userTwo, userThree, invalidUser, token, validUser;

describe('User', function() {
  before(async function() {
    // Clear database before running
    await truncate.truncateUsers();

    validUser = {
      email: 'email@email.com',
      password: 'Test@1234'
    }

    userOne = {
      "firstName": "user-one-firstname",
      "lastName": "user-one-lastname",
      "telephoneNumber": "0663053842",
      "email": "user.one@gmail.com",
      "password": "Test@1234",
      "confirmPassword": "Test@1234"
    };

    userTwo = {
      "firstName": "user-two-firstname",
      "lastName": "user-two-firstname",
      "telephoneNumber": "0671227322",
      "email": "user.two@gmail.com",
      "password": "Test@1234",
      "confirmPassword": "Test@1234"
    };

    userThree = {
      "firstName": "user-three-firstname",
      "lastName": "user-three-firstname",
      "telephoneNumber": "0671227567",
      "email": "user.three@gmail.com",
      "password": "Test",
      "confirmPassword": "Test"
    };

    invalidUser = {
      "firstName": "invalid-user-one-firstname",
      "lastName": "invalid-user-one-firstname",
      "telephoneNumber": "0738433",
      "email": "invalid.useronekobel@gmail.com",
      "password": "Test@1234",
      "confirmPassword": "Test@1234"
    }

    await User.findOrCreate({
      where: { 
        [Op.or]: [
          { email: 'email@email.com' },
          { telephoneNumber: '0987654321' }
        ]
      },
      attributes: ['firstName', 'lastName', 'telephoneNumber', 'email', 'password', 'token' ],
      defaults: {
        'firstName': 'firstName',
        'lastName': 'lastName',
        'telephoneNumber': '0987654321',
        'email': 'email@email.com',
        'password': '$2a$10$3T.ePZLME8llF0KJ4AkQb.pfGOnMnQ2gO8iiX3YZ05Xf87B59OyCy',
        'token': 100324349
      }
    })
    .spread((user, newUser) => {
    })
    .catch((err) => {
    });

    await User.scope('login').findOne()
    .then((result) => {
      token = 'JWT ' + security.generateJWTToken(result)
    });
  });

  after(async() => {
    await truncate.truncateUsers();
    await truncate.truncateSms();
  });


  describe('User Registration  "/users/register"', () => {
    it('should create a new user succesfully', done => {
      request(server)
        .post('/users/register')
        .send(userTwo)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body.message).to.equal('User account created succesfully', done());
        });
    });

    it('should not create a user twice', done => {
      request(server)
        .post('/users/register')
        .send(userTwo)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(409);
          expect(response.body.message).to.equal('User already exists', done());
        });
    });

    it('should not create a user with missing parameters', done => {
      delete userOne.email;
      request(server)
        .post('/users/register')
        .send(userOne)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(400, done());
        });
    });

    it('should not create a user with already existing email', done => {
      request(server)
        .post('/users/register')
        .send(userTwo)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(409);
          expect(response.body.message).to.equal('User already exists', done());
        });
    });

    it('should not create a user with already existing phoneNumber', done => {
      userOne.email = 'newtest@email.com'
      userOne.telephoneNumber = userTwo.telephoneNumber
      request(server)
        .post('/users/register')
        .send(userOne)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(409);
          expect(response.body.message).to.be.a('string', done());
        });
    });

    it('should not create a user with invalid  password', done => {
      request(server)
        .post('/users/register')
        .send(userThree)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(400);
          expect(response.body.message).to.be.a('string', done());
        });
    });
  });

  describe('User Login "/users/login"', () => {
    it('should login user succesfully', done => {
      request(server)
        .post('/users/login')
        .send(validUser)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body.token).to.be.a('string', done());
        });
    });

    it('should not login user with wrong password', done => {
      userOne.password = 'wrong_password'
      request(server)
        .post('/users/login')
        .send(userOne)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(401);
          expect(response.body.message).to.equal('Error logging in user. Invalid email or password', done());
        });
    });

    it('should not login user with wrong email', done => {
      userOne.email = 'wrong@email.com'
      request(server)
        .post('/users/login')
        .send(invalidUser)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(401);
          expect(response.body.message).to.equal('Error logging in user. Invalid email or password', done());
        });
    });

    it('should not login user with blank email', done => {
      invalidUser.email = null;
      request(server)
        .post('/users/login')
        .send(invalidUser)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(400);
          expect(response.body.message).to.equal('Email and password required', done());
        });
    });

    it('should not login user with blank password', done => {
      invalidUser.password = null;
      request(server)
        .post('/users/login')
        .send(invalidUser)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(400);
          expect(response.body.message).to.equal('Email and password required', done());
        });
    });
  });

  describe('User Logout "/users/logout"', () => {
    it('should logout a user succesfully',  done => {
      request(server)
        .put('/users/logout')
        .set('Authorization', token)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.body.message).to.equal('You are now logged out', done());
        });
    });

    it('should not logout a user who is already logged out', done => {
      request(server)
        .put('/users/logout')
        .set('Authorization', token)
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(401, done());
        });
    });

    it('should not logout a user with invalid token', done => {
      request(server)
        .put('/users/logout')
        .set('Authorization', token + 'invali')
        .set('Accept', 'application/json')
        .end((err, response) => {
          expect(response.statusCode).to.equal(401, done());
        });
    });
  });
});