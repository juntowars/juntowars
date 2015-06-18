/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Games Schema
 */
var GamesSchema = new Schema({
  name: {type: String, default: '', trim: true, unique: true},
  state: {
    round: {type: Number, default: '1'},
    phase: {type: String, default: '1'},
    nextToMove: {type: String, default: ''}
  },
  userList: {
    uuids: [{type: String, default: ''}],
    geoEngineers: {type: String, default: ''},
    settlers: {type: String, default: ''},
    kingdomWatchers: {type: String, default: ''},
    periplaneta: {type: String, default: ''},
    reduviidae: {type: String, default: ''},
    guardians: {type: String, default: ''}
  },
  chatLog: [{
    body: {type: String, default: ''},
    user: {type: String},
    createdAt: {type: Date, default: Date.now}
  }],
  gameLog: [{
    body: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now}
  }],
  publicJoin: {type: Boolean, default: true},
  lobby: {type: String, default: 'open'},
  adminUser: {type: String, default: ''},
  createdAt: {type: Date, default: Date.now}
});

var staticGames = mongoose.model('games', GamesSchema);
GamesSchema.path('name').required(true, 'Games name cannot be blank');
GamesSchema.methods = {};
GamesSchema.statics = {
  getUsersGamesList: function (req, callback) {
    var _listOfGameNames = [];

    var _query = this.find(
    {"adminUser": req.user._doc.username},
    {"name": 1},
    {
      sort: {createdAt: -1}
    });

    _query.exec(function (err, gamesOwned) {
      if (err) return next(err);
      gamesOwned.forEach(function (game) {
        _listOfGameNames.push(game.name.replace(/\s+/g, '-'));
      });
      callback(req, _listOfGameNames);
    });
  },
  getOpenGamesList: function (uuid, gameList, fn) {
    var _listOfOpenGames = [];
    var _query = this.find({
      "lobby": "open",
      "adminUser": {
        $ne: uuid
      }
    });
    _query.exec(function (err, openGames) {
      if (err) return next(err);
      openGames.forEach(function (game) {
        _listOfOpenGames.push(game.name.replace(/\s+/g, '-'));
      });
      if (typeof fn == "function") {
        fn(gameList, _listOfOpenGames);
      } else {
        console.log("Render is a what?: " + fn)
      }
    });
  },
  getGameByTitle: function (userId, gameTitle, callback) {
    var _query = this.find({"name": gameTitle});
    _query.exec(function (err, gameDoc) {
      if (err) return next(err);
      callback(gameDoc);
    });
  },
  getUsersInAGame: function (gameName, callback) {
    var _query = this.find({"name": gameName});
    _query.exec(function (err, gameDoc) {
      if (err) callback(err);
      callback(gameName,gameDoc[0]._doc.userList.uuids);
    });
  },
  addUserToList: function (gameName, user, socket, callback) {

    var _query = this.find({"name": gameName, "lobby": "open"});
    _query.exec(function (err, gameDoc) {

      var gameObject = gameDoc[0]._doc;

      if (err) callback(err, null);

      if (gameObject.userList.uuids.length < 6) {
        if (gameObject.userList.uuids.indexOf(user) == -1) {
          gameObject.userList.uuids.push(user);
          gameDoc[0].save(function (err) {
            if (err) callback(err, null, socket);
          });
        }
        callback(null, gameObject.userList.uuids, socket);
      } else {
        callback("An error has occurred. Lobby not available.", null, socket);
      }
    });
  },

  findUserInOpenLobbiesQuery: function (user, cb) {
    this.find({"lobby": "open", "userList.uuids": {$in: [user]}}, function (err, res) {
      err ? cb(err, null, user) : cb(null, res, user);
    });
  },

  removeUserFromOpenLobbiesQuery: function (err, gameDocs, user, cb) {

    var finished = gameDocs.length;
    function pullUser(name, user,gamesList) {
      staticGames.update({"name": name}, {$pull: {"userList.uuids": user}}).exec(done(gamesList));
    }

    function done(gamesList) {
      finished--;
      if (finished == 0) {
        cb(gamesList);
      }
    }

    if (err) {
      return err;
    }
    else {
      var gamesList = [];
      gameDocs.forEach(function (game) {
        gamesList.push(game.name);
        pullUser(game.name, user, gamesList);
      });
    }
  }
};

mongoose.model('Games', GamesSchema);
