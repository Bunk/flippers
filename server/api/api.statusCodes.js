'use strict';

var Q = require('q');

exports.notFound = function() {
    return Q.Promise(function(resolve, reject) {
        reject({
            statusCode: 404
        });
    });
}

exports.unauthorized = function() {
    return Q.Promise(function(resolve, reject) {
        reject({
            statusCode: 401
        });
    });
}

exports.code = function(value) {
    return Q.Promise(function(resolve, reject) {
        reject({
            statusCode: value
        });
    });
}
