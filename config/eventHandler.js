"use strict";
var mongoose = require('mongoose');
var winston = require('winston');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var ph = require('./phaseHandler.js');
var Games = mongoose.model('Games');
var Base = mongoose.model('Base');

exports.updateHarvestInformation = function updateHarvestInformation(room, io) {
    winston.info("updateHarvestInformation for game: " + room);
    Games.getHarvestInformation(room, function (harvestInformation) {
        io.sockets.in(room).emit('updateHarvestInformation', harvestInformation);
    });
};

exports.displayOpeningModal = function displayOpeningModal(room, io, user) {
    Games.displayOpeningModalCheck(room, user, function (modalShouldBeDisplayed) {
        if (modalShouldBeDisplayed) {
            for (var i = 0; i < io.sockets.sockets.length; i++) {
                if (io.sockets.sockets[i].user == user) {
                    io.sockets.to(io.sockets.sockets[i].id).emit('displayActionModal', {
                        message: "<h1>Welcome to the Game</h1><p>Place your Orders Mother fuckers!</p>"
                    });
                }
            }
        }
    });
};

exports.commitDeployment = function commitDeployment(deploymentInfo) {
    let deploymentTasks = async(function (deploymentInfo) {
        let totalDeploymentCost = deploymentInfo.infantryToDeploy + deploymentInfo.rangedToDeploy + deploymentInfo.tanksToDeploy;

        let game = await(Games.getGame(deploymentInfo.gameRoom));
        let harvestAvailable = eval("game[0]._doc.harvest." + deploymentInfo.playerRace + ".currentAmount");
        let defaultDeployment = eval("game[0]._doc.deployment." + deploymentInfo.playerRace + ".defaultDeployment");

        if (totalDeploymentCost <= (harvestAvailable + defaultDeployment)) {
            await(Games.commitDeploymentResources(deploymentInfo));
            await(Games.removePlayerFromToCommitList(deploymentInfo));
            if (totalDeploymentCost > 0) {
                await(Games.addPlayerDeployList(deploymentInfo));
            }
            winston.debug("Values committed for  " + deploymentInfo.playerName);
        } else {
            //todo: Add a stop game and ban player feature
            winston.error("I spy a hacker. . " + deploymentInfo.playerName);
        }
    });

    return deploymentTasks(deploymentInfo);
};

exports.deploymentByUserToTile = function deploymentByUserToTile(room, index, race, infantry, ranged, tanks, deploymentValues) {
    let commitUnitsToDb = async(function (room, index, race, infantry, ranged, tanks, deploymentValues) {
        await(Games.setUnitDocForIndex(room, index));
        await(Games.updateAllUnitsValuesForIndex(room, index, race, infantry, ranged, tanks));
        await(Games.removeDeployedValuesFromRace(room, race, deploymentValues));
    });
    return commitUnitsToDb(room, index, race, infantry, ranged, tanks, deploymentValues);
};

exports.checkDeploymentCommitComplete = function checkDeploymentCommitComplete(io, deploymentInfo) {
    let checkThatCommitIsComplete = async(function (io, deploymentInfo) {
        winston.info("commitDeploymentResources for player" + deploymentInfo.playerName);
        let game = await(Games.getGame(deploymentInfo.gameRoom));
        let playersLeftToCommit = game[0]._doc.deployment.racesToCommit;

        if (playersLeftToCommit.length > 0) {
            winston.info("Still waiting on players to commit deployment totals");
        } else {
            winston.info("Time to start deploying");
            ph.startDeploying(io, deploymentInfo.gameRoom);
        }
    });

    return checkThatCommitIsComplete(io, deploymentInfo);
};

