describe('cgxp.tree.LayerTree', function() {
    var clock, mapPanel, themes, layerTree;

    afterEach(function() {
        clock.restore();
        if (layerTree) {
            layerTree.destroy();
        }
        if (mapPanel) {
            mapPanel.destroy();
        }
    });

    beforeEach(function() {
        clock = sinon.useFakeTimers();
        var map = new OpenLayers.Map({
            layers: [
                new OpenLayers.Layer('', {isBaseLayer: true})
            ]
        });
        mapPanel = new cgxp.MapPanel({
            renderTo: document.body,
            width: 1,
            height: 1,
            center: new OpenLayers.LonLat(12, 41),
            zoom: 3,
            map: map
        });

        themes = {
            "local": [{
                "name": "theme1",
                "children": [{
                    "name": "layer1",
                    "children": [{
                        "name": "layer11",
                        "isChecked": true
                    }, {
                        "name": "layer12"
                    }]
                }, {
                    "name": "layer2",
                    "children": [{
                        "name": "layer21"
                    }, {
                        "name": "layer22",
                        "isChecked": true
                    }]
                }]
            }]
        };
    });

    describe('create a layer tree', function() {
        it('creates a layer tree', function() {
            layerTree = new cgxp.tree.LayerTree({
                renderTo: document.body,
                mapPanel: mapPanel,
                themes: themes,
                wmsURL: 'http://fake.wms',
                defaultThemes: ['theme1']
            });
            expect(layerTree).toBeInstanceOf(cgxp.tree.LayerTree);
        });
    });

    describe('load default themes', function() {
        beforeEach(function() {
            layerTree = new cgxp.tree.LayerTree({
                renderTo: document.body,
                mapPanel: mapPanel,
                themes: themes,
                wmsURL: 'http://fake.wms',
                defaultThemes: ['theme1']
            });
        });

        it('adds layers to the map', function() {
            layerTree.loadDefaultThemes();
            expect(mapPanel.map.layers.length).toEqual(3); // layer1, layer2
                                                           // and fake baser
                                                           // layer
        });

        it('defers legends creation', function() {
            var requestAddLegendsSpy = spyOn(
                layerTree, 'requestAddLegends').andCallThrough();
            var addLegendsSpy = spyOn(layerTree, 'addLegends');

            layerTree.loadDefaultThemes();
            expect(requestAddLegendsSpy.calls.length).toEqual(2);
            expect(addLegendsSpy).not.toHaveBeenCalled();

            clock.tick(2000);
            expect(addLegendsSpy.calls.length).toEqual(1);
        });
    });

    describe('zoom the map', function() {
        beforeEach(function() {
            layerTree = new cgxp.tree.LayerTree({
                renderTo: document.body,
                mapPanel: mapPanel,
                themes: themes,
                wmsURL: 'http://fake.wms',
                defaultThemes: ['theme1']
            });
            layerTree.loadDefaultThemes();

            // trigger addLegends
            clock.tick(2000);
        });

        it('defers legends update', function() {
            var requestUpdateLegendsSpy = spyOn(
                layerTree, 'requestUpdateLegends').andCallThrough();
            var updateLegendsSpy = spyOn(layerTree, 'updateLegends');

            mapPanel.map.zoomIn();
            expect(requestUpdateLegendsSpy.calls.length).toEqual(1);
            expect(updateLegendsSpy).not.toHaveBeenCalled();

            clock.tick(2000);
            expect(updateLegendsSpy.calls.length).toEqual(1);
        });
    });
});
