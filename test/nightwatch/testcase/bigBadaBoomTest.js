var winston = require('winston');

module.exports = new (function () {
  winston.log('info', 'Winston recording Lobby.js!');

  var BASE_URL = "http://localhost:3000/";
  var wait = 2000;
  var signUpUrl = BASE_URL + 'signup';
  var testCases = this;
  var cNum = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  var game = "testgame";
  var gameExpander = '#expand-' + game;
  var goToGameLobby = '#goto-' + game;

  testCases['Part 1: Two players sign up and join a lovely game'] = function (client) {
    client
    .url(signUpUrl)
    .waitForElementVisible('#name', wait)
    .setValue('#name', "created_user_" + cNum)
    .setValue('#email', cNum + '@create.com')
    .setValue('#username', "created" + cNum)
    .setValue('#password', 'test')
    .click('#signUpButton')
    .waitForElementVisible('#games-tab', wait)
    .assert.containsText('#games-tab', 'Games')
    .click('#games-tab', function () {
      if (cNum == 1) {
        client
        .pause(500)
        .setValue('#gameTitle', game)
        .click('#createNewGameButton');
      } else {
        client.pause(1000).click('#games-tab');
      }
    })
    .waitForElementVisible(gameExpander, wait)
    .click(gameExpander)
    .waitForElementVisible(goToGameLobby, wait)
    .click(goToGameLobby);
  };

  testCases['Part 2: Once all players ready, user one clicks start button'] = function (client) {

    recheckButtonClicked();

    function recheckButtonClicked() {
      client.pause(2000)
      .isVisible('#readyButton', function (result) {
        winston.log('debug', "readyButton is " + result.value);
        if (result.value == true) {
          client.click("#readyButton", startTheGame);
        }
        else {
          recheckButtonClicked();
        }
      });
    }

    function startTheGame() {
      if (cNum == 1) {
        client.waitForElementPresent('#initGameButton', wait)
        .click('#initGameButton');
      }
      else {
        client.pause(1000);
      }
      client.waitForElementPresent('#map', wait)
      .assert.elementPresent('#map');
    }
  };

  testCases['Part 3: Both player proceed to place there orders'] = function (client) {
    client
    .waitForElementPresent('#gameModal', wait)
    .click('#gameModal')
    .pause(1000)
    .elements('id', 'order', function (order) {
      for (var i = 0; i < order.value.length; i++) {
        client
        .elementIdClick(order.value[i].ELEMENT)  //this line was a fucking nightmare to figure out, fuck you world
        .pause(1000)
        .elements('class name', 'move-action', function (movecommand) {
          for (var i = 0; i < movecommand.value.length; i++) {
            client.elementIdClick(movecommand.value[i].ELEMENT).pause(1000);
          }
        });
      }
    }).pause(10000);
  };

  testCases.after = function (client) {
    client.end();
  };

});

