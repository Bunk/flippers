'use strict';

describe('Service: Help', function() {

    // load the service's module
    beforeEach(module('flippersApp'));

    // instantiate service
    var Help;
    beforeEach(inject(function(_Help_) {
        Help = _Help_;
        Help.clear();
    }));

    it('should default to showing help', function() {
        expect(Help.shouldShow('test')).toBe(true);
    });

    it('should be able to disable viewing of help', function() {
        Help.shouldShow('test', false);
        expect(Help.shouldShow('test')).toBe(false);
    });

});
