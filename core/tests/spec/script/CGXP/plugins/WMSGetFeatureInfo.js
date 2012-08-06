describe('plugins.WMSGetFeatureInfo', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.WMSGetFeatureInfo();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a WMSGetFeatureInfo plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.WMSGetFeatureInfo);
        });
    });
});
