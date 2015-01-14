'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// All users
router.get('/', auth.hasRole('admin'), controller.index);

// Single user
router.get('/:id', auth.isAuthenticated(), controller.show);

// Update user
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);

// Create user
router.post('/', controller.create);

// Delete user
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

// Change Password
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);

// Current user
router.get('/me', auth.isAuthenticated(), controller.me);

// Valid invitation
router.get('/invite/:id/:token', controller.invited);

module.exports = router;
