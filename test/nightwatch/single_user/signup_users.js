var winston = require('winston');

module.exports = new (function () {

  winston.log('info', 'Winston recording Login.js!');
  winston.level = 'debug';

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['players signs up for account'] = function (client) {
    winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " starting signup.js");

    client
    .url('http://localhost:3000/signup')
    .waitForElementVisible('#name', client.globals.WAIT)
    .setValue('#name', "created_user_" + clientNumber)
    .setValue('#email', clientNumber + '@create.com')
    .setValue('#username', "created" + clientNumber)
    .setValue('#password', 'test', function(){
      client.click('button[type=submit]');
    })
    .waitForElementVisible('a[title="Your Games"]', client.globals.WAIT)
    .assert.containsText('a[title="Your Games"]', 'Games');
  };
  testCases.after = function (client) {
    winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " signup test complete");
    client.end();
  };
});