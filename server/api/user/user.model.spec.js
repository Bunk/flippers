'use strict';

var should = require('should');
var app = require('../../app');
var User = require('./user.model');

describe('User Model', function() {

    before(function(done) {
        // Clear users before testing
        User.remove().exec().then(function() {
            done();
        });
    });

    afterEach(function(done) {
        User.remove().exec().then(function() {
            done();
        });
    });

    describe('validations', function() {

        var user;

        beforeEach(function() {
            user = new User({
                name: 'Fake User',
                email: 'test@test.com'
            });
        });

        it('should begin with no users', function(done) {
            User.find({}, function(err, users) {
                users.should.have.length(0);
                done();
            });
        });

        it('should fail when saving a duplicate user', function(done) {
            user.save(function() {
                var userDup = new User(user);
                userDup.save(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        it('should fail when saving without an email', function(done) {
            user.email = '';
            user.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should pass when saving without an email and using oauth', function(done) {
            user.email = '';
            user.provider = 'google';
            user.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should fail when updating without a password', function(done) {
            user.save(function(err, saved) {
                saved.password = '';
                saved.save(function(err, saved) {
                    should.exist(err);
                    done();
                });
            });
        })

        it('should pass when saving without a password as an invitation', function(done) {
            user.password = '';
            user.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should pass when saving without a password and using oauth', function(done) {
            user.password = '';
            user.provider = 'google';
            user.save(function(err) {
                should.not.exist(err);
                done();
            });
        });
    });

    describe('timestamps', function() {
        var user;

        beforeEach(function() {
            user = new User({
                name: 'Fake User',
                email: 'test@test.com',
                provider: 'local',
                password: 'password'
            });
        });

        it('should store a created timestamp when saved', function(done) {
            user.save(function(err, saved) {
                saved.should.have.property('createdAt');
                saved.createdAt.should.be.ok;
                done();
            });
        });

        it('should store a modified timestamp when modified', function(done) {
            user.save(function(err, saved) {
                should.not.exist(saved.modifiedAt);

                saved.name = 'Fake User Also';
                saved.save(function(err, updated) {
                    should.exist(saved.modifiedAt);
                    updated.modifiedAt.should.be.ok;

                    done();
                });
            });
        });

    });

    describe('authentication', function() {

        var user;

        beforeEach(function() {
            user = new User({
                name: 'Fake User',
                email: 'test@test.com',
                provider: 'local',
                password: 'password'
            });
        });

        it('should authenticate user if password is valid', function() {
            return user.authenticate('password').should.be.true;
        });

        it('should not authenticate user if password is invalid', function() {
            return user.authenticate('blah').should.not.be.true;
        });

    });

    describe('verification', function() {
        var user;

        beforeEach(function() {
            user = new User({
                email: 'test@test.com',
                provider: 'local'
            });
        });

        it('should generate a random token when registering a new unverified user', function(done) {
            user.save(function(err, saved) {
                should.exist(saved.verification.token);
                should.exist(saved.verification.createdAt);

                saved.verification.token.should.not.have.length(0);
                done();
            });
        });

        it('should pass verification with the correct token', function(done) {
            user.save(function(err, saved) {
                saved.verify(saved.verification.token).should.be.true;

                saved.verification.verified.should.be.true;
                saved.verification.token.should.be.empty;
                saved.verification.modifiedAt.should.be.ok;

                done();
            });
        });

        it('should not pass verification with the wrong token', function(done) {
            user.save(function(err, saved) {
                saved.verify('wrong-token').should.be.false;

                saved.verification.verified.should.be.false;
                saved.verification.token.should.not.be.empty;

                done();
            });
        });

    });
});
