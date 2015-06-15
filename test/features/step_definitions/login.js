var mongoose = require('mongoose')
, app = require('../../../server');

var LOGIN_BASE_URL = '/login';

const Browser = require('zombie');
Browser.localhost('example.com', 3000);

var loginStepDefinitionsWrapper = function () {
  const browser = new Browser();

  this.Given(/^User visits login screen/, function (callback) {
    browser.visit(LOGIN_BASE_URL, callback);
  });

  this.When(/^User attempts to login with email '([^"]*)' and password '([^"]*)'$/, function (email, password, callback) {
    browser
    .fill('Email', email)
    .fill('Password', password)
    .pressButton('Log in', callback);
  });

  this.Then(/^The user sees error message '([^"]*)'$/, function (errorMessage, callback) {
    browser.assert.success();
    browser.assert.text("li", new RegExp(errorMessage));
    callback();
  });

  this.Then(/^The user is redirected to the home screen$/, function(callback) {
    browser.assert.success();
    browser.assert.text('title', 'Login | juntowars');
    callback();
  });

  this.Given(/^The Nav Bar now has the headers '([^"]*)', '([^"]*)' and '([^"]*)'$/, function(games, profile, logout, callback) {
    browser.assert.text("a", new RegExp(games));
    browser.assert.text("a", new RegExp(profile));
    browser.assert.text("a", new RegExp(logout));
    callback();
  });
};
module.exports = loginStepDefinitionsWrapper;