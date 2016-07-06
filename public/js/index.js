GetMap(RenderMap, true);

var game_socket = io.connect(location.origin);
var gameRoom = window.location.pathname.replace(/.*\//, '');
var playerName;

game_socket.on('displayActionModal', function (data) {
  displayModal(data.message);
});

game_socket.on('enableMoves', function (data) {
  enableMoveActions(data, playerName);
});

game_socket.on('updateHarvestInformation', function (data) {
  updateHarvestInformation(data);
});

game_socket.on('removeHarvestTokens', function () {
  removeHarvestTokens();
});

game_socket.on('deploymentCommitPhase', function (playersDefaultDeployments) {
  deploymentCommitPhase(playersDefaultDeployments);
});

game_socket.on('deploymentDeployPhase', function (nextPlayer, deploymentInfo) {
  deployingUnits(nextPlayer, deploymentInfo);
});

game_socket.on('deploymentDeployPhaseOver', function () {
  hideAndResetDeploymentElements();
});

game_socket.on('refreshMapView', function () {
  GetMap(RenderMap, false);
});

game_socket.on('currentUpdates', function (data) {
  var race = getPlayersRace();
  var playersPurchasedInventory = {
    "periplaneta": function() {
      return data.purchasedInventory.periplaneta;
    },
    "kingdomWatchers": function() {
      return data.purchasedInventory.kingdomWatchers;
    }
  };
  drawUpgradesTable(playersPurchasedInventory[race]().upgrades);
  drawScrollableUpgradesCardDeck();
});


function initSocketSession() {
  hideModal();
  playerName = getPlayersName();
  game_socket.emit('joinGame', gameRoom, playerName);
  var race = getPlayersRace();
  game_socket.emit('initCardDeck', gameRoom, race);

  //todo: handle refreshes or disconnects by state
  // getGamePhase(gameRoom, function (phase) {
  //   if(phase == 'deploymentCommitPhase'){
  //
  //   }
  // });
}

