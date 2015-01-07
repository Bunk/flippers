'use strict';

angular.module('flippersApp')

.factory('authErrorInterceptor', function($rootScope, $q, $cookieStore, $location) {
    return {
        responseError: function(response) {
            switch (response.status) {
                case 401:
                    // 401 - Unauthenticated
                    // http://stackoverflow.com/a/6937030
                    $location.path('/login');
                    // remove the login token in order to force another login
                    $cookieStore.remove('token');
                    break;
                case 403:
                    // 403 - Unauthorized (really Forbidden, but let's not split hairs)
                    // TODO: Show a flash message for unauthorized
                    $rootScope.$broadcast('unauthorized-request', response);
                    break;
            }
            return $q.reject(response);
        }
    };
});
