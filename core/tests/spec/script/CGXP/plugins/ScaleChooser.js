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
            map = new OpenLayers.Map({
                zoomMethod: null
            });
            var layer = new OpenLayers.Layer('', {
                isBaseLayer: true,
                // the layer actually gets scales
                // [99999,  49999, 24999] because
                // of rounding errors when scales
                // are converted to resolutions
                // and back to scales
                scales: [100000, 50000, 25000]
            });
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
        it('creates a combo with expected number of values', function() {
            expect(combo).toBeInstanceOf(Ext.form.ComboBox);
            expect(combo.getStore().getCount()).toEqual(3);
        });
        it('displays current scale', function() {
            map.zoomIn();
            expect(combo.getValue()).toEqual("1 : 49999");
        });
    });
    describe('when selecting a value in the combo', function() {
        var map, combo;
        beforeEach(function() {
            map = new OpenLayers.Map({
                zoomMethod: null
            });
            var layer = new OpenLayers.Layer('', {
                isBaseLayer: true,
                // the layer actually gets scales
                // [99999,  49999, 24999] because
                // of rounding errors when scales
                // are converted to resolutions
                // and back to scales
                scales: [100000, 50000, 25000]
            });
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
            // calling combo.setValue won't trigger a "select" event,
            // so we trigger a "select" event ourselves
            combo.fireEvent('select', combo,
                            // record 0 in the store is zoom level 2
                            combo.getStore().getAt(0), 0);
        });
        it('zooms map to expected level', function() {
            expect(map.getZoom()).toEqual(2);
        });
    });
    describe('round', function() {
        beforeEach(function() {
            s = new cgxp.plugins.ScaleChooser();
        });
        it('standard', function() {
            expect(s.round(1)).toBe(1);
            expect(s.round(3)).toBe(3);
            expect(s.round(70)).toBe(70);
            expect(s.round(71)).toBe(71);
            expect(s.round(99)).toBe(99);
        });
        it('roundValues', function() {
            s.roundValues = [1, 2, 5, 10, 20];
            expect(s.round(1)).toBe(1);
            expect(s.round(3)).toBe(2);
            expect(s.round(70)).toBe(20);
            expect(s.round(71)).toBe(20);
            expect(s.round(99)).toBe(20);
        });
        it('roundValues and power10', function() {
            s.roundValues = [1, 2.5, 5, 10];
            s.power10 = true;
            expect(s.round(1)).toBe(1);
            expect(s.round(3)).toBe(2.5);
            expect(s.round(70)).toBe(50);
            expect(s.round(71)).toBe(100);
            expect(s.round(99)).toBe(100);
        });
    });
});
