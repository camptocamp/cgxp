describe('plugins.Routing', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Routing();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Routing plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Routing);
        });
    });
});
