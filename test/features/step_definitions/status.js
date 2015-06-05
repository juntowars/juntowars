
var mongoose = require('mongoose')
, request = require('supertest')
, app = require('../../../server');

var checkinStepsWrapper = function () {

  var statusResponse;

  this.Given(/^The server is running in '([^"]*)' environment$/, function(environment, next) {
    process.env.NODE_ENV = environment;
    next()
  });

  this.When(/^I send a request to the server using the status endpoint$/, function (next) {
    request(app)
    .get('/status')
    .set('Content-Type', 'application/json')
    .end(function(err, res) {
      console.log(err);
      statusResponse = res;
      next();
    });
  });


  this.Then(/^I get http status (\d+)/, function (statusCode, next) {
    statusResponse.statusCode.should.eql(parseInt(statusCode));
    next();
  });

  this.Then(/The current environment should be '([^"]*)'$/, function (environment, next) {
    responseBody = statusResponse.body;
    responseBody.should.have.property('numberOfUsers');
    responseBody.status.should.eql('ok');
    responseBody.server.should.eql(environment);
    next();
  });
};

module.exports = checkinStepsWrapper;
