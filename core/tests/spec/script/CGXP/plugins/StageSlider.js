describe('plugins.StageSlider', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.StageSlider();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Legend plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.StageSlider);
        });
    });
});
