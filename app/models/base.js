/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var config = require('../../config/config');

var Schema = mongoose.Schema;

/**
 * Base Schema
 */

var BaseSchema = new Schema({
  map: {}
});

BaseSchema.methods = {};
BaseSchema.statics = {
  getDefaultUnitsSetUp: function () {
    return [
      { "posX" : 4,
        "posY" : 3,
        "race" : "kingdomWatchers",
        "infantry" : 1,
        "ranged" : 1,
        "tanks" : 1
      },
      { "posX" : 4,
        "posY" : 2,
        "race" : "kingdomWatchers",
        "infantry" : 2,
        "ranged" : 2,
        "tanks" : 4
      },
      {
        "posX" : 5,
        "posY" : 2,
        "race" : "periplaneta",
        "infantry" : 1,
        "ranged" : 2,
        "tanks" : 1
      }
    ];
  }
};

mongoose.model('Base', BaseSchema, 'base');