
var mongoose = require('mongoose')
, request = require('supertest')
, app = require('../../../server');

var should = require('should');

var checkinStepsWrapper = function () {

  var assert = require('assert');
  var statusResponse;

  this.When(/^I send a request to the server using the status endpoint$/, function (next) {
    request(app)
    .get('/status')
    .expect(200)
    .expect(/ok/);
  });


  this.Then(/^I get a message "([^"]*)"$/, function (statusMessage, next) {
    statusResponse.containDeep(statusMessage);
    next();
  });

  this.Then(/^A HTTP status code of (\d+)$/, function (statusCode, callback) {
    statusResponse.expect(statusCode);
  });
};

module.exports = checkinStepsWrapper;
