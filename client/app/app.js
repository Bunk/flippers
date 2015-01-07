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

.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, RestangularProvider) {

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('authHeaderInterceptor');
    $httpProvider.interceptors.push('authErrorInterceptor');

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setRestangularFields({
        id: '_id'
    });
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
