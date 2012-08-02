describe('plugins.ContextualData', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.ContextualData();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a contextual data plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.ContextualData);
        });
    });
});
