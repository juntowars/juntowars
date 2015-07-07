module.exports = new (function () {

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['players signs up for account'] = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);

    client
    .url('http://localhost:3000/signup')
    .waitForElementVisible('#name', client.globals.WAIT)
    .setValue('#name', "created_user_" + clientNumber)
    .setValue('#email', clientNumber + '@create.com')
    .setValue('#username', "created" + clientNumber)
    .setValue('#password', "test")
    .click('button[type=submit]')
    .waitForElementVisible('a[title="Your Games"]', client.globals.WAIT)
    .assert.containsText('a[title="Your Games"]', 'Games');
  };
  testCases.after = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);
    client.end();
  };
});