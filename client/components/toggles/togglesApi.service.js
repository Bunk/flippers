'use strict';

angular.module('flippersApp')
    .factory('togglesApi', function(Restangular) {
        return Restangular.service('toggles');
    });
