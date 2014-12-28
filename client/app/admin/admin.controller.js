'use strict';

angular.module('flippersApp')
    .controller('AdminCtrl', function($scope, $http, Auth, User) {

        $scope.users = [];

        // Initial loading of users
        User.getList().then(function(users) {
            $scope.users = users;
        });

        $scope.delete = function(user) {
            user.remove().then(function() {
                angular.forEach($scope.users, function(u, i) {
                    if (u === user) {
                        $scope.users.splice(i, 1);
                    }
                });
            });
        };
    });
