'use strict';

var should = require('should');
var request = require('supertest');
var app = require('../../app');
var Auth = require('../../auth/auth.spec.helper');
var User = require('./user.model');

function clearData(schema, done) {
    schema.remove().exec().then(function() {
        done();
    });
}

function addUser(data, done) {
    var user = new User(data);
    user.save(function(err, data) {
        if (err) return done(err);
        return done(null, user);
    });
}

describe('Users API', function() {
    var user;

    // Clear users before testing
    before(function(done) {
        clearData(User, done);
    });

    // Create a test user for each run
    beforeEach(function(done) {
        var data = {
            email: 'existing@email.com'
        };
        addUser(data, function(err, saved) {
            if (err) return done(err);
            user = saved;
            done();
        });
    });

    // Clear users after each test run
    afterEach(function(done) {
        clearData(User, done);
    });

});
