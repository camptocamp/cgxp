describe('plugins.SwitchableWMTSSource', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.SwitchableWMTSSource();
        });
        it('creates a gxp layersource', function() {
            expect(p).toBeInstanceOf(gxp.plugins.LayerSource);
        });
        it('creates a SwitchableWMTSSource plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.SwitchableWMTSSource);
        });
    });
});
