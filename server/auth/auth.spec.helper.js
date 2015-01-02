'use strict';

var _ = require('lodash');
var async = require('async');
var supertest = require('supertest');

var app = require('../app');
var User = require('../api/user/user.model');
var agent = supertest.agent(app);

// deletes all users
exports.clearUsers = function(callback) {
    User.remove({}, function() {
        if (callback) {
            callback();
        }
    });
};

// creates all users in mock and authenticates them
exports.initUsers = function(callback) {
    var users = require('./auth.fixtures');

    User.remove({}, function() {
        async.mapSeries(users, function(user, cb) {
            initUser(user, cb);
        }, function(err, results) {
            if (!err) {
                var x = {};
                _(results).each(function(result) {
                    x[result.role] = result;
                });
                callback(x);
            }
        });
    });
};

// creates a single user and authenticates it
function initUser(fixture, cb) {
    User.create(fixture, function(err, user) {
        if (err) cb(err);

        fixture.id = user._id;
        agent
            .post('/auth/local')
            .send({
                email: fixture.email,
                password: fixture.password
            })
            .end(function(err, result) {
                if (err) cb(err);

                fixture.token = result.body.token;

                cb(null, fixture);
            });
    });
}
