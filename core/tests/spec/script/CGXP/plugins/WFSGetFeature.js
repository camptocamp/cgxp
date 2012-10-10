describe('plugins.WFSGetFeature', function() {
    var themes = {
        "local": [{
            "children": [{
                "isExpanded": true,
                "isInternalWMS": true,
                "isBaseLayer": false,
                "name": "foo",
                "children": [{
                    "name": "group1",
                    "childLayers": [{
                        "name": "layer11"
                    }, {
                        "name": "layer12"
                    }, {
                        "name": "layer13_outOfRange",
                        "maxResolutionHint": 4
                    }]
                }, {
                    "name": "group2",
                    "childLayers": [{
                        "name": "layer21"
                    }, {
                        "name": "layer22"
                    }]
                }, {
                    "name": "layer3"
                }, {
                    "name": "outOfRange",
                    "minResolutionHint": 6
                }]
            }],
            "name": "Theme 1"
        }],
        "external": [{
            "children": [{
                "isExpanded": false,
                "isInternalWMS": true,
                "name": "Theme ext 1 - Group a",
                "isBaseLayer": false,
                "children": [{
                    "name": "group4",
                    "childLayers": [{
                        "name": "layer41"
                    }, {
                        "name": "layer42"
                    }]
                }, {
                    "name": "layer6"
                }, {
                    "name": "group5",
                    "childLayers": [{
                        "name": "layer51"
                    }, {
                        "name": "layer52"
                    }]
                }]
            }],
            "name": "Theme external 1"
        }]
    };
    describe('when requesting features', function() {
        var control, request, numRequests, featureTypes;

        beforeEach(function() {
            numRequests = 0;
            featureTypes = [];
            var observable = new Ext.util.Observable();

            var plugin = new cgxp.plugins.WFSGetFeature({
                WFSURL: 'wfs_url',
                WFSTypes: ['layer11', 'layer13_outOfRange', 'layer42', 'layer21', 'layer3', 'outOfRange'],
                externalWFSTypes: ['layer41', 'layer12', 'layer51', 'layer6'],
                themes: themes,
                events: observable
            });

            var baseLayer = new OpenLayers.Layer('', {isBaseLayer: true});

            var layer1 = new OpenLayers.Layer.WMS(
                'olayer1', 'wms',
                {layers: 'group1,group2,layer3,group7,outOfRange'},
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
            map.getResolution = function() {
                return 5;
            };

            var recordType = GeoExt.data.LayerRecord.create([
                {name: 'disclaimer'}
            ]);

            var layerStore = new GeoExt.data.LayerStore();
            layerStore.add(
                new recordType({
                    layer: layer1
                }, layer1.id)
            );
            layerStore.add(
                new recordType({
                    layer: layer2
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
                numRequests++;
                featureTypes.push(this.protocol.format.featureType);
            };

            control = plugin.createControl();
            map.addControl(control);
        });

        afterEach(function() {
            OpenLayers.Control.GetFeature.prototype.request = request;
        });

        it('uses expected feature types in the requests', function() {
            control.request();
            expect(featureTypes).toEqual(
                [
                    ['layer11', 'layer21', 'layer3', 'layer42'],
                    ['layer12', 'layer41', 'layer51', 'layer6']
                ]
            );
        });
        it('requests the server twice', function() {
            control.request();
            expect(numRequests).toEqual(2);
        });
    });
});
