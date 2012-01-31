describe('plugins.ScaleChooser', function() {
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
            s = new cgxp.plugins.ScaleChooser();
        });
        it('creates a gxp tool', function() {
            expect(s).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a scale combo', function() {
            expect(s).toBeInstanceOf(cgxp.plugins.ScaleChooser);
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
            
            s = new cgxp.plugins.ScaleChooser();
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
        /*
        it('updates map scale', function() {
            var nb = combo.getStore().getCount();
            var random = Math.floor(Math.random()*nb);
            var record = combo.getStore().getAt(random);
            var scale = parseInt(record.data.scale);
            combo.setValue("1 : " + parseInt(record.data.scale));
            // FIXME: the map is not updated by combo.setValue()
            expect(combo.getValue()).toEqual("1 : " + parseInt(map.getScale()));
        });
        */
    });
});

