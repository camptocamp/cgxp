describe('plugins.Permalink', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Permalink();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Permalink plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Permalink);
        });
    });
});
