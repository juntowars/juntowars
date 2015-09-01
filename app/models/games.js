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
    phase: {
      name: {type: String, default: 'orders'},
      waitingOn: []
    },
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
  displayOpeningModal: {type: String, default: 1},
  lobby: {
    status: {type: String, default: 'open'},
    playerStatus: [
      {
        uuid: {type: String, default: ''},
        ready: {type: Boolean, default: false}
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
  getPlayersInGame: function (room) {
    return staticGames.find({"name": room}, {"userList.uuids": 1}).exec();
  },
  getPlayersRace: function (gameName, user, cb) {
    var _query = staticGames.find({"name": gameName}, {"userList": 1});
    _query.exec(function (err, data) {
      if (err) return winston.info("getPlayersRace failed with: " + err);

      var userList = data[0]._doc.userList;
      switch (user) {
        case userList.guardians:
          cb("guardians");
          break;
        case userList.reduviidae:
          cb("reduviidae");
          break;
        case userList.periplaneta:
          cb("periplaneta");
          break;
        case userList.kingdomWatchers:
          cb("kingdomWatchers");
          break;
        case userList.settlers:
          cb("settlers");
          break;
        case userList.geoEngineers:
          cb("geoEngineers");
      }
    });
  },
  getPlayersReadyStatus: function (gameName, cb) {
    var currentLobbyStatus = [];
    staticGames.find({"name": gameName}, {"lobby.playerStatus": 1, "_id": 0}, function (error, playerStatus) {
      if (error) return winston.error(error);
      playerStatus.forEach(function (status) {
        currentLobbyStatus.push(status._doc.lobby.playerStatus)
      });
      cb(gameName, currentLobbyStatus)
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
  doesTheTileContainUnits: function (gameName, index, callback) {
    Promise.all([GamesSchema.statics.getTilesUnits(gameName, index)])
    .then(function (data) {
      var tile = data[0][0]._doc.state.units[0];
      winston.info("doesTheTileContainUnits " + tile.infantry + " " + tile.ranged + " " + tile.tanks);
      var isTileEmpty = (tile.infantry + tile.ranged + tile.tanks) > 0;
      winston.info("isTileEmpty" + isTileEmpty + " value of units is " + (tile.infantry + tile.ranged + tile.tanks));
      callback((tile.infantry + tile.ranged + tile.tanks) > 0);
    });
  },
  getTilesUnits: function (gameName, index) {
    return staticGames.find({
      "name": gameName,
      "state.units": {$elemMatch: {"index": index}}
    }, {"state.units.$.order": 1}).exec();
  },
  getUsersOpenLobbiesList: function (user, cb) {
    this.find({"lobby.status": "open", "userList.uuids": {$in: [user]}}, function (err, res) {
      err ? cb(err, null, user) : cb(null, res, user);
    });
  },
  setLobbyToClosed: function (gameName) {
    staticGames.update({"name": gameName, "lobby.status": "open"}, {$set: {"lobby.status": "closed"}}).exec();
  },
  setUserInLobby: function (gameName, user, socket, callback) {
    var _query = this.find({"name": gameName, "lobby.status": "open"});

    _query.exec(function (err, gameDoc) {
      var gameObject = gameDoc[0]._doc;

      if (err) callback(err, null);

      if (gameObject.userList.uuids.length < 6) {
        if (gameObject.userList.uuids.indexOf(user) == -1) {
          gameObject.userList.uuids.push(user);
          gameObject.lobby.playerStatus.push({uuid: user});
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
  setPlayerRaces: function (gameName) {
    Promise.all([GamesSchema.statics.getPlayersInGame(gameName)]).then(function (data) {
      var listOfUsersToGiveRacesTo = data[0][0]._doc.userList.uuids;
      staticGames.update({"name": gameName}, {$set: {"userList.kingdomWatchers": listOfUsersToGiveRacesTo[0]}}).exec();
      staticGames.update({"name": gameName}, {$set: {"userList.periplaneta": listOfUsersToGiveRacesTo[1]}}).exec();
    });
  },
  setPlayersReadyStatus: function (gameName, uuid, cb) {
    var updates = [];
    updates.push(staticGames.update({
      "name": gameName,
      "lobby.playerStatus.uuid": uuid
    }, {$set: {"lobby.playerStatus.$.ready": true}}).exec());
    Promise.all(updates).then(function () {
      cb();
    });
  },
  setWaitingOnToAll: function (gameName) {
    Promise.all([GamesSchema.statics.getPlayersInGame(gameName)]).then(function (data) {
      var userList = data[0][0]._doc.userList.uuids;
      for (var i = 0; i < userList.length; i++) {
        staticGames.update(
        {"name": gameName},
        {$push: {"state.phase.waitingOn": userList[i]}}
        ).exec();
      }
    });
  },
  setPlayerOrder: function (action, playerName, gameName, index) {
    staticGames.update({
      "name": gameName,
      "state.units": {$elemMatch: {"index": index}}
    }, {$set: {"state.units.$.order": action}}).exec();
  },
  setPhase: function (gameName, phase) {
    staticGames.update({"name": gameName}, {$set: {"state.phase.name": phase}}).exec();
  },
  displayOpeningModalCheck: function (gameName, cb) {
    staticGames.find({"name": gameName}).exec(function (err, data) {
      cb(data[0]._doc.displayOpeningModal == 1);
    });
  },
  markOpeningModalAsSeen: function (gameName) {
    staticGames.update(
    {"name": gameName},
    {
      $set: {
        "displayOpeningModal": 0
      }
    }).exec();
  },
  setUnitDocForIndex: function (gameName, index, callback) {
    var posX = index % 24;
    var posY = (index - posX) / 24;
    winston.info("setUnitDocForIndex " + index);

    staticGames.find({
      "name": gameName,
      "state.units": {$elemMatch: {"index": index}}
    }).exec(function (err, data) {
      if (err) return winston.info("setUnitDocForIndex failed with: " + err);
      if (data.length == 0) {
        winston.info("No data for index " + index + " new doc required");
        staticGames.update(
        {"name": gameName},
        {
          $push: {
            "state.units": {
              "order": "notSet",
              "tanks": 0,
              "ranged": 0,
              "infantry": 0,
              "race": null,
              "index": index,
              "posY": posY,
              "posX": posX
            }
          }
        }).exec(callback);
      } else {
        callback();
      }
    });
  },
  updateUnitsValues: function (gameName, index, unitType, unitValue, unitRace, callback) {
    //todo find the current value and add unitValue
    if (unitType == "infantry") {
      staticGames.update(
      {"name": gameName, "state.units": {$elemMatch: {"index": index}}},
      {
        $set: {
          "state.units.$.infantry": unitValue,
          "state.units.$.race": unitRace
        }
      }).exec(callback);
    } else if (unitType == "ranged") {
      staticGames.update(
      {"name": gameName, "state.units": {$elemMatch: {"index": index}}},
      {
        $set: {
          "state.units.$.ranged": unitValue,
          "state.units.$.race": unitRace
        }
      }).exec(callback);
    } else {
      staticGames.update(
      {"name": gameName, "state.units": {$elemMatch: {"index": index}}},
      {
        $set: {
          "state.units.$.tanks": unitValue,
          "state.units.$.race": unitRace
        }
      }).exec(callback);
    }
  },
  removeUserFromOpenLobbiesQuery: function (err, gameDocs, user, cb) {
    if (err) return err;
    else {
      var updates = [];
      var gamesList = [];
      gameDocs.forEach(function (game) {
        gamesList.push(game.name);
        updates.push(staticGames.update({"name": game.name}, {$pull: {"userList.uuids": user}}).exec());
        updates.push(staticGames.update({"name": game.name}, {$pull: {"lobby.playerStatus": {uuid: user}}}).exec());
      });

      Promise.all(updates).then(function () {
        cb(gamesList);
      });
    }
  },
  removeUserFromWaitingOnList: function (gameName, user) {
    return staticGames.update({"name": gameName}, {$pull: {"state.phase.waitingOn": user}}).exec();
  },
  removeUserFromWaitingOnListAndCheckIfListIsEmpty: function (user, gameName, callback) {
    Promise.all([GamesSchema.statics.removeUserFromWaitingOnList(gameName, user)]).then(function () {
      staticGames.find({"name": gameName}, {"state.phase.waitingOn": 1}).exec().then(function (data) {
        data[0]._doc.state.phase.waitingOn.length > 0 ? callback(false) : callback(true);
      });
    });
  },
  removeUnitsDoc: function (gameName, index) {
    staticGames.update({
      "name": gameName
    }, {
      $pull: {
        "state.units": {"index": index}
      }
    }).exec();
  }
};

mongoose.model('Games', GamesSchema);
