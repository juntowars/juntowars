var winston = require('winston');

module.exports = new (function () {
  winston.log('info', 'Winston recording Lobby.js!');

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['players login and join games lobby'] = function (client) {
    winston.level = 'debug';
    winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " starting test");

    client
    .url(client.globals.BASE_URL + 'signup')
    .waitForElementVisible('#name', client.globals.WAIT)
    .setValue('#name', "created_user_" + clientNumber)
    .setValue('#email', clientNumber + '@create.com')
    .setValue('#username', "created" + clientNumber)
    .setValue('#password', 'test', function () {
      client.click('button[type=submit]');
    })
    .waitForElementVisible('a[title="Your Games"]', client.globals.WAIT)
    .assert.containsText('a[title="Your Games"]', 'Games')
    .click('a[title="Your Games"]')
    .waitForElementVisible('#accordion > div > div.panel-heading > h4', client.globals.WAIT)
    .click('#accordion > div > div.panel-heading > h4')
    .waitForElementVisible('#test > div > a', client.globals.WAIT)
    .click('#test > div > a');
    winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " has clicked javascript dropdown");
  };


  testCases['once all players ready, first user clicks start button'] = function (client) {

    recheckButtonClicked();

    function recheckButtonClicked() {
      winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " in recheck");
      client.pause(2000)
      .isVisible('#readyButton', function (result) {
        winston.log('debug', "readyButton is " + result.value);
        if (result.value == true) {
          client
          .click("#readyButton", startTheGame);
        }
        else {
          recheckButtonClicked();
        }
      });
    }

    function startTheGame() {
      winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " in startTheGame");

      client
      .waitForElementPresent('#initGameButton', client.globals.WAIT)
      .click('#initGameButton')
      .waitForElementPresent('#map', client.globals.WAIT)
      .assert.elementPresent('#map');
    }
  };

  testCases.after = function (client) {
    winston.log('debug', process.env.__NIGHTWATCH_ENV_KEY + " finished test");
    client.end();
  };

});

