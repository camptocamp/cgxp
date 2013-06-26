var app;

Ext.onReady(function() {
    GeoExt.Lang.set("fr");

    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 650,
            height: 400,
            items: ["mymap"]
        },
        tools: [{
            ptype: "cgxp_menushortcut",
            type: "->"
        },{
            ptype: "cgxp_redlining",
            stateId: 'red',
            toggleGroup: 'maptools'
        },{
            ptype: "cgxp_permalink"
        }],
        sources: {
            osm: {
                ptype: "gxp_osmsource"
            }
        },
        map: {
            id: "mymap",
            projection: "EPSG:900913",
            units: "m",
            maxResolution: 156543.0339,
            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
            center: [0, 0],
            zoom: 2,
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});
