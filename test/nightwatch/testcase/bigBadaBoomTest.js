var winston = require('winston');

module.exports = new (function () {
  winston.log('info', 'Winston recording Lobby.js!');

  var BASE_URL = "http://localhost:3000/";
  var wait = 7000;
  var signUpUrl = BASE_URL + 'signup';
  var testCases = this;
  var player = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);

  testCases['Part 1: Two players sign up and join a lovely game'] = function (client) {
    var game = "testgame";
    var gameExpander = '#expand-' + game;
    var goToGameLobby = '#goto-' + game;
    client.resizeWindow(800, 800);

    client
    .url(signUpUrl)
    .waitForElementVisible('#name', wait)
    .setValue('#name', "created_user_" + player)
    .setValue('#email', player + '@create.com')
    .setValue('#username', "created" + player)
    .setValue('#password', 'test')
    .click('#signUpButton')
    .waitForElementVisible('#games-tab', wait)
    .assert.containsText('#games-tab', 'Games')
    .click('#games-tab', function () {
      if (player == 1) {
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

  testCases['Part 2: Once all players are ready, player 1 starts the game'] = function (client) {

    recheckButtonClicked();

    function recheckButtonClicked() {
      client.pause(2000)
      .isVisible('#readyButton', function (result) {
        if (result.value == true) {
          client.click("#readyButton", startTheGame);
        }
        else {
          recheckButtonClicked();
        }
      });
    }

    function startTheGame() {
      if (player == 1) {
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

  testCases['Part 3: Both players proceed to place their orders'] = function (client) {
    client
    .waitForElementPresent('#gameModal', wait)
    .click('#gameModal')
    .pause(1000)
    .elements('xpath', "//i[contains(@class, 'fa fa-plus rotate action-display')]", function (order) {
      for (var i = 0; i < order.value.length; i++) {
        client.elementIdClick(order.value[i].ELEMENT);
      }
    })
    .pause(100)
    .elements('xpath', "//i[contains(@class, 'fa fa-arrow-right move-action')]", function (moveCommand) {
      if (player == 1) {
        client
        .elementIdClick(moveCommand.value[0].ELEMENT)   // select movement for first order
        .pause(100)
        .elementIdClick(moveCommand.value[1].ELEMENT);  // select movement for second order
      } else {
        client.elementIdClick(moveCommand.value[0].ELEMENT);  // select movement for first order
      }
    })
    .pause(200)
    .elements('xpath', "//i[contains(@class, 'fa fa-cog harvest-action')]/..", function (harvestCommand) {
      if (player == 2) {
        //console.log(util.inspect(harvestCommand, false, null));
        client.elementIdClick(harvestCommand.value[1].ELEMENT);  // select movement for second order
      }
    })
    .pause(500);
  };

  testCases['Part 4: Player 1 takes his 1st move'] = function (client) {
    if (player == 1) {
      client.elements('xpath', "//i[contains(@class, 'fa rotate action-display fa-arrow-right')]", function (move) {
        var orderOfInterest = move.value[1].ELEMENT;
        client
        .elementIdClick(orderOfInterest)
        .pause(100)
        .click('xpath', '//*[@id="y_3"]//div[@id="x_4"]/*[2]/*[1]/*[2]')   // click infantry unit
        .pause(100)
        .click('xpath', '//*[@id="y_4"]//div[@id="x_4"]')                  // click empty tile below  (to test moving into an empty area)
        .pause(100)
        .click('xpath', '//*[@id="y_3"]//div[@id="x_4"]/*[2]/*[1]/*[2]')   // click ranged unit
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_4"]')                  // click friendly tile above  (to test merging armies )
        .pause(100)
        .click('xpath', '//*[@id="y_3"]//div[@id="x_4"]/*[2]/*[1]/*[2]')   // click tank unit
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_5"]');                  // click Enemy tile adjacent  (to test combat )
      });
    } else {
      client.waitForElementVisible('#gameModal', wait).click('#gameModal');
    }
  };

  testCases['Part 5: Player 2 takes his 1st move'] = function (client) {
    if (player == 2) {
      client
      .pause(2500)
      .elements('xpath', "//i[contains(@class, 'fa fa-arrow-right rotate action-display')]", function (move) {
        var orderOfInterest = move.value[0].ELEMENT;
        client
        .elementIdClick(orderOfInterest)
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_5"]/*[2]/*[1]/*[2]')   // click ranged unit
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_5"]/*[2]/*[2]/*[2]')   // click tank unit
        .pause(100)
        .click('xpath', '//*[@id="y_3"]//div[@id="x_4"]');                 // click friendly tile above  (to test merging armies )
      });
    } else {
      client.waitForElementVisible('#gameModal', wait).click('#gameModal');
    }
  };

  testCases['Part 6: Player 1 takes his 2nd move'] = function (client) {
    if (player == 1) {
      client
      .pause(2500)
      .elements('xpath', "//i[contains(@class, 'fa fa-arrow-right rotate action-display')]", function (move) {
        var orderOfInterest = move.value[0].ELEMENT;
        client
        .elementIdClick(orderOfInterest)
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_4"]/*[2]/*[1]/*[2]')   // click ranged unit
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_4"]/*[2]/*[2]/*[2]')   // click tank unit
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_4"]/*[2]/*[3]/*[2]')   // click infantry unit
        .pause(100)
        .click('xpath', '//*[@id="y_2"]//div[@id="x_5"]');
      });
    } else {
      client.waitForElementVisible('#gameModal', wait).click('#gameModal');
    }
  };

  testCases.after = function (client) {
    client.pause(10000).end();
  };

});

