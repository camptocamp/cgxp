describe('plugins.FullTextSearch', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.FullTextSearch();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a full text search plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.FullTextSearch);
        });
    });
});
