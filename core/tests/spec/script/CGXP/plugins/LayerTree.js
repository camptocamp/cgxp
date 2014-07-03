describe('plugins.LayerTree', function() {
    var p;
    beforeEach(function() {
        p = new cgxp.plugins.LayerTree({
            outputConfig: {
                wmsURL: 'fakeUrl',
                themes: {fake: 'object'},
                defaultThemes: ['fake', 'array']
            }
        });
    });
    describe('when calling constructor', function() {
        it('creates a gxp tool', function() {
            expect(p).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a layertree plugin', function() {
            expect(p).toBeInstanceOf(cgxp.plugins.LayerTree);
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
            var tree = p.addOutput(p.outputConfig);
            expect(tree.wmsURL).toEqual('fakeUrl');
            expect(tree.themes).toEqual({fake: 'object'});
            expect(tree.defaultThemes).toEqual(['fake', 'array']);
            tree.destroy();
        });
    });
});
