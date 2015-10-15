GetMap(RenderMap, true);

var game_socket = io.connect(location.origin);
var gameRoom = window.location.pathname.replace(/.*\//, '');
var playerName;

game_socket.on('displayActionModal', function (data) {
  displayModal(data.message);
  game_socket.emit('markModalAsSeen', gameRoom, playerName);
});

game_socket.on('enableMoves', function (data) {
  enableMoveActions(data, playerName);
});

game_socket.on('updateHarvestInformation', function (data) {
  updateHarvestInformation(data);
});

game_socket.on('refreshMapView', function () {
  GetMap(RenderMap, false);
});

function initSocketSession() {
  document.getElementById('gameModal').classList.remove('show');
  playerName = getPlayersName();
  game_socket.emit('joinGame', gameRoom, playerName);
}

