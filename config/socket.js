var users = require('../app/controllers/users');
var games = require('../app/controllers/games');
var base = require('../app/controllers/base');
var mongoose = require('mongoose');
var winston = require('winston');
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

      Games.updatePlayersReadyStatus(room, userName, getLobbyReadyState);
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
      Games.addUserToList(room, user, socket, joinRoom);
      socket.user = user;
    });

    socket.on('startGame', function (room) {
      io.sockets.in(room).emit('redirect');
      Games.markLobbyAsClosed(room);
      Games.assignRaces(room);
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

      Games.findUserInOpenLobbiesQuery(socket.user, updateAffectedLobbies);
    });

    //game Methods
    socket.on('createGame', function (room, user) {
      winston.info(user + " is in game: " + room);
      socket.user = user;
      io.sockets.emit('displayActionModal', user);
    });

    socket.on('gameOrdersSet', function (room, user) {
      winston.info("USER: " + user + " has set orders for " + room);
      var gameName = room;
      Games.removeUserFromWaitingOnListAndCheckIfListIsEmpty(user, gameName, enableOrders);

      function enableOrders(allOrdersAreSet) {
        if (allOrdersAreSet) {
          winston.info("enableMoves: room=" + room);
          io.sockets.emit('enableMoves');
        } else {
          winston.info("Not yet, no . . . we wait");
        }
      }
    });
  });
};
