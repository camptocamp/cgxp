var app;

Ext.onReady(function() {
    GeoExt.Lang.set("en");
    
    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            title: "Profile in a window",
            layout: "border",
            width: 650,
            height: 400,
            items: ["mymap"]
        },
        tools: [{
            ptype: "cgxp_profile",
            buttonText: "Draw a profile",
            serviceUrl: "profile.json",
            valuesProperty: "alts",
            outputConfig: {
                width: 800,
                height: 380
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
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });

    var app2 = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            title: "Profile in a panel below the map",
            layout: "border",
            width: 650,
            height: 400,
            items: [{
                xtype: "panel",
                layout: "border",
                region: "center",
                items: [
                    "mymap2", {
                        xtype: "panel",
                        id: "south",
                        hidden: true,
                        region: "south",
                        layout: 'fit',
                        height: 150
                    }
                ]
            }]
        },
        tools: [{
            ptype: "cgxp_profile",
            buttonText: "Draw a profile",
            serviceUrl: "profile.json",
            valuesProperty: "alts",
            outputTarget: "south"
        }],
        sources: {
            osm: {
                ptype: "gxp_osmsource"
            }
        },
        map: {
            id: "mymap2",
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

