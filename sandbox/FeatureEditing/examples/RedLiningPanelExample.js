var redLiningPanel, mapPanel;

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

    redLiningPanel = new GeoExt.ux.form.RedLiningPanel({
        title: OpenLayers.i18n("RedLining Panel"),
        region: "east",
        width: 300,
        //downloadService: 'http://localhost:5000/filemanager/download',
        map: mapPanel.map,
        popupOptions: {anchored: false, unpinnable: false, draggable: true}
    });

    new Ext.Panel({
        renderTo: "content",
        layout: "border",
        width: 650,
        height: 350,
        items: [mapPanel, redLiningPanel]
    });
});
