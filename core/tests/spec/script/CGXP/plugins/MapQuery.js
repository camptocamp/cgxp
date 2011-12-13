describe('plugins.MapQuery', function() {
    var mq;
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = mq && mq.output && mq.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        mq = null;
    });
    describe('when calling constructor', function() {
        beforeEach(function() {
            mq = new cgxp.plugins.MapQuery();
        });
        it('creates a gxp tool', function() {
            expect(mq).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a cgxp map query', function() {
            expect(mq).toBeInstanceOf(cgxp.plugins.MapQuery);
        });
    });
    describe('when calling constructor with options', function() {
        beforeEach(function() {
            mq = new cgxp.plugins.MapQuery({
                highlightLayerOptions: {
                    displayInLayerSwitcher: true,
                    renderers: ['Canvas']
                }
            });
            mq.init({
                tools: {},
                on: function() {}
            });
        });
        it('sets the highlight layer options', function() {
            expect(mq.highlightLayer.displayInLayerSwitcher).toEqual(true);
            expect(mq.highlightLayer.renderers).toEqual(['Canvas']);
        });
    });
    describe('when calling addActions', function() {
        var actions;
        beforeEach(function() {
            mq = new cgxp.plugins.MapQuery();
            // some mocking
            mq.actionTarget = [null];
            mq.target = {
                mapPanel: {
                    map: {}
                }
            };
            actions = mq.addActions();
        });
        it('creates an array of length 1', function() {
            expect(actions.length).toEqual(1);
        });
        it('creates a geoext action', function() {
            expect(actions[0]).toBeInstanceOf(GeoExt.Action);
        });
        it('creates a wms getfeatureinfo control', function() {
            expect(actions[0].control).toBeInstanceOf(OpenLayers.Control.WMSGetFeatureInfo);
        });
    });
});
