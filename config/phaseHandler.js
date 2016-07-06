/*jshint esversion: 6 */

var mongoose = require('mongoose');
var winston = require('winston');
var Games = mongoose.model('Games');
var Base = mongoose.model('Base');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var eh = require('./eventHandler.js');

let deploymentDeployCycle = async(function (io, room) {
    let game = await(Games.getGame(room));
    let nextPlayer = game[0]._doc.deployment.racesToDeploy[0];
    let deploymentInfo = game[0]._doc.deployment;
    let nextPlayersRace = null;
    let userList = game[0]._doc.userList;
    if (nextPlayer == userList.guardians) {
        nextPlayersRace = "guardians";
    } else if (nextPlayer == userList.periplaneta) {
        nextPlayersRace = "periplaneta";
    } else if (nextPlayer == userList.reduviidae) {
        nextPlayersRace = "reduviidae";
    } else if (nextPlayer == userList.kingdomWatchers) {
        nextPlayersRace = "kingdomWatchers";
    } else if (nextPlayer == userList.settlers) {
        nextPlayersRace = "settlers";
    } else {
        nextPlayersRace = "geoEngineers";
    }

    let nextPlayerHasUnitsToDeploy = (
        game[0]._doc.deployment[nextPlayersRace].tanksToDeploy > 0 ||
        game[0]._doc.deployment[nextPlayersRace].rangedToDeploy > 0 ||
        game[0]._doc.deployment[nextPlayersRace].infantryToDeploy > 0
    );

    if (!nextPlayerHasUnitsToDeploy) {
        await(Games.removeFromRacesToDeploy(room, nextPlayer));
        game = await(Games.getGame(room));
        nextPlayer = game[0]._doc.deployment.racesToDeploy[0];
    }

    if (nextPlayer) {
        return io.sockets.in(room).emit('deploymentDeployPhase', nextPlayer, deploymentInfo);
    } else {
        io.sockets.in(room).emit('deploymentDeployPhaseOver');
        return moveToNextRound(io, room);
    }
});

function moveToMovementPhase(room, io) {
    io.sockets.in(room).emit('refreshMapView');
    winston.info("All player orders have been set for game " + room + "switching to movement phase");
    Games.setPhase(room, "movement");
    setTimeout(function () {
        nextMovementAction(room, io);
    }, 1000);
}

function nextMovementAction(room, io) {
    Games.getRacesWithMovesAvailableOrderList(room, function (racesWithMovementsLeft) {
        if(racesWithMovementsLeft.length === 0) {
            moveToHarvestPhase(io, room);
        } else {
            cycleThroughMoves(room, io, racesWithMovementsLeft);
        }
    });
}

function cycleThroughMoves(room, io, raceTurnOrder) {
    Games.getActivePlayer(room, function (activePlayer) {
        if (activePlayer === '') {
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
    io.sockets.in(room).emit('removeHarvestTokens');
    processHarvestTokens(room, io);

    setTimeout(function () {
        moveToDeploymentCommitPhase(room, io);
    }, 2000);
}

function moveToDeploymentCommitPhase(room, io) {
    winston.info("Moving to deployment commit phase");
    Games.setPhase(room, "deploymentCommitPhase");

    Games.setCommitListToAllPlayersWithUnits(room, function (data) {
        winston.info("deploymentCommitPhase: " + room);
        io.sockets.in(room).emit('deploymentCommitPhase', data);
    });
}

function moveToDeploymentDeployPhase(io, room) {
    winston.info("Moving to deployment !!deploy!! phase");
    Games.setPhase(room, "deploymentDeployPhase");
    return deploymentDeployCycle(io, room);
}

function moveToNextRound(io, room) {
    io.sockets.in(room).emit('displayActionModal', {
        message: '<h1>New Round</h1><img style="-webkit-user-select: none; width: 301px;cursor: zoom-in;" src="http://www.storychurch.org/wp-content/uploads/2012/09/The-Next-Chapter-1-470x264.jpg">'
    });
    Games.setAllOrdersToNotSet(room, function () {
        setTimeout(function () {
            Games.setPhase(room, "orders");
            io.sockets.in(room).emit('refreshMapView');
        }, 1000);
    });
    Games.setWaitingOnToAll(room);
    Games.incrementRoundNumber(room);
}

function processHarvestTokens(room, io) {
    Games.updateHarvestCounts(room, function () {
        eh.updateHarvestInformation(room, io);
        winston.info("updateHarvestInformation for Game: " + room);
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

exports.allOrdersAreSet = function allOrdersAreSet(room, user, io) {
    Games.updateWaitingOnListAndCheckIfEmpty(user, room, function (allPlayerOrdersAreSet) {
        if(allPlayerOrdersAreSet) {
            moveToMovementPhase(room, io);
        }else {
            winston.info("Waiting for other players place orders . .");
        }
    });
};

exports.moveOrderComplete = function moveOrderComplete(room, user, io) {
    nextMovementAction(room, io);
};

exports.startDeploying = function startDeploying(io, room) {
    moveToDeploymentDeployPhase(io, room);
};

exports.continueWithDeployCycle = function (io, room) {
    return deploymentDeployCycle(io, room);
};