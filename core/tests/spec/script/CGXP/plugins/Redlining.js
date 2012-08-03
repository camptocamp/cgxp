describe('plugins.Redlining', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Redlining();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Redlining plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Redlining);
        });
    });
});
