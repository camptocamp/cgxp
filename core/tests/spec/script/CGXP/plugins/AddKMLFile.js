describe('plugins.AddKMLFile', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.AddKMLFile();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a addkmlfile plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.AddKMLFile);
        });
    });
});

