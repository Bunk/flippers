'use strict';

angular.module('flippersApp')

.controller('FeaturesCtrl', function($scope, $http, $log, $q, Auth, Help, togglesApi, Restangular) {

    var loaded = [],
        deleted = [];

    $scope.editing = false;

    $scope.toggles = [];

    $scope.toggleTypes = ['deploy', 'dynamic'];

    $scope.showHelp = Help.shouldShow('toggles');

    $scope.newToggle = {
        type: 'deploy',
        enabled: false
    };

    function resetWith(items) {
        deleted = [];
        $scope.toggles = [];

        _.each(items, function(item) {
            item.persistent = true;
            $scope.toggles.push(item);
        });
    }

    function reload() {
        return togglesApi.getList()

        .then(function(items) {
            loaded = items;
            resetWith(loaded);
        })

        .catch(function(err) {
            $log.error(err);

            loaded = [];
            resetWith(loaded);
        });
    }

    function equal(lhs, rhs) {
        return _.isEqual(lhs, rhs, function(a, b) {
            return a._id === b._id &&
                a.type === b.type &&
                a.key === b.key &&
                a.description === b.description &&
                a.enabled === b.enabled;
        });
    }

    function asyncSave(items) {
        var promises = [];

        _.each(items, function(item) {
            if (!item.persistent) {
                // CREATE invitation to register
                togglesApi.post(item);
            } else if (item.deleted) {
                // DELETE
                promises.push(item.remove());
            } else {
                var original = _.find(loaded, function(loadedItem) {
                    return item._id === loadedItem._id;
                });

                // Only update when the original values are different than the current values
                if (original && !equal(item, original)) {
                    promises.push(item.put());
                }
            }
        });

        return $q.all(promises);
    }

    $scope.canEdit = function() {
        return Auth.isAdmin();
    };

    $scope.edit = function() {
        $scope.editing = true;

        var clones = _.map($scope.toggles, function(item) {
            return Restangular.copy(item);
        });

        resetWith(clones);
    };

    $scope.save = function() {
        if (!$scope.canEdit()) {
            return angular.noop();
        }

        return asyncSave($scope.toggles)

        .finally(function() {
            reload();
            $scope.editing = false;
        });
    };

    $scope.cancel = function() {
        resetWith(loaded);
        $scope.editing = false;
    };

    $scope.canModify = function(item) {
        return $scope.editing && !item.deleted;
    };

    $scope.closeHelp = function() {
        $scope.showHelp = Help.shouldShow('toggles', false);
    };

    $scope.add = function(item) {
        $scope.toggles.push(item);
        $scope.newToggle = {};
    };

    $scope.remove = function(item) {
        if (item.persistent) {
            item.deleted = !item.deleted;
        } else {
            angular.forEach($scope.toggles, function(_item, idx) {
                if (item === _item) {
                    $scope.toggles.splice(idx, 1);
                }
            });
        }
    };

    // Initial loading of users
    reload();
})

.controller('ToggleItemCtrl', function($scope) {

    var skipToggleWatch = false;
    $scope.$watch('toggle.enabled', function(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }

        if (skipToggleWatch) {
            // Ignore the next time
            skipToggleWatch = false;
            return;
        }

        $scope.toggle.put().then(function success() {
            // Success!
        }, function error() {
            // Skip the next firing of this watch to prevent an infinite loop.
            skipToggleWatch = true;
            // Rever the toggle state since we encountered an error.
            $scope.toggle.enabled = oldValue;
        });
    });

});
