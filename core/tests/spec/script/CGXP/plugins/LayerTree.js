describe('plugins.LayerTree', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.LayerTree();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a layertree plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.LayerTree);
        });
    });
});
