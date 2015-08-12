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
      {
        "posX": 4,
        "posY": 3,
        "index": 76,
        "race": "kingdomWatchers",
        "infantry": 1,
        "ranged": 1,
        "tanks": 1,
        "order": null
      },
      {
        "posX": 4,
        "posY": 2,
        "index": 52,
        "race": "kingdomWatchers",
        "infantry": 2,
        "ranged": 2,
        "tanks": 4,
        "order": null
      },
      {
        "posX": 5,
        "posY": 2,
        "index": 53,
        "race": "periplaneta",
        "infantry": 1,
        "ranged": 2,
        "tanks": 1,
        "order": null
      }
    ];
  }
};

BaseSchema.raceHistory = {
  "kingdomWatchers": {
    "header": "<h1>Fear The Many Faced God</h1>",
    "text": "<img src='http://orig02.deviantart.net/08ea/f/2011/312/2/0/experiments___janus_by_jeffsimpsonkh-d4fkwyl.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Kingdom watchers coming to fuck you up</p>"
  },
  "periplaneta": {
    "header": "<h1>We've been here longer than you</h1>",
    "text": "<img src='http://orig13.deviantart.net/a1f7/f/2012/094/e/c/ancient_battle_by_wraithdt-d4v1v25.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Periplaneta are old as shit</p>"
  }
};

mongoose.model('Base', BaseSchema, 'base');