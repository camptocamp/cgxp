describe('plugins.WFSGetFeature', function() {
    describe('when requesting features', function() {
        var control, request;

        beforeEach(function() {
            var observable = new Ext.util.Observable();

            var plugin = new cgxp.plugins.WFSGetFeature({
                WFSURL: 'wfs_url',
                WFSTypes: ['layer11', 'layer42', 'layer21', 'layer3'],
                externalWFSTypes: ['layer41', 'layer12', 'layer51', 'layer6'],
                events: observable
            });

            var baseLayer = new OpenLayers.Layer('', {isBaseLayer: true});

            var layer1 = new OpenLayers.Layer.WMS(
                'olayer1', 'wms',
                {layers: 'group1,group2,layer3,group7'},
                {singleTile: true, isBaseLayer: false}
            );

            var layer2 = new OpenLayers.Layer.WMS(
                'ollayer2', 'wms',
                {layers: 'group4,group5,layer6,group8'},
                {singleTile: true, isBaseLayer: false}
            );

            var map = new OpenLayers.Map({
                layers: [baseLayer, layer1, layer2],
                projection: 'EPSG:900913'
            });

            var recordType = GeoExt.data.LayerRecord.create([
                {name: 'disclaimer'},
                {name: 'childLayers'}
            ]);

            var layerStore = new GeoExt.data.LayerStore();
            layerStore.add(
                new recordType({
                    layer: layer1,
                    childLayers: {
                        'group1': [{
                            name: 'layer11'
                        }, {
                            name: 'layer12'
                        }],
                        'group2': [{
                            name: 'layer21'
                        }, {
                            name: 'layer22'
                        }]
                    }
                }, layer1.id)
            );
            layerStore.add(
                new recordType({
                    layer: layer2,
                    childLayers: {
                        'group4': [{
                            name: 'layer41'
                        }, {
                            name: 'layer42'
                        }],
                        'group5': [{
                            name: 'layer51'
                        }, {
                            name: 'layer52'
                        }]
                    }
                }, layer2.id)
            );

            plugin.target = {
                mapPanel: {
                    map: map,
                    layers: layerStore
                }
            };

            request = OpenLayers.Control.GetFeature.prototype.request;
            OpenLayers.Control.GetFeature.prototype.request = function() {
            };

            control = plugin.createControl();
            map.addControl(control);
        });

        afterEach(function() {
            OpenLayers.Control.GetFeature.prototype.request = request;
        });

        it('uses expected feature types in the requests', function() {
            control.request();
            expect(control.internalProtocol.format.featureType).toEqual(
                ['layer11', 'layer21', 'layer3', 'layer42']);
            expect(control.externalProtocol.format.featureType).toEqual(
                ['layer12', 'layer41', 'layer51', 'layer6']);
        });
    });
});
