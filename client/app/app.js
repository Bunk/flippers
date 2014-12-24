'use strict';

angular.module('flippersApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    'restangular',
    'ui.router',
    'ui.bootstrap',
    'ui.gravatar',
    'toggle-switch'
])

.config(function($stateProvider, $urlRouterProvider, $locationProvider,
    $httpProvider, RestangularProvider) {
    $urlRouterProvider
        .otherwise('/');

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('authInterceptor');

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setRestangularFields({
        id: '_id'
    });
})

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function(config) {
            config.headers = config.headers || {};

            var token = $cookieStore.get('token');
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if (response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})

.run(function($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                $location.path('/login');
            }
        });
    });
});
