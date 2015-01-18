'use strict';

var mongoose = require('mongoose'),
    ShortId = require('mongoose-shortid'),
    User = require('../user/user.model'),
    Schema = mongoose.Schema;

var InviteSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        index: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: '48h'
    },
    modified_at: Date
});

/// Validation

// Email is required
InviteSchema
    .path('email')
    .validate(function(email) {
        if (!email) return false;
        return email.length;
    }, 'Email cannot be blank');

// Only one invite per email address allowed
InviteSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        this.constructor.findOne({
            email: value
        }, function(err, invite) {
            if (err) throw err;
            if (invite && self.id !== invite.id) {
                return respond(false);
            }
            return respond(true);
        });
    }, 'The specified invitation already exists');

// Cannot create an invite if a user with that email already exists
InviteSchema
    .path('email')
    .validate(function(value, respond) {
        User.findOne({
            email: value
        }, function(err, user) {
            if (err) throw err;
            if (user) return respond(false);
            return respond(true);
        });
    }, 'The specified email address is already in use');

module.exports = mongoose.model('Invite', InviteSchema);
