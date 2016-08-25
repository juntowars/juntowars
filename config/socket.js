var users = require('../app/controllers/users');
var games = require('../app/controllers/games');
var base = require('../app/controllers/base');
var ph = require('./phaseHandler.js');
var eh = require('./eventHandler.js');
var mongoose = require('mongoose');
var winston = require('winston');
var Promise = require("bluebird");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Games = mongoose.model('Games');
var Base = mongoose.model('Base');

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {

        //lobby Methods
        socket.on('send', function (room, data) {
            io.sockets.in(room).emit('message', data);
        });

        socket.on('userReady', function (room, userName) {

            var playersToPlay = 2;

            function updateClientsWithReadyStatus(room, arrayOfUsersStatus) {
                io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});

                if (arrayOfUsersStatus[0].length == playersToPlay) {
                    var count = 0;
                    for (var i = 0; i < playersToPlay; i++) {
                        if (arrayOfUsersStatus[0][i].ready) count++;
                        if (count == playersToPlay) io.sockets.in(room).emit('displayStartButton');
                    }
                }
            }

            function getLobbyReadyState() {
                Games.getPlayersReadyStatus(room, updateClientsWithReadyStatus);
            }

            Games.setPlayersReadyStatus(room, userName, getLobbyReadyState);
        });

        socket.on('create', function (room, user) {

            function updateLobby(room, arrayOfUsersStatus) {
                io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});
            }

            function joinRoom(game) {
                socket.join(room);
                Games.getPlayersReadyStatus(game, updateLobby);
                var message_text = socket.user + ' has joined the chat';
                io.sockets.in(room).emit('message', {message: message_text});
            }

            winston.log(user + " is in room " + room);
            Games.setUserInLobby(room, user, socket, joinRoom);
            socket.user = user;
        });

        socket.on('startGame', function (room) {
            io.sockets.in(room).emit('redirect');
            Games.setLobbyToClosed(room);
            Games.setPlayerRaces(room);
            Games.setWaitingOnToAll(room);
        });

        socket.on('disconnect', function () {
            function updateLobby(room, arrayOfUsersStatus) {
                io.sockets.in(room).emit('refreshLobbyStatus', {playerStatus: arrayOfUsersStatus[0]});
                var message_text = socket.user + ' has left the chat';
                io.sockets.in(room).emit('message', {message: message_text});
            }

            function tellThePeople(gamesList) {
                gamesList.forEach(function (game) {
                    Games.getPlayersReadyStatus(game, updateLobby);
                });
            }

            function updateAffectedLobbies(err, res, user) {
                Games.removeUserFromOpenLobbiesQuery(err, res, user, tellThePeople);
            }

            Games.getUsersOpenLobbiesList(socket.user, updateAffectedLobbies);
        });

        //game Methods
        socket.on('joinGame', function (room, user) {
            socket.join(room);
            winston.info(user + " has joined the game " + room);
            socket.user = user;

            eh.updateHarvestInformation(room, io);
            eh.displayOpeningModal(room, io, user);
        });

        socket.on('lockInOrder', function (action, playerName, gameRoom, index) {
            winston.info(playerName + " has locked in a " + action + ' order for tile ' + index);
            Games.setPlayerOrder(action, playerName, gameRoom, index);
        });

        socket.on('allOrdersAreSet', function (room, user) {
            winston.info("Player " + user + " has set all there orders for " + room);
            ph.allOrdersAreSet(room, user, io);
        });

        socket.on('resolveBattle', function (gameRoom, playerName, attackersIndex, defendersIndex, attackingWith) {
            eh.resolveBattle(io, gameRoom, attackersIndex, defendersIndex, attackingWith)
                .then(function () {
                    io.sockets.in(gameRoom).emit('battleResolved', playerName);
                })
                .catch(function (err) {
                    winston.error("resolveBattle Error: " + err);
                });
        });

        socket.on('moveOrderComplete', function (room, user) {
            winston.info("Player " + user + " has completed a move order");
            ph.moveOrderComplete(room, io);
        });

        socket.on('peacefulMove', function (movementDetails, cb) {
            var gameRoom = movementDetails.gameRoom;
            var originIndex = movementDetails.originIndex;
            var targetIndex = movementDetails.targetIndex;
            var unitType = movementDetails.unitType;
            var unitValue = movementDetails.unitValue;
            var unitRace = movementDetails.unitRace;

            winston.info("peacefulMove " + unitType);

            var removeUnitFromOrigin = Games.updateUnitsValues(gameRoom, originIndex, unitType, 0, unitRace, function () {
                Games.doesTheTileContainUnits(gameRoom, originIndex, function (tileContainsUnits) {
                    if (!tileContainsUnits) {
                        winston.info("Tile " + originIndex + " has no units, removing unit doc " + unitType);
                        Games.removeUnitsDoc(gameRoom, originIndex);
                    }
                });
            });

            var addUnitToTarget = async(function (gameRoom, targetIndex, unitType, unitValue, unitRace) {
                winston.info("updateUnitsValues " + gameRoom + " " + targetIndex + " " + unitType + " " + unitValue + " " + unitRace);
                await(Games.setUnitDocForIndex(gameRoom, targetIndex));
                await(Games.updateUnitsValues(gameRoom, targetIndex, unitType, unitValue, unitRace));
                return null;
            });

            Promise.all([removeUnitFromOrigin,
                addUnitToTarget(gameRoom, targetIndex, unitType, unitValue, unitRace)]).then(cb);
        });

        socket.on('peacefulMerge', function (movementDetails, cb) {
            var gameRoom = movementDetails.gameRoom;
            var originIndex = movementDetails.originIndex;
            var targetIndex = movementDetails.targetIndex;
            var unitType = movementDetails.unitType;
            var unitValue = movementDetails.unitValue;
            var unitRace = movementDetails.unitRace;

            winston.info("peacefulMerge " + unitType);

            var removeUnitFromOrigin = Games.updateUnitsValues(gameRoom, originIndex, unitType, 0, unitRace, function () {
                Games.doesTheTileContainUnits(gameRoom, originIndex, function (tileContainsUnits) {
                    if (!tileContainsUnits) {
                        winston.info("Tile " + originIndex + " has no units, removing unit doc " + unitType);
                        Games.removeUnitsDoc(gameRoom, originIndex);
                    }
                });
            });

            var addUnitToTarget = async(function (gameRoom, targetIndex, unitType, unitValue, unitRace) {
                var asyncTask = await(Games.setUnitDocForIndex(gameRoom, targetIndex));
                winston.info("updateUnitsValues " + gameRoom + " " + targetIndex + " " + unitType + " " + unitValue + " " + unitRace);
                asyncTask = await(Games.addToCurrentUnitValue(gameRoom, targetIndex, unitType, unitValue, unitRace));
                return asyncTask;
            });

            Promise.all([removeUnitFromOrigin,
                addUnitToTarget(gameRoom, targetIndex, unitType, unitValue, unitRace)]).then(cb);
        });

        socket.on('removeAllUnitsInTile', function (gameRoom, removeUnitsFromThisTile) {
            winston.info("removeAllUnitsInTile " + removeUnitsFromThisTile);
            Games.removeUnitsDoc(gameRoom, removeUnitsFromThisTile);
        });

        socket.on('minusOneFromUnitValue', function (gameRoom, index, unitType) {
            winston.info("minusOneFromUnitValue " + index + " " + unitType);
            Games.minusOneFromUnitValue(gameRoom, index, unitType);
        });

        socket.on('refreshUsersInGame', function (room) {
            io.sockets.in(room).emit('refreshMapView');
        });

        socket.on('commitDeploymentResources', function (deploymentInfo) {
            var commitDeploymentResourcesHandler = async(function () {

                var game = await(Games.getGame(deploymentInfo.gameRoom));

                var currentRound = game[0]._doc.state.round;
                var lastRound = game[0]._doc.state.maxNumberOfRounds;
                if (currentRound == lastRound) {
                    ph.moveToNextRound(io, deploymentInfo.gameRoom);
                } else {
                    eh.commitDeployment(deploymentInfo)
                        .then(function () {
                            return eh.checkDeploymentCommitComplete(io, deploymentInfo);
                        })
                        .catch(function (err) {
                            winston.error("commitDeploymentResources Error: " + err);
                        });
                }
            });

            commitDeploymentResourcesHandler();
        });

        socket.on('deploymentOfUnits', function (room, index, race, infantry, ranged, tanks, deploymentValues) {
            eh.deploymentByUserToTile(room, index, race, infantry, ranged, tanks, deploymentValues)
                .then(function () {
                    io.sockets.in(room).emit('refreshMapView');
                    ph.continueWithDeployCycle(io, room);
                })
                .catch(function (err) {
                    winston.error("deploymentByUserToTile Error: " + err);
                });
        });

    });
};
