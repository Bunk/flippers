'use strict';

angular.module('flippersApp')

.factory('authHeaderInterceptor', function($rootScope, $q, $cookieStore) {
    return {
        // Add authorization token to headers
        request: function(config) {
            config.headers = config.headers || {};

            var token = $cookieStore.get('token');
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        }
    };
});
