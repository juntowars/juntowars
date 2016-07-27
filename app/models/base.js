/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;

var cardType = {
  ATTACK: "Attack",
  DEFENCE: "Defence",
  ATTACK_AND_DEFENCE: "Attack and Defence",
  MOVEMENT: "Movement",
  RANGE: "Range"
};

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
        "order": "notSet"
      },
      {
        "posX": 4,
        "posY": 2,
        "index": 52,
        "race": "kingdomWatchers",
        "infantry": 2,
        "ranged": 2,
        "tanks": 4,
        "order": "notSet"
      },
      {
        "posX": 5,
        "posY": 2,
        "index": 53,
        "race": "periplaneta",
        "infantry": 1,
        "ranged": 2,
        "tanks": 1,
        "order": "notSet"
      },
      {
        "posX": 5,
        "posY": 3,
        "index": 77,
        "race": "periplaneta",
        "infantry": 0,
        "ranged": 0,
        "tanks": 1,
        "order": "notSet"
      }
    ];
  },
  getRaceSpecificMerchant: function (race) {
    var upgrades = BaseSchema.merchants[race].upgrades;

    var merchants = {
      kingdomWatchers: function () {
        return {
          name: "Handelaar",
          image: "/img/merchants/merchant_1.jpg",
          upgrades: upgrades,
          combatCards: [],
          bounties: []
        };
      },
      periplaneta: function () {
        return {
          name: "slimey",
          image: "/img/merchants/merchant_1.jpg",
          upgrades: upgrades,
          combatCards: [],
          bounties: []
        };
      }
    };

    return merchants[race]();
  }
};

BaseSchema.merchants = {
  kingdomWatchers: {
    name: "Handelaar",
    image: "/img/merchants/merchant_1.jpg",
    upgrades: [
      {
        type: cardType.ATTACK,
        name: "soul_flame",
        imageFolder: "/img/shop/upgrades/soul_flame/",
        grade: {
          BASIC: {
            modifier: 1,
            cost: 15,
            nextGrade: "DECORATED"
          },
          DECORATED: {
            modifier: 3,
            cost: 30,
            nextGrade: "HEROIC"
          },
          HEROIC: {
            modifier: 5,
            cost: 50,
            nextGrade: "MASTERFUL"
          },
          MASTERFUL: {
            modifier: 10,
            cost: 100,
            nextGrade: "ELITE"
          },
          ELITE: {
            modifier: 20,
            cost: 0,
            nextGrade: null
          }
        }
      }, {
        type: cardType.DEFENCE,
        name: "repulsor_shield",
        imageFolder: "/img/shop/upgrades/repulsor_shield/",
        grade: {
          BASIC: {
            modifier: 1,
            cost: 15,
            nextGrade: "DECORATED"
          },
          DECORATED: {
            modifier: 3,
            cost: 30,
            nextGrade: "HEROIC"
          },
          HEROIC: {
            modifier: 5,
            cost: 50,
            nextGrade: "MASTERFUL"
          },
          MASTERFUL: {
            modifier: 10,
            cost: 100,
            nextGrade: "ELITE"
          },
          ELITE: {
            modifier: 20,
            cost: 0,
            nextGrade: null
          }
        }
      }, {
        type: cardType.MOVEMENT,
        name: "teleportation",
        imageFolder: "/img/shop/upgrades/teleportation/",
        grade: {
          NOT_PURCHASED: {
            modifier: 0,
            cost: 40,
            nextGrade: "BLINK"
          },
          BLINK: {
            modifier: 1,
            cost: 100,
            nextGrade: "QUANTUM"
          },
          QUANTUM: {
            modifier: 2,
            cost: 0,
            nextGrade: null
          }
        }
      }
    ],
    combatCards: [],
    bounties: []
  },
  periplaneta: {
    name: "slimey",
    image: "/img/merchants/merchant_1.jpg",
    upgrades: [{
      type: cardType.DEFENCE,
      name: "thick_skin",
      imageFolder: "/img/shop/upgrades/thick_skin/",
      grade: {
        BASIC: {
          modifier: 1,
          cost: 15,
          nextGrade: "DECORATED"
        },
        DECORATED: {
          modifier: 3,
          cost: 30,
          nextGrade: "HEROIC"
        },
        HEROIC: {
          modifier: 5,
          cost: 50,
          nextGrade: "MASTERFUL"
        },
        MASTERFUL: {
          modifier: 10,
          cost: 100,
          nextGrade: "ELITE"
        },
        ELITE: {
          modifier: 20,
          cost: 0,
          nextGrade: null
        }
      }
    }],
    combatCards: [],
    bounties: []

  }
};

BaseSchema.flavourText = {
  "kingdomWatchers": {
    "history": "<h1>Fear The Many Faced God</h1><img src='http://orig02.deviantart.net/08ea/f/2011/312/2/0/experiments___janus_by_jeffsimpsonkh-d4fkwyl.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Kingdom watchers coming to fuck you up</p>",
    "leaderBio": {
      "leader_1": "<h1>Tough as nails</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
      "leader_2": "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
    }
  },
  "periplaneta": {
    "history": "<h1>We've been here longer than you</h1><img src='http://orig13.deviantart.net/a1f7/f/2012/094/e/c/ancient_battle_by_wraithdt-d4v1v25.jpg' style='width:80%; margin-left:9%;margin-right:9%'/><p>Periplaneta are old as shit</p>",
    "leaderBio": {
      "leader_1": "<h1>Tough as nails</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
      "leader_2": "<h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
    }
  }
};

mongoose.model('Base', BaseSchema, 'base');