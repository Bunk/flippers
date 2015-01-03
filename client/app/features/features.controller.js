'use strict';

angular.module('flippersApp')

.controller('FeaturesCtrl', function($scope, $http, $log, Auth, Help, togglesApi) {

    togglesApi.getList().then(function(toggles) {
        $scope.toggles = toggles;
    });

    $scope.toggles = [];

    $scope.showHelp = Help.shouldShow('toggles');

    $scope.editingEnabled = function() {
        return Auth.isAdmin();
    };

    $scope.closeHelp = function() {
        $scope.showHelp = Help.shouldShow('toggles', false);
    };

    $scope.addToggle = function() {
        if ($scope.newToggleName === '') {
            return;
        }

        $http.post('/api/toggles', {
            name: $scope.newToggleName,
            description: $scope.newToggleDesc,
            enabled: false
        });

        $scope.newToggleName = '';
        $scope.newToggleDesc = '';
    };

    $scope.deleteToggle = function(toggle) {
        toggle.remove().then(function() {
            var idx = $scope.toggles.indexOf(toggle);
            $scope.toggles.splice(idx, 1);
        }, function error(err) {
            $log.error(err);
        });
    };
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
