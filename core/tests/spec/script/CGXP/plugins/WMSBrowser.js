describe('plugins.WMSBrowser', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.WMSBrowser();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a WMSBrowser plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.WMSBrowser);
        });
    });
});
