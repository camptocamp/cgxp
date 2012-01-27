describe('plugins.ScaleCombo', function() {
    var s;
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = s && s.output && s.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        s = null;
    });
    describe('when calling constructor', function() {
        beforeEach(function() {
            s = new cgxp.plugins.ScaleCombo();
        });
        it('creates a gxp tool', function() {
            expect(s).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a scale combo', function() {
            expect(s).toBeInstanceOf(cgxp.plugins.ScaleCombo);
        });
    });
    describe('when calling addActions', function() {
        var combo, map;
        beforeEach(function() {
            map = new OpenLayers.Map();
            var layer = new OpenLayers.Layer.WMS(
                "Global Imagery",
                "http://maps.opengeo.org/geowebcache/service/wms",
                {layers: "bluemarble"}
            );
            map.addLayer(layer);
            
            s = new cgxp.plugins.ScaleCombo();
            s.actionTarget = [null];
            s.target = {
                mapPanel: {
                    map: map
                }
            };
            var actions = s.addActions();
            combo = actions[1];
        });
        it('creates a ComboBox', function() {
            expect(combo).toBeInstanceOf(Ext.form.ComboBox);
            expect(combo.getStore().getCount()).toEqual(map.getNumZoomLevels());
        });
        it('displays current scale', function() {
            map.zoomIn();
            expect(combo.getValue()).toEqual("1 : " + parseInt(map.getScale()));
        });
        /*it('updates map scale', function() {
            var zoom = map.getNumZoomLevels() - 1;
            var res = map.getResolutionForZoom(zoom);
            var scale = OpenLayers.Util.getScaleFromResolution(res, map.units);
            var record = combo.getStore().getAt(zoom);
            combo.setValue("1 : " + parseInt(scale));
            combo.fireEvent("select", combo, record, zoom);
            //expect(combo.getValue()).toEqual("1 : " + parseInt(map.getScale()));
            expect(combo.getValue()).toEqual("combo");
            expect("1 : " + parseInt(map.getScale())).toEqual("map");
        });*/
    });
});

