describe('plugins.Measure', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Measure();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Measure plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Measure);
        });
    });
});
