'use strict';

describe('Service: togglesApi', function() {

    // load the service's module
    beforeEach(module('flippersApp'));

    // instantiate service
    var togglesApi;
    beforeEach(inject(function(_togglesApi_) {
        togglesApi = _togglesApi_;
    }));

    it('should do something', function() {
        expect(!!togglesApi).toBe(true);
    });

});
