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
                    "isExpanded": true,
                    "children": [{
                        "name": "layer11",
                        "legendRule": "rule1",
                        "isChecked": true
                    }, {
                        "name": "layer12",
                        "legend": true
                    }]
                }, {
                    "name": "layer2",
                    "expanded": false,
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
                defaultThemes: ['theme1'],
                updateLegendDelay: 1000
            });
        });

        it('adds layers to the map', function() {
            layerTree.loadDefaultThemes();
            expect(mapPanel.map.layers.length).toEqual(3); // layer1, layer2
                                                           // and fake baser
                                                           // layer
        });

// click() don't works with phantomjs
/*        it('defers legends creation', function() {
            var requestUpdateLegendsSpy = spyOn(
                layerTree, 'requestUpdateLegends').andCallThrough();
            var updateLegendsSpy = spyOn(
                layerTree, 'updateLegends').andCallThrough();
            var updateNodeLegendsSpy = spyOn(
                layerTree, 'updateNodeLegends').andCallThrough();
            var countLegendGraphics = function() {
                var images = Ext.select('img', layerTree.getRootNode());
                var count = 0;
                images.each(function(image) {
                    if (image.dom.src.indexOf('GetLegendGraphic') != -1) {
                        count++;
                    }
                });
                return count;
            };

            layerTree.loadDefaultThemes();
            expect(requestUpdateLegendsSpy.calls.length).toEqual(2);
            expect(updateLegendsSpy).not.toHaveBeenCalled();
            expect(countLegendGraphics()).toEqual(0); // no request done yet

            clock.tick(1000);
            expect(updateLegendsSpy.calls.length).toEqual(1);
            expect(updateNodeLegendsSpy.calls.length).toEqual(2); // layer1, layer2
            expect(countLegendGraphics()).toEqual(1); // layer1 icon

            // now we simulate a click on a legend action
            var node = layerTree.root.findChild("text", "layer2");
            Ext.select('.legend', node.ui.getEl()).first().dom.click();
            legendGraphics = 0;
            expect(countLegendGraphics()).toEqual(2); // layer1 icon + layer2 legend
        });*/
    });

    describe('zoom the map', function() {
        beforeEach(function() {
            layerTree = new cgxp.tree.LayerTree({
                renderTo: document.body,
                mapPanel: mapPanel,
                themes: themes,
                wmsURL: 'http://fake.wms',
                defaultThemes: ['theme1'],
                updateLegendDelay: 1000
            });
            layerTree.loadDefaultThemes();

            // trigger addLegends
            clock.tick(1000);
        });

        it('defers legends update', function() {
            var requestUpdateLegendsSpy = spyOn(
                layerTree, 'requestUpdateLegends').andCallThrough();
            var updateLegendsSpy = spyOn(layerTree, 'updateLegends');

            mapPanel.map.zoomIn();
            expect(requestUpdateLegendsSpy.calls.length).toEqual(1);
            expect(updateLegendsSpy).not.toHaveBeenCalled();

            clock.tick(1000);
            expect(updateLegendsSpy.calls.length).toEqual(1);
        });
    });
});
