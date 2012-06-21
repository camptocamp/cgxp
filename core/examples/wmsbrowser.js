var app;

Ext.onReady(function() {
    GeoExt.Lang.set("fr");
    
    app = new gxp.Viewer({
        proxy: "/cgi-bin/proxy.cgi?url=",
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 650,
            height: 465,
            items: ["mymap", {
                id: "east",
                xtype: "panel",
                layout: "fit",
                region: "east",
                width: 200
            }]
        },
        tools: [{
            ptype: "cgxp_wmsbrowser"
        }, {
            ptype: "gxp_layermanager",
            outputTarget: "east"
        }],
        sources: {
            osm: {
                ptype: "gxp_osmsource"
            }
        },
        map: {
            id: "mymap",
            center: [0, 0],
            zoom: 2,
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});