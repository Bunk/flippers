'use strict';

var should = require('should');
var request = require('supertest');
var app = require('../../app');
var Auth = require('../../auth/auth.spec.helper');
var Toggle = require('./toggle.model');

describe('Toggles API', function() {
    var users; // stores the authorized users

    before(function(done) {
        Toggle.remove().exec().then(function() {
            Auth.initUsers(function(results) {
                users = results;
                return done();
            });
        });
    });

    after(function(done) {
        Auth.clearUsers(done);
    });

    afterEach(function(done) {
        Toggle.remove({}, done);
    });

    describe('GET /api/toggles', function() {

        it('should respond with unauthorized when not authenticated', function(done) {
            request(app)
                .get('/api/toggles')
                .expect(401)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with forbidden when authenticated as user', function(done) {
            request(app)
                .get('/api/toggles')
                .set('authorization', 'Bearer ' + users['user'].token)
                .expect(403)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with data when authenticated as viewer', function(done) {
            request(app)
                .get('/api/toggles')
                .set('authorization', 'Bearer ' + users['viewer'].token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);
                    res.body.should.be.instanceof(Array);
                    done();
                });
        });

        it('should respond with data when authenticated as admin', function(done) {
            request(app)
                .get('/api/toggles')
                .set('authorization', 'Bearer ' + users['admin'].token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);
                    res.body.should.be.instanceof(Array);
                    done();
                });
        });
    });

});
