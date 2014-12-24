'use strict';

angular.module('flippersApp')

.controller('FeaturesCtrl', function($scope, $http, togglesApi) {
    $scope.showHelp = true;
    $scope.toggles = [];

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

.controller('ToggleCtrl', function($scope, $http) {

    $scope.$watch('toggle.enabled', function(newValue, oldValue) {
        if (oldValue !== newValue) {
            $scope.toggle.put();
        }
    });

});
