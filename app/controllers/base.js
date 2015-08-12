var mongoose = require('mongoose');
var Base = mongoose.model('Base');

exports.index = function (req, res) {
  res.render('games/viewGame');
};

exports.getMap = function (req, res) {
  var _query = Base.find();
  _query.exec(function (err, data) {
    if (err) return next(err);
    res.setHeader("Content-Type", 'application/jsonp');
    res.jsonp(data);
  });
};

exports.getRaceHistory = function (req, res) {
  var race = req.url.replace(/\/getRaceHistory.*\//, "");
  var data = Base.schema.raceHistory[race];
  res.setHeader("Content-Type", 'application/jsonp');
  res.jsonp(data);
};