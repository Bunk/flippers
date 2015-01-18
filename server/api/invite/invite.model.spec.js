'use strict';

var should = require('should');
var app = require('../../app');
var User = require('../user/user.model');
var Invite = require('./invite.model')

function clear(schema, done) {
    done = done || function() {};
    return schema.remove().exec().then(done);
}

function then(done) {
    return function() {
        done();
    };
}

describe('Invite Model', function() {
    var user;

    before(function(done) {
        clear(User);
        clear(Invite);

        user = new User({
            name: 'Existing User',
            email: 'existing@email.com',
            password: 'password'
        });
        user.save(function(err) {
            if (err) throw err;
            done();
        });
    });

    after(function(done) {
        clear(User, then(done));
    });

    afterEach(function(done) {
        clear(Invite, then(done));
    });

    describe('validations', function() {
        var invite;

        beforeEach(function() {
            invite = new Invite({
                email: 'invite@email.com'
            });
        });

        it('should begin with no invites', function(done) {
            Invite.find({}, function(err, data) {
                data.should.have.length(0);
                done();
            });
        });

        it('should successfully create a new invite', function(done) {
            invite.save(function(err, data) {
                should.not.exist(err);
                should.exist(data);
                should.exist(data.created_at);

                data.verified.should.be.false;

                done();
            });
        });

        it('should fail when saving a duplicate invite', function(done) {
            invite.save(function() {
                var dup = new Invite(invite);
                dup.save(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        it('should fail when saving without an email', function(done) {
            invite.email = '';
            invite.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should fail when saving with an email of a user that is already created', function(done) {
            invite.email = 'existing@email.com';
            invite.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

});
