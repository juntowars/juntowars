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

        let costToHarvest = totalDeploymentCost - defaultDeployment;
        if (totalDeploymentCost <= (harvestAvailable + defaultDeployment)) {
            await(Games.commitDeploymentResources(deploymentInfo));
            await(Games.removeCommittedCostFromHarvest(deploymentInfo.gameRoom, deploymentInfo.playerRace, costToHarvest));
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

exports.resolveBattle = function resolveBattle(io, gameRoom, attackersIndex, defendersIndex, attackingWith) {
    let resolveBattle = async(function (io, gameRoom, attackersIndex, defendersIndex, attackingWith) {
        winston.info("resolving a battle in tile " + defendersIndex);
        let game = await(Games.getGame(gameRoom));
        let unitsOnBoard = game[0]._doc.state.units;
        let attackerUnits = null;
        let defenderUnits = null;
        for (let i = 0; i < unitsOnBoard.length; i++) {
            if (attackersIndex == unitsOnBoard[i]["index"]) {
                attackerUnits = unitsOnBoard[i];
            } else if (defendersIndex == unitsOnBoard[i]["index"]) {
                defenderUnits = unitsOnBoard[i];
            }
        }
        let attackersArmyStrength = calculateStrength(attackerUnits, attackingWith);
        let defendersArmyStrength = calculateStrength(defenderUnits, "all");

        if (attackersArmyStrength > defendersArmyStrength) {
            winston.info("Attacker wins battle in tile: " + defendersIndex);
            //    reset defenders tile
            await(Games.setUnitDocForIndex(gameRoom, defendersIndex));

            let pointsToRemove = defenderUnits.infantry + defenderUnits.ranged + defenderUnits.tanks;
            let remainingAttackingInfantry = attackingWith.infantry;
            let remainingAttackingRanged = attackingWith.ranged;
            let remainingAttackingTanks = attackingWith.tanks;

            while (pointsToRemove > 0) {
                if (remainingAttackingInfantry > 0) {
                    remainingAttackingInfantry--;
                } else if (remainingAttackingRanged > 0) {
                    remainingAttackingRanged--;
                } else {
                    remainingAttackingTanks--;
                }
                pointsToRemove--;
            }

            //    move in attackers selected units
            await(Games.updateAllUnitsValuesForIndex(gameRoom, defendersIndex, attackerUnits.race,
                remainingAttackingInfantry, remainingAttackingRanged, remainingAttackingTanks)
            );
            await(Games.setTileToOrderToDone(gameRoom,defendersIndex));

            let attackerUnitsTileTotal = attackerUnits.infantry + attackerUnits.ranged + attackerUnits.tanks;
            let committedUnits = attackingWith.infantry + attackingWith.ranged + attackingWith.tanks;

            if ((committedUnits == attackerUnitsTileTotal)) {
                // remove attackers tile empty
                await(Games.removeUnitsDoc(gameRoom, attackersIndex));
            } else {
                // update attackers tile
                await(Games.updateAllUnitsValuesForIndex(gameRoom, attackersIndex, attackerUnits.race,
                    (attackerUnits.infantry - attackingWith.infantry ),
                    (attackerUnits.ranged - attackingWith.ranged),
                    (attackerUnits.tanks - attackingWith.tanks)));
            }

        } else if (attackersArmyStrength < defendersArmyStrength) {
            winston.info("Defender wins battle in tile: " + defendersIndex);

        } else {
            winston.info("The battle was a draw in tile: " + defendersIndex);

        }

    });

    return resolveBattle(io, gameRoom, attackersIndex, defendersIndex, attackingWith);
};

function calculateStrength(units, selectedUnits) {
    if (selectedUnits == "all") {
        return units.ranged + units.infantry + units.tanks;
    } else {
        let strength = 0;
        if (selectedUnits.infantry > 0) {
            strength += selectedUnits.infantry;
        }
        if (selectedUnits.ranged > 0) {
            strength += selectedUnits.ranged;
        }
        if (selectedUnits.tanks > 0) {
            strength += selectedUnits.tanks;
        }
        return strength;
    }
}