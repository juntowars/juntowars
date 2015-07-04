module.exports = new (function () {

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['players login and join games lobby'] = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);

    client
    .url('http://localhost:3000/login')
    .waitForElementVisible('#email', 10000)
    .setValue('#email', clientNumber + '@test.com')
    .setValue('#password', clientNumber)
    .click('button[type=submit]')
    .waitForElementVisible('a[title="Your Games"]', 5000)
    .assert.containsText('a[title="Your Games"]', 'Games')
    .click('a[title="Your Games"]')
    .waitForElementVisible('#accordion > div > div.panel-heading > h4', 10000)
    .click('#accordion > div > div.panel-heading > h4')
    .waitForElementVisible('#test > div > a', 10000)
    .click('#test > div > a')
    .pause(2000)
    .waitForElementVisible('#content', 10000)
    .assert.containsText('#content', 'valid_user_' + clientNumber + ' has joined the chat')
    .waitForElementVisible('#readyButton', 50000)
    .pause(3000);
  };

  testCases['once all players ready, first user clicks start button'] = function (client) {
    client
    .click('#readyButton', startTheGame);

    function startTheGame(cb) {
      if (clientNumber == '1') {
        client
        .waitForElementPresent('#initGameButton', 50000)
        .click('#initGameButton')
        .waitForElementPresent('#map', 5000)
        .assert.elementPresent('#map', cb);
      } else {
        client
        .waitForElementPresent('#map', 50000)
        .assert.elementPresent('#map', cb);
      }
    }
  };

  testCases.after = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);
    client.end();
  };
});

