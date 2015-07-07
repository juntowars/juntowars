module.exports = new (function () {

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['players login and join games lobby'] = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);

    client
    .url('http://localhost:3000/login')
    .waitForElementVisible('#email', client.globals.WAIT)
    .setValue('#email', clientNumber + '@test.com')
    .setValue('#password', 'test')
    .click('button[type=submit]')
    .waitForElementVisible('a[title="Your Games"]', client.globals.WAIT)
    .assert.containsText('a[title="Your Games"]', 'Games')
    .click('a[title="Your Games"]')
    .waitForElementVisible('#accordion > div > div.panel-heading > h4', client.globals.WAIT)
    .click('#accordion > div > div.panel-heading > h4')
    .waitForElementVisible('#test > div > a', client.globals.WAIT)
    .click('#test > div > a')
    .pause(client.globals.THREE_SECONDS);
  };

  testCases['once all players ready, first user clicks start button'] = function (client) {
    client
    .waitForElementVisible('#readyButton', client.globals.WAIT)
    .click('#readyButton', startTheGame);

    function startTheGame(cb) {
      if (clientNumber == '1') {
        client
        .waitForElementPresent('#initGameButton', client.globals.WAIT)
        .click('#initGameButton')
        .waitForElementPresent('#map', client.globals.WAIT)
        .assert.elementPresent('#map', cb);
      } else {
        client
        .waitForElementPresent('#map', client.globals.WAIT)
        .assert.elementPresent('#map', cb);
      }
    }
  };

  testCases.after = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);
    client
    .getLogTypes(function(result) {
      console.log(result);
    })
    .getLog('browser', function(result) {
      console.log(result);
    })
    .end();
  };
});

