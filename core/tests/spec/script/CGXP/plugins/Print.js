describe('plugins.Print', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Print();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Print plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Print);
        });
    });
});
