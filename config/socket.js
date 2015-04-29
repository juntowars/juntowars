var users = require('users');
var games = require('games');
var base = require('base');
var mongoose = require('mongoose');
var Games = mongoose.model('Games');

module.exports = function (io) {


    io.sockets.on('connection', function (socket) {

        socket.emit('message', {message: 'welcome to the chat'});

        socket.on('send', function (room, data) {
            io.sockets.in(room).emit('message', data);
        });

        socket.on('create', function (room, user) {

            function updateUserList(err, userList, socket) {
                if (err) {
                    socket.emit('message', {message: err});
                }
                else {
                    socket.emit('userJoined', {userList: userList});
                    var message_text = socket.user.id + ' has joined the chat';
                    socket.emit('message', {message: message_text});
                }
            }

            console.log(user + " is in room " + room);
            socket.join(room);
            socket.user = user;
            Games.addUserToList(room, user, socket, updateUserList);
        });
    });
}
