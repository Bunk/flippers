'use strict';

var Q = require('q');
var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Auth = require('../../auth/auth.spec.helper');
var Api = require('../api.spec.helper');
var User = require('../user/user.model');
var Invite = require('./invite.model');

describe('Invites API', function() {
    var users; // stores the authorized users
    var invite; // stores the created invites

    before(function(done) {
        Auth.initUsers(function(createdUsers) {
            users = createdUsers;
            return done();
        });
    });

    beforeEach(function(done) {
        createInvite('invite@email.com')
            .then(function(created) {
                invite = created[0];
                done();
            })
            .catch(function(err) {
                done(err);
            })
            .done();
    });

    afterEach(function(done) {
        Api.clearSchema(Invite)
            .then(function() {
                done();
            })
            .catch(function(err) {
                console.error('cleared err: ' + err);
            })
            .done();
    });

    after(function(done) {
        Auth.clearUsers(done);
    });

    describe('GET /api/invites', function() {
        it('should respond with 401 when not authenticated', function() {
            return Api.makeRequest(request(app)
                .get('/api/invites')
                .expect(401));
        });

        it('should respond with 403 when authenticated as user', function() {
            return Api.makeRequest(request(app)
                .get('/api/invites')
                .set('authorization', 'Bearer ' + users['user'].token)
                .expect(403));
        });

        it('should respond with 200 when authenticated as admin', function() {
            return Api.makeRequest(request(app)
                    .get('/api/invites')
                    .set('authorization', 'Bearer ' + users['admin'].token)
                    .expect(200)
                    .expect('Content-Type', /json/))
                .then(function(res) {
                    res.body.should.be.instanceof(Array);
                });
        });
    });

    describe('GET /api/invites/{token}', function() {
        it('should respond with 404 when the invitation does not exist', function() {
            return Api.makeRequest(request(app)
                .get('/api/invites/000000000000000000000000')
                .expect(404));
        });

        it('should respond with 200 when the invitation exists', function() {
            return Api.makeRequest(request(app)
                .get('/api/invites/' + invite.id)
                .expect(200));
        });
    });

    describe('POST /api/invites/{token}', function() {
        it('should respond with 422 when the email is not sent', function() {
            return Api.makeRequest(request(app)
                .post('/api/invites')
                .send({})
                .expect(422));
        });

        it('should respond with 422 when the email is invalid', function() {
            return Api.makeRequest(request(app)
                .post('/api/invites')
                .send({
                    email: ''
                })
                .expect(422));
        });

        it('should respond with 201 when the invite is created', function() {
            return Api.makeRequest(request(app)
                .post('/api/invites')
                .send({
                    email: 'user@email.com'
                })
                .expect(201));
        });
    });

    describe('PUT /api/invites/{token}/accept', function() {
        it('should respond with 404 when the invitation does not exist', function() {
            return Api.makeRequest(request(app)
                .put('/api/invites/000000000000000000000000/accept')
                .expect(404));
        });

        it('should respond with 404 when there is a user for the invitation already', function() {
            // Create a new user manually (as if they had registered themselves through oauth)
            // and then try to accept the invitation.
            var userFixture = {
                email: invite.email,
                password: '1234!@#$'
            };

            return Api.createUser(userFixture)
                .then(function(created) {
                    // Manually create the user in the test after the invite has
                    // already been created
                    return Api.makeRequest(request(app)
                            .put('/api/invites/' + invite.id + '/accept')
                            .send({
                                password: '!@$#asuo1'
                            })
                            .expect(404))
                        .then(function() {
                            return Api.remove(created);
                        });
                });
        });

        it('should respond with 422 when the password is invalid', function() {
            return Api.makeRequest(request(app)
                .put('/api/invites/' + invite.id + '/accept')
                .send({
                    password: ''
                })
                .expect(422));
        });

        it('should respond with 200 when the password has been set', function() {
            return Api.makeRequest(request(app)
                    .put('/api/invites/' + invite.id + '/accept')
                    .send({
                        password: '17234ASD!1asou1Ga0_'
                    })
                    .expect(200))
                .then(function(res) {
                    // There should be an auth token for the new user.
                    should.exist(res.body.token);

                    return Api.findUser(invite.email);
                })
                .then(function(user) {
                    // A new user should be created for the invite.
                    should.exist(user);

                    // Remove this user manually since we aren't removing all users
                    // for each test interation.
                    return Api.remove(user);
                });
        });
    });

    describe('DELETE /api/invites/{token}', function() {
        it('should respond with 401 when the user is not authenticated', function() {
            return Api.makeRequest(request(app)
                .delete('/api/invites/000000000000000000000000')
                .expect(401));
        });

        it('should respond with 403 when the user is not an admin', function() {
            return Api.makeRequest(request(app)
                .delete('/api/invites/000000000000000000000000')
                .set('authorization', 'Bearer ' + users['user'].token)
                .expect(403));
        });

        it('should respond with 404 when the invite does not exist.', function() {
            return Api.makeRequest(request(app)
                .delete('/api/invites/000000000000000000000000')
                .set('authorization', 'Bearer ' + users['admin'].token)
                .expect(404));
        });

        it('should respond with 204 when the invite is deleted', function() {
            return Api.makeRequest(request(app)
                    .delete('/api/invites/' + invite.id)
                    .set('authorization', 'Bearer ' + users['admin'].token)
                    .expect(204))
                .then(function() {
                    return findInvite(invite.id);
                })
                .then(function(invite) {
                    should.not.exist(invite);
                });
        });
    });
});

function createInvite(email) {
    var invite = new Invite({
        email: email
    });
    return Q.ninvoke(invite, 'save');
}

function findInvite(id) {
    return Q.ninvoke(Invite, 'findById', id);
}
