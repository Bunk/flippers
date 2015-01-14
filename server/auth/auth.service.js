'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({
    secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
exports.isAuthenticated = function() {
    return compose()
        // Validate jwt
        .use(function(req, res, next) {
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = 'Bearer ' + req.query.access_token;
            }
            validateJwt(req, res, next);
        })
        // Attach user to request
        .use(function(req, res, next) {
            User.findById(req.user._id, function(err, user) {
                if (err) return next(err);
                if (!user) return res.send(401);

                req.user = user;
                next();
            });
        });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
exports.hasRole = function(rolesRequired) {
    if (!rolesRequired) throw new Error('Required role needs to be set');

    return compose()
        .use(exports.isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            var authorized = false;
            if (_.isArray(rolesRequired)) {
                authorized = _.any(rolesRequired, function(role) {
                    return authorizeRole(role, req);
                });
            } else {
                authorized = authorizeRole(rolesRequired, req);
            }

            if (authorized) {
                next();
            } else {
                res.send(403);
            }
        });
}

function authorizeRole(role, req) {
    return _.indexOf(config.userRoles, req.user.role) === _.indexOf(config.userRoles, role);
}

/**
 * Returns a jwt token signed by the app secret
 */
exports.signToken = function(id) {
    return jwt.sign({
        _id: id
    }, config.secrets.session, {
        expiresInMinutes: 60 * 5
    });
}

/**
 * Set token cookie directly for oAuth strategies
 */
exports.setTokenCookie = function(req, res) {
    if (!req.user) return res.json(404, {
        message: 'Something went wrong, please try again.'
    });

    var token = signToken(req.user._id, req.user.role);
    res.cookie('token', JSON.stringify(token));
    res.redirect('/');
}
