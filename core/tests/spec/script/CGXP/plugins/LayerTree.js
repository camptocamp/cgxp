describe('plugins.LayerTree', function() {
    var p;
    beforeEach(function() {
        p = new cgxp.plugins.LayerTree({
            wmsURL: 'fakeUrl',
            themes: {fake: 'object'},
            defaultThemes: ['fake', 'array']
        });
    });
    describe('when calling constructor', function() {
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a layertree plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.LayerTree);
        });
        it('creates a plugin with expected properties', function() {
            expect(p.wmsURL).toEqual('fakeUrl');
            expect(p.themes).toEqual({fake: 'object'});
            expect(p.defaultThemes).toEqual(['fake', 'array']);
        });
    });
    describe('when adding output', function() {
        it('creates a LayerTree with expected properties', function() {
            p.target = {
                mapPanel: {
                    map: {
                        events: {
                            on: jasmine.createSpy()
                        }
                    }
                }
            };
            var tree = p.addOutput();
            expect(tree.wmsURL).toEqual('fakeUrl');
            expect(tree.themes).toEqual({fake: 'object'});
            expect(tree.defaultThemes).toEqual(['fake', 'array']);
            tree.destroy();
        });
    });
});
