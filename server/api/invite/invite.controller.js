'use strict';

var Status = require('../api.statusCodes');
var Auth = require('../../auth/auth.service');
var Invite = require('./invite.model');
var User = require('../user/user.model');

// Get list of invites
exports.list = function(req, res) {
    return Invite.findQ()
        .then(function(invites) {
            return res.status(200).json(invites);
        })
        .catch(function(err) {
            return handleError(res, err);
        });
};

// Get a single invite
exports.show = function(req, res) {
    return Invite.findByIdQ(req.params.id)
        .then(function(invite) {
            if (!invite) return Status.notFound();
            return res.json(invite);
        })
        .catch(function(err) {
            return handleError(res, err);
        });
};

// Creates a new invite in the DB.
exports.create = function(req, res) {
    var invite = new Invite({
        email: req.body.email
    });

    return invite.saveQ()
        .then(function(saved) {
            return res.status(201).json(invite);
        })
        .catch(function(err) {
            return handleError(res, err);
        });
};

// Updates an existing invite in the DB.
exports.accept = function(req, res) {
    Invite.findByIdQ(req.params.id)
        .then(function(invite) {
            if (!invite) return Status.notFound();

            var query = {
                email: invite.email
            };
            return User.findOneQ(query)
                .then(function(user) {
                    // Already a user created for the invite's email
                    // Perhaps this was created out of band.
                    if (user) return Status.notFound();
                    return transformInvite(invite, req.body.password);
                })
                .then(function(user) {
                    // Prepare to log the user in
                    var token = Auth.signToken(user.id);

                    // Remove the invite before logging the user in
                    // in case there's an error.
                    return invite.removeQ().then(function() {
                        // This return token can be used to log the user in.
                        res.status(200).json({
                            token: token
                        });
                    });
                });
        })
        .catch(function(err) {
            handleError(res, err);
        })
        .done();

    function transformInvite(invite, password) {
        var user = new User({
            email: invite.email,
            password: password
        });

        return user.saveQ();
    }
};

// Deletes a invite from the DB.
exports.destroy = function(req, res) {
    Invite.findByIdQ(req.params.id)
        .then(function(invite) {
            if (!invite) return Status.notFound();
            return invite.removeQ();
        })
        .then(function() {
            res.sendStatus(204);
        })
        .catch(function(err) {
            handleError(res, err);
        })
        .done();
};

function handleValidation(res, err) {
    return res.status(422).json(err);
}

function handleError(res, err) {
    var status = err.statusCode || (err.name === 'ValidationError' ? 422 : 500);
    var response = res.status(status);

    if (err.message) return response.send(err.message);
    else return res.send(err);
}
