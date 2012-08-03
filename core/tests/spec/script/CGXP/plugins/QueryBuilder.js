describe('plugins.QueryBuilder', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.QueryBuilder();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a QueryBuilder plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.QueryBuilder);
        });
    });
});
