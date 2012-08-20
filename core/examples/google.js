Ext.onReady(function() {
    GeoExt.Lang.set("en");

    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 650,
            height: 400,
            items: [{
                id: "center",
                region: "center",
                layout: "border",
                items: "mymap"
            }]
        },
        tools: [{
            ptype: "cgxp_streetview",
            outputTarget: 'center',
            toggleGroup: 'maptools',
            baseURL: "../../geoext.ux/ux/StreetViewPanel/"
        }, {
            ptype: "cgxp_googleearthview",
            outputTarget: 'center',
            toggleGroup: 'maptools'
        }],
        sources: {
            osm: {
                ptype: "gxp_osmsource"
            }
        },
        map: {
            id: "mymap",
            //region: "center",
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
