module.exports = new (function () {

  var testCases = this;
  var clientNumber = process.env.__NIGHTWATCH_ENV_KEY.toString().slice(-1);
  testCases['player logs in successfully'] = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);

    client
    .url('http://localhost:3000/login')
    .waitForElementVisible('#email', client.globals.WAIT)
    .setValue('#email', clientNumber + "@test.com")
    .setValue('#password', 'test', function(){
      client.click('button[type=submit]');
    })
    .waitForElementVisible('a[title="Your Games"]', client.globals.WAIT)
    .assert.containsText('a[title="Your Games"]', 'Games');
  };

  testCases['player login failed, wrong password'] = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);

    client
    .url('http://localhost:3000/login')
    .waitForElementVisible('#email', client.globals.WAIT)
    .setValue('#email', clientNumber + "@test.com")
    .setValue('#password', 'bad password', function(){
      client.click('button[type=submit]');
    })
    .waitForElementVisible('body > div > div.messages > div > ul > li', client.globals.WAIT)
    .useXpath()
    .assert.containsText('/html/body/div/div[2]/div/ul/li', client.globals.WRONG_LOGIN_MESSAGE);

  };
  testCases.after = function (client) {
    console.log(process.env.__NIGHTWATCH_ENV_KEY);
    client
    .getLogTypes(function(result) {
      console.log(result);
    })
    .getLog(client, function(result) {
      console.log(result);
    })
    .end();
  };
});