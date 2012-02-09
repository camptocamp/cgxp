var mapPanel, map, attributePopup, editorGrid;
Ext.onReady(function() {
    Ext.QuickTips.init();
    var app = new gxp.Viewer({
        portalConfig: {
            layout: 'fit',
            items: 'app-map'
        },
        sources: {
            'olsource': {
                ptype: 'gxp_olsource'
            }
        },
        map: {
            id: 'app-map',
            xtype: 'cgxp_mappanel',
            layers: [{
                source: 'olsource',
                type: 'OpenLayers.Layer.WMS',
                args: [
                    'countries',
                    "/cgi-bin/mapserv?map=/home/pierre/public_html/atraining/mapserver/countries.map",
                    {
                        layers: 'countries',
                        format: 'image/png'
                    },
                    {
                        singleTile: true,
                        ratio: 1
                    }
                ]
            }]
        },
        tools: [{
            ptype: 'cgxp_editing'
        }]
    });
});
