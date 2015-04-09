var mapPanel;

var treePanel;

var viewport;

var layer;

Ext.onReady(function() {
    Ext.BLANK_IMAGE_URL = '../../../trunk/ext/resources/images/default/s.gif';
    OpenLayers.ImgPath = '../../../trunk/openlayers/img/';

    var bluemarble = new OpenLayers.Layer.WMS(
            "Bluemarble",
            "http://sigma.openplans.org/geoserver/wms?",
    {layers: 'bluemarble'},
    {singleTile: true}
            );

    var map = new OpenLayers.Map();

    var center = new OpenLayers.LonLat(4.6, 46.9);

    var mouse = new OpenLayers.Control.MousePosition();

    map.addControl(mouse);
    mouse.activate();

    var toolbar = [];

    toolbar.push({
        text: 'Layer Manager',
        enableToggle: false,
        handler: function() {
            var layerManagerWindow = new GeoExt.ux.LayerManagerWindow({
                map: map
                //,downloadService: 'http://localhost:5000/filemanager/download'
            });
            layerManagerWindow.show();
        }
    });


    var sundials = new OpenLayers.Layer.Vector("KML", {
        projection: map.displayProjection,
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: "placemark_floating.kml",
            format: new OpenLayers.Format.KML({
                extractStyles: true,
                extractAttributes: true,
                kmlns: "http://www.opengis.net/kml/2.2"
            })
        })
    });

    toolbar.push({
        text: 'Export KML',
        enableToggle: false,
        handler: function() {
            //GeoExt.ux.data.Export.KMLExport(map, [sundials], null, 'http://localhost:5000/filemanager/download');
            GeoExt.ux.data.Export.KMLExport(map, [sundials], null, null);
        }
    });

    toolbar.push({
        text: 'Import KML',
        enableToggle: false,
        handler: function() {
            GeoExt.ux.data.Import.KMLImport(map, sundials);
        }
    });

    var mapStore = new GeoExt.data.LayerStore({
        map: map,
        layers: [bluemarble,sundials]
    });

    var treeItem = new Ext.tree.TreePanel({
        border: false,
        root: new GeoExt.tree.LayerContainer({
            text: 'Map Layers',
            layerStore: mapStore,
            leaf: false,
            expanded: true
        }),
        enableDD: true
    });

    viewport = new Ext.Viewport({
        layout: "border",
        id: 'mainViewport',
        items: [
            {
                region: "center",
                id: "mappanel",
                title: "2D Map",
                xtype: "gx_mappanel",
                map: map,
                layers: mapStore,
                center: center,
                zoom: 3,
                split: true,
                tbar: toolbar
            },
            {
                region: "west",
                id: "treepanel",
                title: "Layer Tree",
                width: 200
            },
            {
                region: "south",
                layout: 'fit',
                id: "readme",
                title: 'README',
                margins: {left: 5,top: 5, bottom: 5, right: 5},
                html: '<p style="font-size:12pt;color:#15428B;font-weight:bold;margin:5">Layer Manager Example</p>'
            }
        ]
    });
    treePanel = Ext.getCmp("treepanel");
    treePanel.add(treeItem);
    treePanel.doLayout();
    viewport.doLayout();
});