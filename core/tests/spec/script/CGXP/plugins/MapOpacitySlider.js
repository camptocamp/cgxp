describe('plugins.MapOpacitySlider', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.MapOpacitySlider();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a MapOpacitySlider plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.MapOpacitySlider);
        });
    });
});
