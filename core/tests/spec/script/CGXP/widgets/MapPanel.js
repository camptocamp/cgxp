describe('MapPanel', function() {
    var mp;
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = mp && mp.output && mp.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        mp = null;
    });
    describe('when calling constructor', function() {
        beforeEach(function() {
            mp = new cgxp.MapPanel();
        });
        it('creates a geoext mappanel', function() {
            expect(mp).toBeInstanceOf(GeoExt.MapPanel);
        });
        it('creates a cgxp mappanel', function() {
            expect(mp).toBeInstanceOf(cgxp.MapPanel);
        });
    });

    describe('when calling getState', function() {
        var state;
        beforeEach(function() {
            var permalinkProvider = new GeoExt.state.PermalinkProvider({encodeType: false});
            Ext.state.Manager.setProvider(permalinkProvider);
            var map = new OpenLayers.Map();
            map.addLayers([
                new OpenLayers.Layer.WMS(
                    "Imagery",
                    "http://maps.opengeo.org/geowebcache/service/wms",
                    {layers: "bluemarble"}
                )
            ]);
            mp = new cgxp.MapPanel({
                renderTo: document.body,
                width: 1,
                height: 1,
                center: new OpenLayers.LonLat(12, 41),
                zoom: 3,
                map: map,
                stateId: "map"
            });
            state = mp.getState();
        });
        it('creates an object', function() {
            expect(state).toBeInstanceOf(Object);
        });
        it('creates an object with correct values', function() {
            expect(state.x).toEqual(12);
            expect(state.y).toEqual(41);
            expect(state.zoom).toEqual(3);
        });
        it('does not take into account layer opacity and visibility', function() {
            var no_gx_mappanel_state_keys = true;
            Ext.iterate(state, function(k,v){
                if (k.slice(0,11) == "visibility_" || k.slice(0,8) == "opacity_") {
                    no_gx_mappanel_state_keys = false;
                }
            })
            expect(no_gx_mappanel_state_keys).toEqual(true);
        });
    });

    describe('when calling applyState', function() {
        var map, popupOK;
        beforeEach(function() {
            var permalinkProvider = new GeoExt.state.PermalinkProvider({encodeType: false});
            Ext.state.Manager.setProvider(permalinkProvider);
            map = new OpenLayers.Map();
            map.addLayers([
                new OpenLayers.Layer.WMS(
                    "Imagery",
                    "http://maps.opengeo.org/geowebcache/service/wms",
                    {layers: "bluemarble"}
                )
            ]);
            mp = new cgxp.MapPanel({
                renderTo: document.body,
                width: 1,
                height: 1,
                map: map,
                stateId: "map"
            });
            mp.applyState({
                tooltip: 'truite fumée',
                crosshair: 1,
                x: 13,
                y: 42,
                zoom: 4
            });
        });
        it('sets map to correct location', function() {
            expect(mp.center.lon).toEqual(13);
            expect(mp.center.lat).toEqual(42);
            expect(mp.zoom).toEqual(4);
        });
        it('creates a vector layer', function() {
            expect(mp.vectorLayer).toBeInstanceOf(OpenLayers.Layer.Vector);
        });
        it('displays a crosshair', function() {
            expect(mp.vectorLayer.features.length).toEqual(1);
        });
        it('displays a crosshair at correct location', function() {
            expect(mp.vectorLayer.features[0].geometry.x).toEqual(13);
            expect(mp.vectorLayer.features[0].geometry.y).toEqual(42);
        });
        it('displays a popup', function() {
            mp = new cgxp.MapPanel({
                renderTo: document.body,
                width: 1,
                height: 1,
                map: map,
                stateId: "map",
            });
            mp.applyState({
                tooltip: 'truite fumée',
                crosshair: 1,
                x: 13,
                y: 42,
                zoom: 4
            });
            popupOK = mp.body.child("div.gx-popup") !== undefined;

            it("The popup is displayed in the page", function() {
                expect(popupOK).toBeTruthy();
            });

        });
    });
});
