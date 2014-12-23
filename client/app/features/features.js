'use strict';

angular.module('flippersApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('features', {
        url: '/features',
        templateUrl: 'app/features/features.html',
        controller: 'FeaturesCtrl'
      });
  });