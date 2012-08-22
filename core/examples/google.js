var app;
Ext.onReady(function() {
    GeoExt.Lang.set("en");

    app = new gxp.Viewer({
        portalConfig: {
            layout: "border",
            items: [{
                id: "center",
                region: "center",
                layout: "border",
                items: "mymap"
            }, {
                id: "east",
                region: "east",
                width: 250
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
        }, {
            ptype: "cgxp_layertree",
            outputTarget: "east",
            outputConfig: {
                autoScroll: true,
                wmsURL: 'http://www2.demis.nl/wms/wms.asp?wms=WorldMap',
                themes: App.themes,
                defaultThemes: App.default_themes
            }
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
            center: [-160300.06674231394,5311971.846945471],
            zoom: 8,
            layers: [{
                source: "osm",
                name: "mapnik"
            }]
        }
    });
});
