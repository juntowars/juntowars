module.exports = new (function () {

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['players login and join games lobby'] = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);

    client
    .url('http://localhost:3000/login')
    .setValue('#email', clientNumber + '@test.com')
    .waitForElementVisible('#password', client.globals.WAIT)
    .setValue('#password', 'test', function(){
      client.click('button[type=submit]');
    })
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

    clickThatShitAgain();

    function clickThatShitAgain(){
      console.log(process.env.__NIGHTWATCH_ENV_KEY+ " making it to clickThatShitAgain");
      client.isVisible('#readyButton', function(result) {
        if(result.value == true){
          client
          .waitForElementVisible('#readyButton', client.globals.WAIT)
          .click('#readyButton', clickThatShitAgain);
        } else {
          client.pause(5000,startTheGame);
        }
      });
    }

    function startTheGame() {
      console.log(process.env.__NIGHTWATCH_ENV_KEY+ " making it to startTheGame");

      if (clientNumber == '1') {
        client
        .waitForElementPresent('#initGameButton', client.globals.WAIT)
        .click('#initGameButton')
        .waitForElementPresent('#map', client.globals.WAIT)
        .assert.elementPresent('#map');
      } else {
        client
        .waitForElementPresent('#map', client.globals.WAIT)
        .assert.elementPresent('#map');
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

