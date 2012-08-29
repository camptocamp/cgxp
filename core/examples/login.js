Ext.onReady(function() {
    GeoExt.Lang.set("en");

    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            width: 650,
            height: 400,
            items: "mymap"
        },
        tools: [{
            ptype: "cgxp_login",
            toggleGroup: "maptools",
            loginURL: "login",
            logoutURL: "logout",
            extraHtml: "Hey, want a <b>login</b>? You can <a href='some_url'>register here</a>.<br />How cool is that?"
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
            center: [659704.09163989,5711205.1705888],
            zoom: 15,
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});
