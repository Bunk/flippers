'use strict';

var mongoose = require('mongoose-q')(require('mongoose'));
var ShortId = require('mongoose-shortid');
var Schema = mongoose.Schema;

var crypto = require('crypto');

var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
    _id: {
        type: ShortId
    },
    name: String,
    email: {
        type: String,
        lowercase: true,
        index: true
    },
    role: {
        type: String,
        default: 'user'
    },
    provider: {
        type: String,
        default: 'local'
    },
    hashedPassword: String,
    salt: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: Date,
    facebook: {},
    twitter: {},
    google: {},
    github: {}
});

var validatePresenceOf = function(value) {
    return value && value.length;
};

var isOAuth = function(user) {
    return authTypes.indexOf(user.provider) !== -1;
}

var shouldValidatePassword = function(user) {
    return !isOAuth(user);
};

/**
 * Virtuals
 */

// Clear password (stored encrypted and salted)
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            'name': this.name,
            'role': this.role
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'role': this.role
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function(email) {
        if (isOAuth(this)) return true;

        return email.length;
    }, 'Email cannot be blank');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function(hashedPassword) {
        if (!shouldValidatePassword(this)) return true;

        return hashedPassword.length;
    }, 'Password cannot be blank');

// Validate email is not taken
// TODO: Validate plus addressing as well.
UserSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        this.constructor.findOne({
            email: value
        }, function(err, user) {
            if (err) throw err;

            if (user && self.id !== user.id) {
                return respond(false);
            }

            respond(true);
        });
    }, 'The specified email address is already in use.');

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {
        if (!this.isNew) {
            this.modified_at = Date.now();
            return next();
        }

        if (shouldValidatePassword(this) && !validatePresenceOf(this.hashedPassword)) {
            return next(new Error('Invalid password'));
        }

        return next();
    });

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';

        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

module.exports = mongoose.model('User', UserSchema);
