describe('plugins.StreetView', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.StreetView();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a StreetView plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.StreetView);
        });
    });
});
