window.onload = function () {
  var socket = io.connect(location.origin);
  var room = window.location.pathname.replace(/.*\//, '');

  socket.emit('gameStart', room, socket.user);
  console.log("");
};