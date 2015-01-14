'use strict';

angular.module('flippersApp')
    .controller('SignupCtrl', function($scope, Auth, $location, $window) {
        $scope.user = {};
        $scope.errors = {};

        $scope.invite = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.registerUser({
                    email: $scope.user.email
                })

                .then(function() {
                    // Account registered, redirect to waiting page
                    $location.path('/account/registered');
                })

                .catch(function(err) {
                    err = err.data;
                    $scope.errors = {};

                    _.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                });
            }
        };

        $scope.register = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.createUser({
                    name: $scope.user.name,
                    email: $scope.user.email,
                    password: $scope.user.password
                })

                .then(function() {
                    // Account created, redirect to home
                    $location.path('/');
                })

                .catch(function(err) {
                    err = err.data;
                    $scope.errors = {};

                    // Update validity of form fields that match the mongoose errors
                    angular.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                });
            }
        };

        $scope.loginOauth = function(provider) {
            $window.location.href = '/auth/' + provider;
        };
    });
