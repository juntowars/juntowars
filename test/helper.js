var mongoose = require('mongoose')
    , async = require('async')
    , Games = mongoose.model('Games')
    , User = mongoose.model('User');

exports.clearUsersCollection = function (done) {
    async.parallel([
        function (cb) {
            User.collection.remove(cb)
        }
    ], done)
};

exports.clearGamesCollection = function (done) {
    async.parallel([
        function (cb) {
            Games.collection.remove(cb)
        }
    ], done)
};