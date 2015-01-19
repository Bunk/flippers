/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Invite = require('./invite.model');

exports.register = function(socket) {
  Invite.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Invite.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('invite:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('invite:remove', doc);
}