/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 * POST    /api/users              ->  create
 * GET     /api/users/:id          ->  show
 * PUT     /api/users/:id          ->  update
 * PATCH   /api/users/:id          ->  update
 * DELETE  /api/users/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var protectedQuery = '-salt -hashedPassword';
var jwtExpires = {
    expiresInMinutes: 60 * 5
};

var validationError = function(res, err) {
    return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
    User.find({}, protectedQuery, function(err, users) {
        if (err) return res.send(500, err);
        res.json(200, users);
    });
};

exports.accepting = function(req, res, next) {
    var userId = req.params.id;
    var token = req.params.token;

    User.findById(userId, protectedQuery, function(err, user) {
        if (err) {
            return next(err);
        }

        if (!user || user.verification.token !== token) {
            return res.send(404);
        }

        return res.send(200);
    });
};

exports.accept = function(req, res, next) {
    var userId = req.params.id;
    var token = req.params.token;

    User.findOne({
        _id: userId
    }, protectedQuery, function(err, user) {
        if (err) {
            return next(err);
        }

        if (!user || user.verification.token !== token) {
            return res.send(404);
        }

        var pass = String(req.body.password);
        user.password = pass;
        user.verification.verified = true;
        user.verification.token = '';

        user.save(function(err, saved) {
            if (err) return validationError(res, err);
            res.send(200);
        });
    });
};

exports.invite = function(req, res) {
    var newUser = new User({
        name: req.body.email,
        email: req.body.email,
        provider: 'local',
        role: 'user',
        verified: false
    });

    newUser.save(function(err, user) {
        if (err) return validationError(res, err);

        // TODO: Send email

        res.json({
            id: user.id,
            token: user.verification.token
        })
    });
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save(function(err, user) {
        if (err) return validationError(res, err);

        var token = jwt.sign({
            _id: user._id
        }, config.secrets.session, jwtExpires);

        res.json({
            token: token
        });
    });
};

exports.update = function(req, res, next) {
    // remove any values that shouldn't be updated
    if (req.body._id) delete req.body._id;
    if (req.body.salt) delete req.body.salt;
    if (req.body.hashedPassword) delete req.body.hashedPassword;

    User.findById(req.params.id, function(err, user) {
        if (err) return handleError(res, err);

        if (!toggle) return res.send(404);

        var updated = _.merge(user, req.body);
        updated.save(function(err) {
            if (err) return handleError(res, err);

            return res.json(200, user);
        });
    });
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);
        res.json(user.profile);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.send(500, err);
        return res.send(204);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function(err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.send(200);
            });
        } else {
            res.send(403);
        }
    });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, protectedQuery, function(err, user) {
        if (err) return next(err);
        if (!user) return res.json(401);
        res.json(user);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
