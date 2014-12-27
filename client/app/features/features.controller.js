'use strict';

angular.module('flippersApp')

.controller('FeaturesCtrl', function($scope, $http, Auth, togglesApi) {
    $scope.toggles = [];
    $scope.showHelp = true;
    $scope.editingEnabled = function() {
        return Auth.isAdmin();
    };

    togglesApi.getList().then(function(toggles) {
        $scope.toggles = toggles;
    });

    $scope.closeHelp = function() {
        $scope.showHelp = false;
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
            alert(err.status + ' - ' + err.statusText);
        });
    };
})

.controller('ToggleItemCtrl', function($scope, $http, Restangular) {

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
