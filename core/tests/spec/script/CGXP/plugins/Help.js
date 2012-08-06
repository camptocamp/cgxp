describe('plugins.Help', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Help();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a help plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Help);
        });
    });
});
