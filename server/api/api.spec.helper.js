'use strict';

var Q = require('q');
var User = require('./user/user.model');

exports.makeRequest = function(request) {
    return Q.ninvoke(request, 'end');
}

exports.clearSchema = function(schema) {
    return Q.ninvoke(schema, 'remove', {});
}

exports.remove = function(obj) {
    return Q.ninvoke(obj, 'remove');
}

exports.createUser = function(fixture) {
    var user = new User(fixture);
    return Q.ninvoke(user, 'save');
}

exports.findUser = function(email) {
    return Q.ninvoke(User, 'findOne', {
        email: email
    });
}
