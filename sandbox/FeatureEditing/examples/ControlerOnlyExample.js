var controler, mapPanel;

Ext.onReady(function() {

    Ext.QuickTips.init();

    mapPanel = new GeoExt.MapPanel({
        region: "center",
        layers: [new OpenLayers.Layer.WMS("Global Imagery",
            "http://labs.metacarta.com/wms/vmap0",
            {layers: "basic"})] ,
        center: [16,48],
        zoom: 5
    });

    controler = new GeoExt.ux.FeatureEditingControler({
        'cosmetic': true,
        map: mapPanel.map,
        styler: 'combobox',
        popupOptions: {anchored: false, unpinnable: false, draggable: true}
    });

    new Ext.Panel({
        renderTo: "content",
        layout: "border",
        width: 650,
        height: 350,
        tbar: new Ext.Toolbar(controler.actions),
        items: [mapPanel]
    });
});
