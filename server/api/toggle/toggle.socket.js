/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Toggle = require('./toggle.model');

exports.register = function(socket) {
  Toggle.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Toggle.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('toggle:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('toggle:remove', doc);
}