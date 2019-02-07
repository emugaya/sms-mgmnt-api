'use strict'

process.env.NODE_ENV = 'test';
let request = require('supertest');
let chai = require('chai');
let server = require('../server');
const expect = chai.expect;

describe('App Starts Correctly', () => {
  it('should access base route', done => {
		request(server)
			.get('/')
			.end((err, response) => {
				expect(response.statusCode).to.equal(200);
				expect(response.body).to.equal('SMS Management API', done());
			});
	});

	it('should return api versions', done => {
		request(server)
			.get('/api-versions')
			.end((err, response) => {
				expect(response.statusCode).to.equal(200, done());
			});
	});

});