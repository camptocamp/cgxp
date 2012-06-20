var app;

Ext.onReady(function() {
    GeoExt.Lang.set("fr");
    
    app = new gxp.Viewer({
        sources: {
            osm: {
                ptype: "gxp_osmsource"
            }
        },
        tools: [{
            ptype: "cgxp_wmsbrowser"
        }],
        map: {
            center: [0, 0],
            zoom: 2,
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});