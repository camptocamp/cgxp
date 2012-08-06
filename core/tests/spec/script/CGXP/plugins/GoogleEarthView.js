describe('plugins.GoogleEarthView', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.GoogleEarthView();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a googleearthview plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.GoogleEarthView);
        });
    });
});
