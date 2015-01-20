'use strict';

var Q = require('q');

exports.makeRequest = function(request) {
    return Q.ninvoke(request, 'end');
}

exports.clearSchema = function(schema) {
    return Q.ninvoke(schema, 'remove', {});
}

exports.remove = function(obj) {
    return Q.ninvoke(obj, 'remove');
}
