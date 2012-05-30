var mapPanel, map, permalinkProvider;

Ext.onReady(function() {

    // set a permalink provider
    permalinkProvider = new GeoExt.state.PermalinkProvider({encodeType: false});
    Ext.state.Manager.setProvider(permalinkProvider);

    map = new OpenLayers.Map();
    map.addLayers([
        new OpenLayers.Layer.WMS(
            "Imagery",
            "http://maps.opengeo.org/geowebcache/service/wms",
            {layers: "bluemarble"}
        )
    ]);

    mapPanel = new cgxp.MapPanel({
        renderTo: document.body,
        width: 512,
        height: 256,
        center: new OpenLayers.LonLat(12, 41),
        zoom: 3,
        map: map,
        stateId: "map"
    });

});
