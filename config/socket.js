var users = require('../app/controllers/users');
var games = require('../app/controllers/games');
var base = require('../app/controllers/base');
var mongoose = require('mongoose');
var winston = require('winston');
var Promise = require("bluebird");
var Games = mongoose.model('Games');

module.exports = function (io) {

  io.sockets.on('connection', function (socket) {

    //lobby Methods
    socket.on('send', function (room, data) {
      io.sockets.in(room).emit('message', data);
    });

    socket.on('userReady', function (room, userName) {

      var playersToPlay = 2;

      function updateClientsWithReadyStatus(room, arrayOfUsersStatus) {
        io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});

        if (arrayOfUsersStatus[0].length == playersToPlay) {
          var count = 0;
          for (var i = 0; i < playersToPlay; i++) {
            if (arrayOfUsersStatus[0][i].ready) count++;
            if (count == playersToPlay) io.sockets.in(room).emit('displayStartButton');
          }
        }
      }

      function getLobbyReadyState() {
        Games.getPlayersReadyStatus(room, updateClientsWithReadyStatus);
      }

      Games.setPlayersReadyStatus(room, userName, getLobbyReadyState);
    });

    socket.on('create', function (room, user) {

      function updateLobby(room, arrayOfUsersStatus) {
        io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});
      }

      function joinRoom(game) {
        socket.join(room);
        Games.getPlayersReadyStatus(game, updateLobby);
        var message_text = socket.user + ' has joined the chat';
        io.sockets.in(room).emit('message', {message: message_text});
      }

      winston.log(user + " is in room " + room);
      Games.setUserInLobby(room, user, socket, joinRoom);
      socket.user = user;
    });

    socket.on('startGame', function (room) {
      io.sockets.in(room).emit('redirect');
      Games.setLobbyToClosed(room);
      Games.setPlayerRaces(room);
      Games.setWaitingOnToAll(room);
    });

    socket.on('disconnect', function () {
      function updateLobby(room, arrayOfUsersStatus) {
        io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});
        var message_text = socket.user + ' has left the chat';
        io.sockets.in(room).emit('message', {message: message_text});
      }

      function tellThePeople(gamesList) {
        gamesList.forEach(function (game) {
          Games.getPlayersReadyStatus(game, updateLobby);
        });
      }

      function updateAffectedLobbies(err, res, user) {
        Games.removeUserFromOpenLobbiesQuery(err, res, user, tellThePeople);
      }

      Games.getUsersOpenLobbiesList(socket.user, updateAffectedLobbies);
    });

    //game Methods
    socket.on('createGame', function (room, user) {
      socket.join(room);
      winston.info(user + " has joined the game " + room);
      socket.user = user;
      io.sockets.in(room).emit('displayActionModal',
      {
        message: "<h1>Welcome to the Game</h1><p>Place your Orders Mother fuckers!</p>"
      });
    });

    socket.on('lockInOrder', function (action, playerName, gameRoom, index) {
      winston.info(playerName + " has locked in a " + action + ' order for tile ' + index);
      Games.setPlayerOrder(action, playerName, gameRoom, index);
    });

    socket.on('allOrdersAreSet', function (room, user) {
      winston.info("Player " + user + " has set all there orders for " + room);
      Games.removeUserFromWaitingOnListAndCheckIfListIsEmpty(user, room, enableOrders);

      function enableOrders(allOrdersAreSet) {
        if (allOrdersAreSet) {
          Games.setPhase(room, "movement");
          winston.info("All player orders have been set for game " + room);
          winston.info("Enabling move for  " + user);
          io.sockets.in(room).emit('enableMoves', user);
        } else {
          winston.info("Waiting for other players place orders . .");
        }
      }
    });

    socket.on('peacefulMove', function (movementDetails, cb) {
      var gameRoom = movementDetails.gameRoom;
      var originIndex = movementDetails.originIndex;
      var targetIndex = movementDetails.targetIndex;
      var unitType = movementDetails.unitType;
      var unitValue = movementDetails.unitValue;
      var unitRace = movementDetails.unitRace;

      winston.info("peacefulMove " + movementDetails);

      var removeUnitFromOrigin = Games.updateUnitsValues(gameRoom, originIndex, unitType, 0, unitRace, function () {
        Games.doesTheTileContainUnits(gameRoom, originIndex, function (tileContainsUnits) {
          if (!tileContainsUnits) {
            winston.info("Tile " + originIndex + " has no units, removing unit doc");
            Games.removeUnitsDoc(gameRoom, originIndex);
          }
        });
      });

      var addUnitToTarget = Games.setUnitDocForIndex(gameRoom, targetIndex, function () {
        Games.updateUnitsValues(gameRoom, targetIndex, unitType, unitValue, unitRace);
      });

      Promise.all([removeUnitFromOrigin, addUnitToTarget]).then(cb);
    });
  });
};
