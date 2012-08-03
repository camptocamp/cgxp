describe('plugins.WFSPermalink', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.WFSPermalink();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a WFSPermalink plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.WFSPermalink);
        });
    });
});
