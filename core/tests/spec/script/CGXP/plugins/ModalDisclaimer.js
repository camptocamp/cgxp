describe('plugins.ModalDisclaimer', function() {
    var d;
    beforeEach(function() {
        d = new cgxp.plugins.ModalDisclaimer();
    });
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = d && d.output && d.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        d = null;
    });
    describe('when calling constructor', function() {
        it('creates a gxp tool', function() {
            expect(d).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a modal disclaimer', function() {
            expect(d).toBeInstanceOf(cgxp.plugins.ModalDisclaimer);
        });
    });
    describe('when calling init', function() {
        var o = new Ext.util.Observable();
        var target;
        o.addEvents('add');
        beforeEach(function() {
            target = {
                tools: {},
                mapPanel: {
                    layers: o
                },
                on: function(){}
            };
            spyOn(d, 'onAdd');
            d.init(target);
        });
        describe('when add event is fired', function() {
            it('calls the onAdd method', function() {
                o.fireEvent('add', 'foo');
                expect(d.onAdd).toHaveBeenCalledWith('foo');
            });
        });
    });
});
