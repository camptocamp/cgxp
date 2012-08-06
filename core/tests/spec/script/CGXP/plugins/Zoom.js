describe('plugins.Zoom', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Zoom();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Zoom plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Zoom);
        });
    });
});
