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
      console.log(userName+" just clicked his status");
      io.sockets.in(room).emit('message', {message:  userName+" just clicked his status"} );
    });

    socket.on('create', function (room, user) {
      function updateUserList(err, userList, socket) {
        if (err) {
          socket.emit('message', {message: err});
        }
        else {
          socket.join(room);
          io.sockets.in(room).emit('updateUsersList', {userList: userList});
          var message_text = socket.user + ' has joined the chat';
          io.sockets.in(room).emit('message', {message: message_text});
        }
      }

      console.log(user + " is in room " + room);

      Games.addUserToList(room, user, socket, updateUserList);
      socket.user = user;
    });

    socket.on('disconnect', function(){
      function updateAffectedLobbies(err, res, user) {
        Games.removeUserFromOpenLobbiesQuery(err, res, user,tellThePeople);
      }

      function updateLobby(room, userList){
        io.sockets.in(room).emit('updateUsersList', {userList: userList});
        var message_text = socket.user + ' has left the chat';
        io.sockets.in(room).emit('message', {message: message_text});
      }

      function tellThePeople(gamesList){
        gamesList.forEach(function(game){
          Games.getUsersInAGame(game, updateLobby);
        });
      }
      Games.findUserInOpenLobbiesQuery(socket.user, updateAffectedLobbies);
    });

  });
};
