describe('plugins.FeaturesWindow', function() {
    var fw;
    describe('when calling constructor', function() {
        beforeEach(function() {
            fw = new cgxp.plugins.FeaturesWindow();
        });
        it('creates a gxp tool', function() {
            expect(fw).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a features window', function() {
            expect(fw).toBeInstanceOf(cgxp.plugins.FeaturesWindow);
        });
    });
    describe('when calling viewerReady', function() {
        beforeEach(function() {
            fw = new cgxp.plugins.FeaturesWindow({
                events: {
                    addEvents: function() {},
                    on: function() {}
                }
            });
            // some mocking
            fw.target = {
                mapPanel: {
                    map: new OpenLayers.Map()
                }
            };
            fw.viewerReady();
        });
        it('creates a vector layer', function() {
            expect(fw.vectorLayer).toBeInstanceOf(OpenLayers.Layer.Vector);
        });
    });
    describe('when results are received', function() {
        var events = new Ext.util.Observable();
        events.addEvents({
            'queryresults': true
        });
        var mapPanel;
        beforeEach(function() {
            fw = new cgxp.plugins.FeaturesWindow({
                events: events
            });
            // some mocking
            mapPanel = new Ext.Panel({
                map: new OpenLayers.Map()
            });
            mapPanel.render(document.body);
            fw.target = {
                mapPanel: mapPanel
            };
            fw.layers = {
                'dude': 'truite'
            };
            fw.viewerReady();
        });
        afterEach(function() {
            fw.featuresWindow.destroy();
            mapPanel.destroy();
        });
        it('creates a window', function() {
            var features = [new OpenLayers.Feature.Vector(null, {
                foo: 'bar'
            })];
            features[0].type = 'dude';
            events.fireEvent('queryresults', features);
            expect(fw.featuresWindow).toBeInstanceOf(Ext.Window);
        });
    });
    describe('when closing the window', function() {
        beforeEach(function() {
            fw = new cgxp.plugins.FeaturesWindow({});
            fw.layers = {};
            fw.target = {
                mapPanel: {
                    body: document.body
                }
            };
            fw.showWindow([
                new OpenLayers.Feature.Vector(null, {})
            ]);
            fw.featuresWindow.close();
        });
        afterEach(function() {
            fw.featuresWindow.destroy();
        });
        it('empties the feature store', function() {
            expect(fw.store.getCount()).toEqual(0);
        });
    });
});
