GetMap(RenderMap);

var game_socket = io.connect(location.origin);
var gameRoom = window.location.pathname.replace(/.*\//, '');
var playerName;

game_socket.on('displayActionModal', function (data) {
  displayModal(data.message);
});

game_socket.on('enableMoves', function (data) {
  enableMoveActions(data, playerName);
});

function initSocketSession() {
  document.getElementById('gameModal').classList.remove('show');
  playerName = getPlayersName();
  game_socket.emit('joinGame', gameRoom, playerName);
}

