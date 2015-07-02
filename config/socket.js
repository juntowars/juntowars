var users = require('../app/controllers/users');
var games = require('../app/controllers/games');
var base = require('../app/controllers/base');
var mongoose = require('mongoose');
var Games = mongoose.model('Games');

module.exports = function (io) {

  io.sockets.on('connection', function (socket) {
    socket.on('send', function (room, data) {
      io.sockets.in(room).emit('message', data);
    });

    socket.on('userReady', function (room, userName) {

      function updateClientsWithReadyStatus(room,arrayOfUsersStatus){
        io.sockets.in(room).emit('refreshLobbyStatus',  {playerStatus: arrayOfUsersStatus[0]} );
      }

      function getLobbyReadyState(){
        Games.getPlayersReadyStatus(room,updateClientsWithReadyStatus);
      }

      Games.updatePlayersReadyStatus(room, userName, getLobbyReadyState);
    });

    socket.on('showStartButton', function (room) {
      io.sockets.in(room).emit('displayStartButton');
    });

    socket.on('create', function (room, user) {

      function updateLobby(room, arrayOfUsersStatus){
        io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});
      }

      function joinRoom(game) {
          socket.join(room);
          Games.getPlayersReadyStatus(game, updateLobby);
          var message_text = socket.user + ' has joined the chat';
          io.sockets.in(room).emit('message', {message: message_text});
      }

      console.log(user + " is in room " + room);
      Games.addUserToList(room, user, socket, joinRoom );
      socket.user = user;
    });

    socket.on('disconnect', function(){
      function updateLobby(room, arrayOfUsersStatus){
        io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});
        var message_text = socket.user + ' has left the chat';
        io.sockets.in(room).emit('message', {message: message_text});
      }

      function tellThePeople(gamesList){
        gamesList.forEach(function(game){
          Games.getPlayersReadyStatus(game, updateLobby);
        });
      }

      function updateAffectedLobbies(err, res, user) {
        Games.removeUserFromOpenLobbiesQuery(err, res, user,tellThePeople);
      }

      Games.findUserInOpenLobbiesQuery(socket.user, updateAffectedLobbies);
    });

  });
};
