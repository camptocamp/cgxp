var mapPanel;

var streetViewPanel;

var viewport;

var osm;

Ext.onReady(function() {

    var options;
    var extent = new OpenLayers.Bounds(736500, 5861500, 740700, 5862500);

    options = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        units: "m",
        numZoomLevels: 18,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                20037508, 20037508.34)
    };

    osm = new OpenLayers.Layer.OSM();

    var map = new OpenLayers.Map(options);

    map.addLayer(osm);

    var mouse = new OpenLayers.Control.MousePosition();

    map.addControl(mouse);
    mouse.activate();

    var toolbar = new Ext.Toolbar({
        items: [
            {
                xtype: 'tbfill'
            },
            {
                text: 'Street View',
                enableToggle: true,
                pressed: true,
                handler: function() {
                    if (this.pressed) {
                        streetViewPanel.add(streetViewPanelItem);
                        streetViewPanel.setSize('50%', 0);
                        streetViewPanel.setVisible(true);
                        streetViewPanel.doLayout();
                        viewport.doLayout();
                    } else {
                        streetViewPanel.remove('streetViewPanelItem');
                        streetViewPanel.setWidth(0);
                        streetViewPanel.setVisible(false);
                        streetViewPanel.doLayout();
                        viewport.doLayout();
                    }
                }
            },
            {
                text: 'Permalink',
                enableToggle: false,
                handler: function() {
                    var streetViewPanelItem = Ext.getCmp("streetViewPanelItem");
                    if (streetViewPanelItem) {
                        window.open(streetViewPanelItem.panorama.getPermalink(true));
                    }

                }
            }
        ]});

    var positionPano = new OpenLayers.LonLat(739019.93169167, 5861792.5629019);
    positionPano.transform(map.projection, new OpenLayers.Projection("EPSG:4326"));
    var featurePosition = new google.maps.LatLng(positionPano.lat, positionPano.lon);

    var streetViewPanelItem = {
        xtype: 'gxux_streetviewpanel',
        id: 'streetViewPanelItem',
        map: map,
        videoMode: true,
        showLinks: true,
        showTool: true,
        panoramaLocation: featurePosition
    };

    viewport = new Ext.Viewport({
        layout: "border",
        id: 'mainViewport',
        items: [
            {
                region: "center",
                id: "mappanel",
                title: "Google Map",
                xtype: "gx_mappanel",
                map: map,
                extent: extent,
                split: true,
                tbar: toolbar
            },
            {
                region: "east",
                layout: 'fit',
                width: '50%',
                id: "streetviewpanel",
                title: 'Street View Panel',
                closeAction: 'hide',
                split: true
            },
            {
                region: "south",
                layout: 'fit',
                id: "readme",
                title: 'README',
                margins: {left: 5,top: 5, bottom: 5, right: 5},
                html: '<p style="font-size:12pt;color:#15428B;font-weight:bold;margin:5">Click somewehere in the map to see a panorama.<br>If you click on one arrow, the video show will start and you will move every 2 seconds to a new position. You can stop the video show by clicking on an arrow.</p>'
            }
        ]
    });

    mapPanel = Ext.getCmp("mappanel");
    streetViewPanel = Ext.getCmp("streetviewpanel");
    streetViewPanel.add(streetViewPanelItem);
    streetViewPanel.doLayout();
    viewport.doLayout();
});
