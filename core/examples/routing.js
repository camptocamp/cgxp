var app;

Ext.onReady(function() {
    GeoExt.Lang.set("en");

    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            // width: 900,
            height: 600,
            items: ["mymap", {
                id: "left-panel",
                region: 'west',
                layout: "accordion",
                split: true,
                width: 400,
                items: []
            }]
        },
        tools: [{
            ptype: "cgxp_menushortcut",
            actionTarget: "map.tbar",
            type: '->'
        },{
            ptype: 'cgxp_routing',
            routingService: {
              ENGINE_0: {
                type: 'OSRM',
                url: "http://router.project-osrm.org/",
                dynamic: true
              }
            },
            searchOptions: {
              url: "http://mapfish-geoportal.demo-camptocamp.com/demo/wsgi/fulltextsearch",
              widgetOptions: {
                grouping: true,
                comboWidth: 150,
                emptyText: 'Search a place (grouped results)',
                limits: {
                    limit: 100,
                    partitionlimit: 5
                },
              }
            },
            outputTarget: "left-panel",
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
            // somewhere in Switzerland, a map awaits ...
            center: [765107, 5944873],
            zoom: 12,
            tbar: [],
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});
