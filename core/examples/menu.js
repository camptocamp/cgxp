var app;

Ext.onReady(function() {
    GeoExt.Lang.set("en");

    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 650,
            height: 400,
            items: ["mymap"]
        },
        tools: [{
            ptype: "cgxp_menu",
            id: 'myMenu',
            toggleGroup: 'maptools',
            actionTarget: 'mymap.tbar',
            splitButton: true,
            defaultActiveItem: 0,
            actionConfig: {
                ptype: 'button',
                iconCls:'user'
            }
        }, {
            ptype: "cgxp_profile",
            toggleGroup: 'maptools',
            actionTarget: "myMenu",
            serviceUrl: "profile.json",
            rasterLayers: ["MNT", "MNS"],
            valuesProperty: "alts"
        }, {
            ptype: "cgxp_profile",
            toggleGroup: 'maptools',
            actionTarget: "myMenu",
            serviceUrl: "profile.json",
            rasterLayers: ["MNT"],
            valuesProperty: "alts",
            outputConfig: {
                width: 250,
                height: 120
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
});
