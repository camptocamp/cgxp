describe('plugins.Login', function() {
    var p;
    describe('when calling constructor', function() {
        beforeEach(function() {
            p = new cgxp.plugins.Login();
        });
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a Login plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.Login);
        });
    });
});
