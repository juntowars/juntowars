/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Promise = require("bluebird");
var winston = require('winston');
var Schema = mongoose.Schema;

/**
 * Games Schema
 */
var GamesSchema = new Schema({
  name: {type: String, default: '', trim: true, unique: true},
  state: {
    round: {type: Number, default: '1'},
    phase: {type: String, default: '1'},
    nextToMove: {type: String, default: ''},
    units: []
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
  lobby: {
    status:  {type: String, default: 'open'},
    playerStatus: [
      {
        uuid:{type: String, default: ''},
        ready:{type: Boolean, default: false}
      }
    ]
  },
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
  updatePlayersReadyStatus: function(gameName,uuid,cb){
      var updates = [];
      updates.push(staticGames.update({"name" : gameName,"lobby.playerStatus.uuid":uuid},{$set :{"lobby.playerStatus.$.ready": true}}).exec());
      Promise.all(updates).then(function () {
        cb();
      });
  },
  getPlayersReadyStatus: function(gameName,cb){
    var currentLobbyStatus = [];
    staticGames.find({"name" : gameName },{"lobby.playerStatus":1,"_id":0}, function(error, playerStatus){
      if (error) return winston.error(error);
      playerStatus.forEach(function(status){
        currentLobbyStatus.push(status._doc.lobby.playerStatus)
      });
      cb(gameName,currentLobbyStatus)
    })
  },
  getOpenGamesList: function (uuid, gameList, fn) {
    var _listOfOpenGames = [];
    var _query = this.find({
      "lobby.status": "open",
      "adminUser": {
        $ne: uuid
      }
    });
    _query.exec(function (err, openGames) {
      if (err) return next(err);
      openGames.forEach(function (game) {
        _listOfOpenGames.push(game.name.replace(/\s+/g, '-'));
      });
      fn(gameList, _listOfOpenGames);
    });
  },
  getGameByTitle: function (userId, gameTitle, callback) {
    var _query = this.find({"name": gameTitle});
    _query.exec(function (err, gameDoc) {
      if (err) return next(err);
      callback(gameDoc);
    });
  },
  addUserToList: function (gameName, user, socket, callback) {
    var _query = this.find({"name": gameName, "lobby.status": "open"});

    _query.exec(function (err, gameDoc) {
      var gameObject = gameDoc[0]._doc;

      if (err) callback(err, null);

      if (gameObject.userList.uuids.length < 6) {
        if (gameObject.userList.uuids.indexOf(user) == -1) {
          gameObject.userList.uuids.push(user);
          gameObject.lobby.playerStatus.push({uuid:user});
          gameDoc[0].save(function (err) {
            if (err) winston.info("An error has occurred: " + err);
            callback(gameName);
          });
        }
      } else {
        winston.error("An error has occurred. Lobby not available.");
      }
    });
  },
  findUserInOpenLobbiesQuery: function (user, cb) {
    this.find({"lobby.status": "open", "userList.uuids": {$in: [user]}}, function (err, res) {
      err ? cb(err, null, user) : cb(null, res, user);
    });
  },
  markLobbyAsClosed: function (gameName) {
    staticGames.update({"name": gameName, "lobby.status": "open"}, {$set: {"lobby.status": "closed"}}).exec();
  },
  removeUserFromOpenLobbiesQuery: function (err, gameDocs, user, cb) {
    if (err) return err;
    else {
      var updates = [];
      var gamesList = [];
      gameDocs.forEach(function (game) {
        gamesList.push(game.name);
        updates.push(staticGames.update({"name": game.name}, {$pull: {"userList.uuids": user}}).exec());
        updates.push(staticGames.update({"name": game.name}, { $pull: { "lobby.playerStatus" : { uuid: user }}}).exec());
      });

      Promise.all(updates).then(function () {
        cb(gamesList);
      });
    }
  }
};

mongoose.model('Games', GamesSchema);
