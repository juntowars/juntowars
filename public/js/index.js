GetMap(RenderMap);

var game_socket = io.connect(location.origin);
var gameRoom = window.location.pathname.replace(/.*\//, '');
var playerName;

game_socket.on('displayActionModal', function (data) {
  console.log("displayActionModal fired " + data);
  displayModal();
});

game_socket.on('enableMoves', function () {
  console.log("enableMoves fired ");
  enableMoveActions();
});

function initSocketSession() {
  document.getElementById('nextActionModal').classList.remove('show');
  playerName = getPlayersName();
  game_socket.emit('createGame', gameRoom, playerName);
  console.log('createGame ' + gameRoom + " " + playerName);
}

