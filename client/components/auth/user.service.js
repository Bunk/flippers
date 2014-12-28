'use strict';

angular.module('flippersApp')

.factory('User', function(Restangular) {
    var users = Restangular.service('users');

    users.current = function(callback, error) {
        return Restangular.one('users', 'me').get()
            .then(callback, error);
    };

    return users;
});
