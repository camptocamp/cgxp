describe('plugins.Profile', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Profile();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a profile', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Profile);
        });
    });
});
