'use strict';

var express = require('express');
var controller = require('./invite.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.list);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id/accept', controller.accept);
router.patch('/:id/accept', controller.accept);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
