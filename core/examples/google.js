var app;
Ext.onReady(function() {
    GeoExt.Lang.set("en");

    app = new gxp.Viewer({
        portalConfig: {
            layout: "border",
            items: [{
                region: "north",
                html: "This example shoes how to integrate <b>Google plugins</b> (StreetView and GoogleEarth) in GXP Viewer.<br/>" +
                    "One can load a <b>KML</b> for the <b>Bathymetry</b> layer (hover the node in the tree and click on the globe icon). This should show markers on the 2D map as well as on the 3D plugin (which should open automatically)."
            }, {
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
                wmsURL: 'http://www2.dmsolutions.ca/cgi-bin/mswms_gmap',
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
            center: [-80, 44],
            zoom: 8,
            layers: [new OpenLayers.Layer('fake', {isBaseLayer: true})]
        }
    });
});
