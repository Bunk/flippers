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
                email: 'test@test.com',
                password: 'password'
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
        });

        it('should fail when saving without a password and using local provider', function(done) {
            user.password = '';
            user.save(function(err) {
                should.exist(err);
                done();
            })
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
                should.exist(saved.created_at);
                done();
            });
        });

        it('should store a modified timestamp when modified', function(done) {
            user.save(function(err, saved) {
                should.not.exist(saved.modified_at);

                saved.name = 'Fake User Also';
                saved.save(function(err, updated) {
                    should.exist(saved.modified_at);
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
});
