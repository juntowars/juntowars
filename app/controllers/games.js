/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Games = mongoose.model('Games');
var Base = mongoose.model('Base');
var User = mongoose.model('User');
var utils = require('../../lib/utils');
var extend = require('util')._extend;

/**
 * Load
 */

exports.load = function (req, res, next, id) {
  var User = mongoose.model('User');

  Games.load(id, function (err, Games) {
    if (err) return next(err);
    if (!Games) return next(new Error('not found'));
    req.Games = Games;
    next();
  });
};

/**
 * Home
 */

exports.index = function (req, res) {
  res.render('games/index');
};

/**
 * Dashboard
 */

exports.dashboard = function (req, res) {
  buildDashboard(req, res);
};

/**
 * New Games
 */

exports.new = function (req, res) {
  res.render('games/new', {
    title: 'New Games',
    Games: new Games({})
  });
};

exports.create = function (req, res) {
  var game = new Games();
  game.name = req.body.gameTitle;
  game.adminUser = req.user._doc.username;
  game.state.units = Base.getDefaultUnitsSetUp();

  game.save(function (err) {
    if (err) {
      if (err.code) {
        return res.render('games/dashboard', {
          error: 'An active game already has that name try something different',
          title: 'Error Creating Game',
          gameList: {},
          gamesToJoin: {}

        });
      } else {
        return res.render('games/dashboard', {
          error: utils.errors(err.errors),
          title: 'Error Creating Game'
        });
      }
    }
    buildDashboard(req, res);
  });
};

function buildDashboard(req, res) {
  function doRender(gameList, gamesToJoin) {
    res.render('games/dashboard', {gameList: gameList, gamesToJoin: gamesToJoin});
  }

  function getOpenGames(req, gameList) {
    Games.getOpenGamesList(req.user._doc.username, gameList, doRender);
  }

  Games.getUsersGamesList(req, getOpenGames);
}

exports.viewGame = function (req, res) {
  var gameTitle = req.url.replace("/games/view/", "");
  console.log("Viewing gameTitle: " + gameTitle);
  Games.getGameByTitle(req.user._doc.username, gameTitle, doRender);
  function doRender(gameDoc) {
    res.render('games/viewGame', {gameList: gameDoc});
  }
};

exports.viewGameLobby = function (req, res) {
  var gameTitle = req.url.replace("/games/lobby/", "");
  Games.getGameByTitle(req.user._doc.username, gameTitle, parseLobbyData);

  function parseLobbyData(gameDoc) {
    var _usersList = [];

    if (gameDoc["0"]._doc.userList.uuids.length >= 6) {
      return res.render('games/dashboard', {
        error: 'Too many people in this lobby',
        title: 'Unable to join',
        gameList: {},
        gamesToJoin: {}
      });
    } else {
      gameDoc["0"]._doc.userList.uuids.forEach(function (uuid) {
        _usersList.push(uuid);
      });
      doRender(_usersList);
    }
  }

  function doRender(usersList) {
    res.render('games/lobby', {usersList: usersList, userName: req.user.username});
  }
};

/**
 * Edit an Games
 */

exports.getMapUnits = function (req, res) {
  var gameName = req.url.replace("/getMapUnits/","");
  var _query = Games.find({"name" : gameName},{"state.units" :1});
  _query.exec(function (err, data) {
    if (err) return console.log("EROROROROROR " + err);
    res.setHeader("Content-Type", 'application/jsonp');
    res.jsonp(data[0].state.units);
  });
};

/**
 * Update Games
 */

exports.update = function (req, res) {
  var Games = req.Games;
  var images = req.files.image
  ? [req.files.image]
  : undefined;

  // make sure no one changes the user
  delete req.body.user;
  Games = extend(Games, req.body);

  Games.uploadAndSave(images, function (err) {
    if (!err) {
      return res.redirect('/games/' + Games._id);
    }

    res.render('games/edit', {
      title: 'Edit Games',
      Games: Games,
      errors: utils.errors(err.errors || err)
    });
  });
};

/**
 * Show
 */


exports.show = function (req, res) {
  res.render('games/show', {
    title: req.Games.title,
    Games: req.Games
  });
};

/**
 * Delete
 */

exports.destroy = function (req, res) {
  var Games = req.Games;
  Games.remove(function () {
    req.flash('info', 'Deleted successfully');
    res.redirect('/games');
  });
};
