'use strict';

var _ = require('lodash');
var Q = require('q');
var Auth = require('../../auth/auth.service');
var Status = require('../api.statusCodes');
var Invite = require('./invite.model');
var User = require('../user/user.model');

// Get list of invites
exports.list = function(req, res) {
    Invite.find(function(err, invites) {
        if (err) return handleError(res, err);
        return res.status(200).json(invites);
    });
};

// Get a single invite
exports.show = function(req, res) {
    Invite.findById(req.params.id, function(err, invite) {
        if (err) return handleError(res, err);
        if (!invite) return res.sendStatus(404);
        return res.json(invite);
    });
};

// Creates a new invite in the DB.
exports.create = function(req, res) {
    var invite = new Invite({
        email: req.body.email
    });

    invite.save(function(err, saved) {
        if (err) return handleValidation(res, err);
        return res.status(201).json(invite);
    });
};

// Updates an existing invite in the DB.
exports.accept = function(req, res) {
    findInvite(req.params.id)
        .then(function(invite) {
            if (!invite) return Status.notFound();
            return findUser(invite.email)
                .then(function(user) {
                    if (user) return Status.notFound();
                    return transformInvite(invite, req.body.password);
                })
                .then(function(user) {
                    // Prepare to log the user in
                    var token = Auth.signToken(user.id);

                    // Remove the invite before logging the user in
                    // in case there's an error.
                    return remove(invite).then(function() {
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

        return Q.ninvoke(user, 'save');
    }

    function findUser(email) {
        return Q.ninvoke(User, 'findOne', {
            email: email
        });
    }
};

// Deletes a invite from the DB.
exports.destroy = function(req, res) {
    findInvite(req.params.id)
        .then(function(invite) {
            if (!invite) return Status.notFound();
            return remove(invite);
        })
        .then(function() {
            res.sendStatus(204);
        })
        .catch(function(err) {
            handleError(res, err);
        })
        .done();
};

function findInvite(id) {
    return Q.ninvoke(Invite, 'findById', id);
}

function remove(invite) {
    return Q.ninvoke(invite, 'remove');
}

function handleValidation(res, err) {
    return res.status(422).json(err);
}

function handleError(res, err) {
    var status = err.statusCode || (err.name === 'ValidationError' ? 422 : 500);
    var response = res.status(status);

    if (err.message) return response.send(err.message);
    else return res.send(err);
}
