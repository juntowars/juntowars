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
BaseSchema.statics = {};

mongoose.model('Base', BaseSchema, 'base');