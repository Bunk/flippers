'use strict';

angular.module('flippersApp')
    .controller('AdminCtrl', function($q, $scope, $http, Auth, User, Restangular) {

        $scope.editing = false;

        $scope.users = [];
        $scope.newUser = {};
        $scope.roles = ['user', 'admin', 'viewer'];

        var loaded = [];
        var deleted = [];

        // Initial loading of users
        reload();

        function reload() {
            return User.getList()

            .then(function(users) {
                loaded = users;
                resetWith(loaded);
            })

            .catch(function(err) {
                loaded = [];
                resetWith(loaded);
            });
        }

        function resetWith(users) {
            deleted = [];
            $scope.users = [];

            _.each(users, function(user) {
                user.persistent = true;
                $scope.users.push(user);
            });
        };

        function equal(lhs, rhs) {
            return _.isEqual(lhs, rhs, function(a, b) {
                return a._id === b._id &&
                    a.email === b.email &&
                    a.role === b.role;
            });
        };

        function asyncSave(users) {
            var deferred = $q.defer();

            setTimeout(function() {
                var promises = [],
                    total = users.length;

                _.each(users, function(user, index) {
                    deferred.notify(index / total);

                    if (!user.persistent) {
                        // CREATE invitation to register
                        // User.invite(user);
                    } else if (user.deleted) {
                        // DELETE
                        promises.push(user.remove());
                    } else {
                        var original = _.find(loaded, function(loadedUser) {
                            return user._id === loadedUser._id;
                        });

                        // Only update when the original values are different than the current values
                        if (original && !equal(user, original)) {
                            promises.push(user.put());
                        }
                    }
                });

                $q.all(promises).then(function() {
                    deferred.resolve();
                }).catch(function(err) {
                    deferred.reject(err);
                });
            }, 0);

            return deferred.promise;
        };

        $scope.edit = function() {
            $scope.editing = true;

            var clones = _.map($scope.users, function(user) {
                return Restangular.copy(user);
            });

            resetWith(clones);
        };

        $scope.save = function() {
            return asyncSave($scope.users)

            .finally(function() {
                reload();
                $scope.editing = false;
            });
        };

        $scope.cancel = function() {
            resetWith(loaded);
            $scope.editing = false;
        };

        $scope.canModify = function(user) {
            return $scope.editing && !user.deleted;
        };

        $scope.canDelete = function(user) {
            return Auth.getCurrentUser()._id !== user._id;
        };

        $scope.delete = function(user) {
            if (user.persistent) {
                user.deleted = !user.deleted;
            } else {
                angular.forEach($scope.users, function(u, i) {
                    if (u === user) {
                        $scope.users.splice(i, 1);
                    }
                });
            }
        };

        $scope.add = function(user) {
            //user.added = true;
            $scope.users.push(user);
            $scope.newUser = {};
        };
    });
