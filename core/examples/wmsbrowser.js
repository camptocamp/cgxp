var app;

Ext.onReady(function() {
    GeoExt.Lang.set("fr");
    
    app = new gxp.Viewer({
        proxy: "/cgi-bin/proxy.cgi?url=",
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 1024,
            height: 768,
            items: ["mymap", {
                id: "east",
                xtype: "panel",
                layout: "fit",
                region: "east",
                width: 300
            }, {
                layout: "accordion",
                region: "west",
                width: 300,
                minWidth: 300,
                split: true,
                collapseMode: "mini",
                border: false,
                defaults: {width: 300},
                items: [{
                    xtype: "panel",
                    title: "layertree",
                    id: 'west',
                    layout: "vbox",
                    layoutConfig: {
                        align: "stretch"
                    }
                }]
            }]
        },
        tools: [{
            ptype: "cgxp_wmsbrowser",
            layerTreeId: "layertree"
        }, {
            ptype: "gxp_layermanager",
            outputTarget: "east"
        }, {
            ptype: "cgxp_layertree",
            id: "layertree",
            outputConfig: {
                header: false,
                flex: 1,
                layout: "fit",
                autoScroll: true
            },
            outputTarget: "west"
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