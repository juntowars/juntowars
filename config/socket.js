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

    socket.on('create', function (room, user) {

      function updateUserList(err, userList, socket) {
        if (err) {
          socket.emit('message', {message: err});
        }
        else {
          socket.join(room);
          socket.emit('userJoined', {userList: userList});
          var message_text = socket.user + ' has joined the chat';
          io.sockets.in(room).emit('message', {message: message_text});
        }
      }

      console.log(user + " is in room " + room);

      Games.addUserToList(room, user, socket, updateUserList);
      socket.user = user;
    });
  });
};
