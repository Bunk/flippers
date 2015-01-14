'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// REST - Users
router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show); // NOTE: Should admins only have access?
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/', auth.hasRole('admin'), controller.create);

// Current user
router.get('/me', auth.isAuthenticated(), controller.me);

// Change Password
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);

// Invitations
router.get('/:id/accept/:token', controller.accepting);
router.put('/:id/accept/:token', controller.accept);
router.post('/invite', controller.invite);

module.exports = router;
