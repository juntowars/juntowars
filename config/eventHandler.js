var mongoose = require('mongoose');
var winston = require('winston');
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

