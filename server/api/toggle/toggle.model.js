'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ToggleSchema = new Schema({
    type: String,
    key: String,
    description: String,
    enabled: Boolean
});

module.exports = mongoose.model('Toggle', ToggleSchema);
