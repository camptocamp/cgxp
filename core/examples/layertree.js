var mapPanel, map, tree;
Ext.onReady(function() {
    Ext.QuickTips.init();

    map = new OpenLayers.Map({
        projection: 'EPSG:21781',
        resolutions: [4000.0,3750.0,3500.0,3250.0,3000.0,2750.0,2500.0,2250.0,2000.0,1750.0,1500.0,1250.0,1000.0,750.0,650.0,500.0,250.0,100.0,50.0,20.0,10.0,5.0,2.5,2.0,1.5,1.0,0.5,0.25,0.1,0.05],
        maxExtent: [420000, 30000, 900000, 350000]
    });
    map.addLayers([
        new OpenLayers.Layer('fake', {isBaseLayer: true})
    ]);
    mapPanel = new GeoExt.MapPanel({
        renderTo: document.body,
        width: 512,
        height: 256,
        map: map
    });

    map.setCenter(new OpenLayers.LonLat(566925, 102495), 20);

    tree = new cgxp.tree.LayerTree({
        id: "layertree",
        width: 250,
        height: 200,
        autoScroll: true,
        wmsURL: 'http://geomapfish.demo-camptocamp.com/1.6/wsgi/mapserv_proxy?',
        mapPanel: mapPanel,
        themes: App.themes,
        defaultThemes: App.default_themes
    });
    tree.render('tree');

    tree.loadDefaultThemes();
});
