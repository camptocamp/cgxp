describe('plugins.MenuShortcut', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.MenuShortcut();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a MenuShortcut plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.MenuShortcut);
        });
    });
});
