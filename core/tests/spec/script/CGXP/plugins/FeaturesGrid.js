describe('plugins.FeaturesGrid', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.FeaturesGrid();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a featuregrid plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.FeaturesGrid);
        });
    });
});
