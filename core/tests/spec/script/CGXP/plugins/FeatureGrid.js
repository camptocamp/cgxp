describe('plugins.FeatureGrid', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.FeatureGrid();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a featuregrid plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.FeatureGrid);
        });
    });
});
