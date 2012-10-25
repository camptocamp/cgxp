var app;

Ext.onReady(function() {
    GeoExt.Lang.set("en");

    OpenLayers.Util.extend(OpenLayers.Lang.en, {
        "Theme 1": "Theme 1 (translated)"
    });
    
    var app = new gxp.Viewer({
        portalConfig: {
            renderTo: document.body,
            layout: "border",
            width: 650,
            height: 400,
            items: ["mymap", {
                id: "layerpanel",
                region: 'west',
                split: true,
                width: 250
            }]
        },
        tools: [{
            ptype: "cgxp_themeselector",
            outputTarget: "layerpanel",
            layerTreeId: "layertree",
            themes: App.themes,
            outputConfig: {
                layout: "fit",
                style: "padding: 3px 0 3px 3px;"
            }
        },{
            ptype: 'cgxp_layertree',
            id: "layertree",
            outputTarget: "layerpanel",
            outputConfig: {
                wmsURL: 'http://www2.dmsolutions.ca/cgi-bin/mswms_gmap',
                themes: App.themes,
                defaultThemes: App.default_themes
            }
        }],
        map: {
            id: "mymap",
            center: [-78, 47],
            zoom: 6
        }
    });
});
