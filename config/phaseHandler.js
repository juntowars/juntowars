"use strict";
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
        io.sockets.in(room).emit('updatePhaseInfo');
        nextMovementAction(room, io);
    }, 1000);
}


let gameHasEnteredEndingClause = async(function (io, room) {
    let game = await(Games.getGame(room));

    let racesRemaining = [];
    let maxNumberRounds = game[0]._doc.state.maxNumberOfRounds;

    let currentRoundNumber = game[0]._doc.state.round;
    let arrayOfUnits = game[0]._doc.state.units;

    for (let i = 0; i < arrayOfUnits.length; i++) {
        if (racesRemaining.indexOf(arrayOfUnits[i].race) == -1) {
            racesRemaining.push(arrayOfUnits[i].race);
        }
    }

    return (racesRemaining.length <= 1 || (currentRoundNumber >= maxNumberRounds));
});

let getLastRemainingRace = async(function (io, room) {
    let game = await(Games.getGame(room));

    let racesRemaining = [];

    let arrayOfUnits = game[0]._doc.state.units;

    for (let i = 0; i < arrayOfUnits.length; i++) {
        if (racesRemaining.indexOf(arrayOfUnits[i].race) == -1) {
            racesRemaining.push(arrayOfUnits[i].race);
        }
    }

    return racesRemaining[0];
});

let tallyScoresAndDeclareWinner = async(function (io, room) {
    let game = await(Games.getGame(room));

    let raceScores = {
        "kingdomWatchers": 0,
        "periplaneta": 0
    };

    // Add up units value
    let arrayOfUnits = game[0]._doc.state.units;
    for (let i = 0; i < arrayOfUnits.length; i++) {
        raceScores[arrayOfUnits[i].race] += (
            arrayOfUnits[i].infantry +
            arrayOfUnits[i].ranged +
            arrayOfUnits[i].tanks * 2
        )
    }

    let highScore = 0;
    let winningRace = null;
    for (var race in raceScores) {
        if (raceScores.hasOwnProperty(race)) {
            if (highScore < raceScores[race]) {
                highScore = raceScores[race];
                winningRace = race;
            }
        }
    }

    return {
        "highScore": highScore,
        "winningRace": winningRace
    };
});


function nextMovementAction(room, io) {
    let checkIfWeShouldMove = async(function (room, io) {
        let gameOver = await(gameHasEnteredEndingClause(io, room));
        if (gameOver) {
            let winningRace = await(getLastRemainingRace(io, room));
            io.sockets.in(room).emit('displayActionModal', {
                message: '<h1>Game Over</h1><p>Last Man Standing: ' + winningRace + '</p>'
            });
            //todo: Add function to mark game as over,
            //todo: declare winner, give players a back to lobby/review game view
        } else {
            Games.getRacesWithMovesAvailableOrderList(room, function (racesWithMovementsLeft) {
                racesWithMovementsLeft.length == 0 ? moveToHarvestPhase(io, room) : cycleThroughMoves(room, io, racesWithMovementsLeft);
            });
        }
    });

    checkIfWeShouldMove(room, io);
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
    io.sockets.in(room).emit('removeHarvestTokens');
    processHarvestTokens(room, io);
    Games.setPhase(room, "Harvest");

    setTimeout(function () {
        moveToDeploymentCommitPhase(room, io);
    }, 2000);
}

function moveToDeploymentCommitPhase(room, io) {
    winston.info("Moving to deployment commit phase");
    Games.setPhase(room, "Deployment-Commit");

    Games.setCommitListToAllPlayersWithUnits(room, function (data) {
        winston.info("deploymentCommitPhase: " + room);
        io.sockets.in(room).emit('deploymentCommitPhase', data);
        io.sockets.in(room).emit('updatePhaseInfo');
    });
}

function moveToDeploymentDeployPhase(io, room) {
    winston.info("Moving to deployment !!deploy!! phase");
    Games.setPhase(room, "Deployment-Deploy");
    io.sockets.in(room).emit('updatePhaseInfo');
    return deploymentDeployCycle(io, room);
}

function moveToNextRound(io, room) {
    Games.incrementRoundNumber(room);

    let checkIfWeShouldMoveToTheNextRound = async(function (room, io) {
        let gameOver = await(gameHasEnteredEndingClause(io, room));
        if (gameOver) {
            let winningInfo = await(tallyScoresAndDeclareWinner(io, room));

            io.sockets.in(room).emit('displayActionModal', {
                message: '<h1>Game Over</h1><p>Max Rounds has been hit, high score:' +
                winningInfo['winningRace'] + '</p><p> With a highScore of: ' + winningInfo['highScore'] + '</p>'
            });
        } else {
            io.sockets.in(room).emit('displayActionModal', {
                message: '<h1>New Round</h1><img style="-webkit-user-select: none; width: 301px;cursor: zoom-in;" src="http://www.storychurch.org/wp-content/uploads/2012/09/The-Next-Chapter-1-470x264.jpg">'
            });
            Games.setWaitingOnToAll(room);

            Games.setAllOrdersToNotSet(room, function () {
                setTimeout(function () {
                    Games.setPhase(room, "Orders");
                    io.sockets.in(room).emit('updatePhaseInfo');
                    io.sockets.in(room).emit('refreshMapView');
                }, 1000);
            });
        }
    });

    checkIfWeShouldMoveToTheNextRound(room, io);
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
        allPlayerOrdersAreSet ? moveToMovementPhase(room, io) : winston.info("Waiting for other players place orders . .");
    });
};

exports.moveOrderComplete = function moveOrderComplete(room, io) {
    nextMovementAction(room, io);
};

exports.startDeploying = function startDeploying(io, room) {
    moveToDeploymentDeployPhase(io, room);
};

exports.continueWithDeployCycle = function (io, room) {
    return deploymentDeployCycle(io, room);
};

exports.moveToNextRound = function moveToNextRoundExport(io, room){
    moveToNextRound(io, room);
};