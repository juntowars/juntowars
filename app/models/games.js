/**
 * Module dependencies.
 */

var util = require('util');
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
    activePlayer: {type: String, default: ""},
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
  harvest: {
    geoEngineers: {
      currentAmount: {type: Number, default: 0},
      collectionRate: {type: Number, default: 1}
    },
    settlers: {
      currentAmount: {type: Number, default: 0},
      collectionRate: {type: Number, default: 1}
    },
    kingdomWatchers: {
      currentAmount: {type: Number, default: 10},
      collectionRate: {type: Number, default: 1}
    },
    periplaneta: {
      currentAmount: {type: Number, default: 11},
      collectionRate: {type: Number, default: 2}
    },
    reduviidae: {
      currentAmount: {type: Number, default: 0},
      collectionRate: {type: Number, default: 1}
    },
    guardians: {
      currentAmount: {type: Number, default: 0},
      collectionRate: {type: Number, default: 1}
    }
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
  displayOpeningModal: [String],
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
  getRacesWithMovesAvailableOrderList: function (room, cb) {

    var racesWithMovesAvailableOrderList = [];
    staticGames.find({"name": room}).exec(function (err, data) {
      var allTilesWithUnits = data[0].state.units;
      for (var i = 0; i < allTilesWithUnits.length; i++) {
        if (allTilesWithUnits[i].order == "move") {
          if (racesWithMovesAvailableOrderList.indexOf(allTilesWithUnits[i].race) < 0) {
            racesWithMovesAvailableOrderList.push(allTilesWithUnits[i].race);
          }
        }
      }
      winston.info("racesWithMovesAvailableOrderList " + racesWithMovesAvailableOrderList.sort());
      cb(racesWithMovesAvailableOrderList.sort());
    });
  },
  getUuidByRace: function (room, race, cb) {
    staticGames.find({"name": room}).exec(function (err, data) {
      if (err) winston.info("getRacesWithMovesAvailableOrderList failed with: " + err);
      cb(eval("data[0]._doc.userList." + race));
    }
    );
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
    if (!(typeof index !== 'undefined' && index)) {
      console.log("index is undefined . . ");
      callback(true);
    } else {
      Promise.all([GamesSchema.statics.getTilesUnits(gameName, index)])
      .then(function (data) {
        var tile = data[0][0]._doc.state.units[0];
        winston.info("doesTheTileContainUnits " + tile.infantry + " " + tile.ranged + " " + tile.tanks);
        var isTileEmpty = (tile.infantry + tile.ranged + tile.tanks) > 0;
        winston.info("isTileEmpty" + isTileEmpty + " value of units is " + (tile.infantry + tile.ranged + tile.tanks));
        callback((tile.infantry + tile.ranged + tile.tanks) > 0);
      });
    }
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
  setActivePlayer: function (gameName, nextActiveRace, cb) {
    staticGames.find({"name": gameName}).exec(function (err, res) {
      if (err) throw err;
      var playerName = eval("res[0]._doc.userList." + nextActiveRace);
      staticGames.update({"name": gameName}, {$set: {"state.activePlayer": playerName}}).exec(cb(playerName));
    });
  },
  getActivePlayer: function (gameName, cb) {
    this.find({"name": gameName}).exec(function (err, res) {
      if (err) winston.debug("Error getting activePlayer: " + err);
      var activePlayer = res[0]._doc.state.activePlayer;
      cb(activePlayer);
    });
  },
  checkIfPlayerHasMovesLeft: function (gameName, race, cb) {
    staticGames.find({
      "name": gameName,
      "state.units.race": race,
      "state.units.order": "move"
    }).count().exec(function (err, res) {
      if (err) winston.log("checkIfPlayerHasMovesLeft: " + err);
      return res;
    });
  },
  setPhase: function (gameName, phase) {
    staticGames.update({"name": gameName}, {$set: {"state.phase.name": phase}}).exec();
  },
  displayOpeningModalCheck: function (gameName, user, cb) {
    staticGames.find({"name": gameName}).exec(function (err, data) {
      if (data[0]._doc.displayOpeningModal.indexOf(user) < 0) {
        winston.info('adding ' + user + ' to displayOpeningModal seen list');
        staticGames.update({"name": gameName}, {$addToSet: {displayOpeningModal: user}}
        ).exec(cb(true));
      } else {
        winston.info(user + ' has seen the opening Modal');
        cb(false);
      }
    });
  },
  getHarvestInformation: function (gameName, cb) {
    staticGames.find({"name": gameName}).exec(function (err, data) {
      cb(data[0]._doc.harvest);
    });
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
              "order": "done",
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
  addToCurrentUnitValue: function (gameName, index, unitType, unitValue, unitRace, callback) {
    if (unitType == "infantry") {
      staticGames.update({
        "name": gameName,
        "state.units": {
          $elemMatch: {"index": index}
        }
      }, {
        $inc: {"state.units.$.infantry": unitValue}
      }
      ).exec(callback);
    } else if (unitType == "ranged") {
      staticGames.update(
      {
        "name": gameName,
        "state.units": {
          $elemMatch: {"index": index}
        }
      }, {
        $inc: {"state.units.$.ranged": unitValue}
      }).exec(callback);
    } else {
      staticGames.update(
      {
        "name": gameName,
        "state.units": {
          $elemMatch: {"index": index}
        }
      }, {
        $inc: {"state.units.$.tanks": unitValue}
      }).exec(callback);
    }
  },
  minusOneFromUnitValue: function (gameName, index, unitType) {
    if (unitType == "infantry") {
      staticGames.update({
        "name": gameName,
        "state.units": {
          $elemMatch: {"index": index}
        }
      }, {
        $inc: {"state.units.$.infantry": -1}
      }
      ).exec();
    } else if (unitType == "ranged") {
      staticGames.update(
      {
        "name": gameName,
        "state.units": {
          $elemMatch: {"index": index}
        }
      }, {
        $inc: {"state.units.$.ranged": -1}
      }).exec();
    } else {
      staticGames.update(
      {
        "name": gameName,
        "state.units": {
          $elemMatch: {"index": index}
        }
      }, {
        $inc: {"state.units.$.tanks": -1}
      }).exec();
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
  updateWaitingOnListAndCheckIfEmpty: function (user, gameName, callback) {
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
