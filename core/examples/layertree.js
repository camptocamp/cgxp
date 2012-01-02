var mapPanel, map, tree;
Ext.onReady(function() {
    Ext.QuickTips.init();

    map = new OpenLayers.Map('olmap');
    map.addLayers([
        new OpenLayers.Layer('fake', {isBaseLayer: true})
    ]); 
    mapPanel = new GeoExt.MapPanel({
        renderTo: 'olmap',
        map: map
    });

    map.zoomToExtent(new OpenLayers.Bounds(-155.146484,33.134766,-65.146484,78.134766));

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
