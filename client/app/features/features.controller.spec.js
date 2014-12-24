'use strict';

describe('Controller: FeaturesCtrl', function() {

    // load the controller's module
    beforeEach(module('flippersApp'));

    var FeaturesCtrl, scope, $httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function(_$httpBackend_, $controller, $rootScope) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('/api/toggles')
            .respond([{
                name: 'enabled-feature',
                description: '',
                enabled: true
            }, {
                name: 'disabled-feature',
                description: '',
                enabled: false
            }]);

        scope = $rootScope.$new();
        FeaturesCtrl = $controller('FeaturesCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of features to the scope', function() {
        $httpBackend.flush();
        expect(scope.toggles.length).toEqual(2);
    });
});
