var app;

Ext.onReady(function() {
    GeoExt.Lang.set("en");
    
    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 1024,
            height: 800,
            items: ["mymap", {
                id: "left-panel",
                region: 'west',
                layout: "accordion",
                split: true,
                width: 250,
                items: [{
                    title: "A panel"
                }]
            }]
        },
        tools: [{
            ptype: "cgxp_menushortcut",
            actionTarget: "map.tbar",
            type: '->'
        },{
            ptype: 'cgxp_print',
            printURL: "./",
            outputTarget: "left-panel",
            options: {
                labelAlign: 'top',
                defaults: {
                    anchor: '100%'
                },
                autoFit: true
            }
        },{
            ptype: 'cgxp_print',
            printURL: "./",
            actionTarget: "map.tbar",
            options: {
                labelAlign: 'top',
                defaults: {
                    anchor: '100%'
                },
                autoFit: true
            }
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
            tbar: [],
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});
