var mongoose = require('mongoose');
var winston = require('winston');
var Games = mongoose.model('Games');
var Base = mongoose.model('Base');

exports.allOrdersAreSet = function allOrdersAreSet(room, user, io) {
  Games.updateWaitingOnListAndCheckIfEmpty(user, room, movementTurnHandler);

  function movementTurnHandler(allPlayerOrdersAreSet) {
    allPlayerOrdersAreSet ? moveToMovementPhase(room, io) : winston.info("Waiting for other players place orders . .");
  }
};

exports.moveOrderComplete = function moveOrderComplete(room, user, io) {
  nextMovementAction(room, io);
};

function moveToMovementPhase(room, io) {
  winston.info("All player orders have been set for game " + room + "switching to movement phase");
  Games.setPhase(room, "movement");
  nextMovementAction(room, io);
}

function nextMovementAction(room, io) {
  Games.getRacesWithMovesAvailableOrderList(room, function (racesWithMovementsLeft) {
    racesWithMovementsLeft.length == 0 ? moveToHarvestPhase(io, room) : cycleThroughMoves(room, io, racesWithMovementsLeft);
  });
}

function cycleThroughMoves(room, io, raceTurnOrder) {
  Games.getActivePlayer(room, function (activePlayer) {
    if (activePlayer == '') {
      Games.setActivePlayer(room, raceTurnOrder[0], function (activePlayer) {
        enableMovesForActivePlayer(activePlayer, room, io, raceTurnOrder);
      });
    } else {
      enableMovesForActivePlayer(activePlayer, room, io, raceTurnOrder);
    }
  });
}

function moveToHarvestPhase(io, room) {
  winston.info("Moving to harvest phase");
  Games.setPhase(room, "harvest");
  io.sockets.in(room).emit('displayActionModal', {
    message: "<h1>The harvest has come</h1><p>Check your harvest count in the hud</p>"
  });
}

function enableMovesForActivePlayer(playerUUID, room, io, raceTurnOrder) {
  io.sockets.in(room).emit('enableMoves', playerUUID);
  Games.getPlayersRace(room, playerUUID, function (activePlayersRace) {
    var nextActivePlayerRaceIndex = (raceTurnOrder.indexOf(activePlayersRace) + 1 ) % raceTurnOrder.length;
    var nextActivePlayerRace = raceTurnOrder[nextActivePlayerRaceIndex];
    Games.setActivePlayer(room, nextActivePlayerRace, function () {
    });
  });
}
