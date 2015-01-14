'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
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
    verification: {
        verified: {
            type: Boolean,
            default: false
        },
        token: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        modifiedAt: Date
    },
    hashedPassword: String,
    salt: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: Date,
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
    return user.verification.verified && !isOAuth(user);
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
// TODO: Prevent plus addressing
UserSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        this.constructor.findOne({
            email: value
        }, function(err, user) {
            if (err) throw err;

            if (user) {
                if (self.id === user.id) return respond(true);
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
            this.modifiedAt = Date.now();
            return next();
        }

        if (shouldValidatePassword(this) && !validatePresenceOf(this.hashedPassword)) {
            next(new Error('Invalid password'));
        }

        if (!isOAuth(this) && !this.verified) {
            this.verification.token = this.makeToken();
            this.verification.createdAt = Date.now();
        }

        next();
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

    verify: function(token) {
        var valid = token && token !== '' && this.verification.token && this.verification.token === token;
        if (!valid) {
            return false;
        }

        this.verification.verified = true;
        this.verification.token = '';
        this.verification.modifiedAt = Date.now();

        return true;
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

    makeToken: function() {
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
