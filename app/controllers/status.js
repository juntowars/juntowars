var express =  require('express');

var app =  express();
module.exports.getStatus = function(req, res) {
  var environment = process.env.NODE_ENV.toString();
  res.render('status', {server: environment, numberOfUsers: "not yet defined"});
};
