var mapPanel, map, tree;
Ext.onReady(function() {
    Ext.QuickTips.init();

    map = new OpenLayers.Map();
    map.addLayers([
        new OpenLayers.Layer('fake', {isBaseLayer: true})
    ]); 
    mapPanel = new GeoExt.MapPanel({
        renderTo: document.body,
        width: 512,
        height: 256,
        map: map
    });

    map.setCenter(new OpenLayers.LonLat(-78, 47), 6);

    tree = new cgxp.tree.LayerTree({
        id: "layertree",
        width: 250,
        height: 200,
        autoScroll: true,
        wmsURL: 'http://www2.dmsolutions.ca/cgi-bin/mswms_gmap',
        mapPanel: mapPanel,
        themes: App.themes,
        defaultThemes: App.default_themes
    });
    tree.render('tree');

    tree.loadDefaultThemes();
});
