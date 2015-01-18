'use strict';

var Q = require('q');

exports.notFound = function() {
    return Q.Promise(function(resolve, reject) {
        reject({
            statusCode: 404
        });
    });
}
