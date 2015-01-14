'use strict';

var should = require('should');
var request = require('supertest');
var app = require('../../app');
var Auth = require('../../auth/auth.spec.helper');
var User = require('./user.model');

describe('Users API', function() {

    describe('GET /api/users/invitation/{id}/{token}', function() {
        it('should respond with 404 when the invitation does not exist', function(done) {
            // 404 status
            request(app)
                .get('/api/users/invite/12345/asdfqwerty')
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 200 when the invitation exists', function(done) {
            // 200 status
            done();
        });
    });

    describe('PUT /api/users/password/{id}/{token}', function() {
        it('should respond with 404 when the invitation does not exist', function(done) {
            done();
        });

        it('should respond with 422 when the password is invalid', function(done) {
            done();
        });

        it('should respond with 200 when the password has been set', function(done) {
            done();
        });
    });

});
