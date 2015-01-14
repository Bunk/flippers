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

    describe('GET /api/users/{id}/accept/{token}', function() {
        it('should respond with 404 when the invitation does not exist', function(done) {
            request(app)
                .get('/api/users/1234567/accept/asdfqwerty')
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 404 when the invitation token does not match', function(done) {
            request(app)
                .get('/api/users/' + user.id + '/accept/asdfqwerty')
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 200 when the invitation exists', function(done) {
            request(app)
                .get('/api/users/' + user.id + '/accept/' + user.verification.token)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('PUT /api/users/{id}/accept/{token}', function() {
        it('should respond with 404 when the invitation does not exist', function(done) {
            request(app)
                .put('/api/users/1234567/accept/asdfqwerty')
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 404 when the invitation token does not match', function(done) {
            request(app)
                .put('/api/users/' + user.id + '/accept/asdfqwerty')
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 422 when the password is invalid', function(done) {
            request(app)
                .put('/api/users/' + user.id + '/accept/' + user.verification.token)
                .send({
                    password: ''
                })
                .expect(422)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 200 when the password has been set', function(done) {
            request(app)
                .put('/api/users/' + user.id + '/accept/' + user.verification.token)
                .send({
                    password: '17234ASD!1asou1Ga0_'
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('POST /api/users/invite', function() {
        it('should respond with 422 when the email already exists', function(done) {
            request(app)
                .post('/api/users/invite')
                .send({
                    email: 'existing@email.com'
                })
                .expect(422)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it('should respond with 200 when created', function(done) {
            request(app)
                .post('/api/users/invite')
                .send({
                    email: 'invitee@email.com'
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);

                    // ID and Token are used temporarily to 'fake' sending the email / flow
                    res.body.id.should.be.ok;
                    res.body.token.should.be.ok;

                    done();
                });
        });
    })
});
