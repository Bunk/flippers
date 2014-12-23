'use strict';

describe('Controller: FeaturesCtrl', function () {

  // load the controller's module
  beforeEach(module('flippersApp'));

  var FeaturesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FeaturesCtrl = $controller('FeaturesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
