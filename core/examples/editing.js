var mapPanel, map, attributePopup, editorGrid;

var INITIAL_EXTENT = [515000, 180000, 580000, 230000];

var RESTRICTED_EXTENT = [515000, 180000, 580000, 230000];

// Used to transmit event throw the application
var EVENTS = new Ext.util.Observable();

var WMTS_OPTIONS = {
    url: "http://sitn-proto-c2cgeoportail.demo-camptocamp.com/elemoine/wsgi/tilecache",
    displayInLayerSwitcher: false,
    requestEncoding: 'REST',
    buffer: 0,
    style: 'default',
    dimensions: ['TIME'],
    params: {
        'time': '2011'
    },
    matrixSet: 'swissgrid',
    maxExtent: new OpenLayers.Bounds(420000, 30000, 900000, 350000),
    projection: new OpenLayers.Projection("EPSG:21781"),
    units: "m",
    formatSuffix: 'png',
    serverResolutions: [4000,3750,3500,3250,3000,2750,2500,2250,2000,1750,1500,1250,1000,750,650,500,250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.1,0.05],
    getMatrix: function() {
        return { identifier: OpenLayers.Util.indexOf(this.serverResolutions, this.map.getResolution()) };
    }
};

Ext.onReady(function() {
    Ext.QuickTips.init();
    var app = new gxp.Viewer({
        portalConfig: {
            layout: 'border',
            items: [
                'app-map',
                {
                    id: 'left-panel',
                    region: 'west',
                    width: 300
                }
            ]
        },
        sources: {
            'olsource': {
                ptype: 'gxp_olsource'
            }
        },
        map: {
            id: 'app-map',
            xtype: 'cgxp_mappanel',
            extent: INITIAL_EXTENT,
            maxExtent: RESTRICTED_EXTENT,
            restrictedExtent: RESTRICTED_EXTENT,
            stateId: "map",
            projection: new OpenLayers.Projection("EPSG:21781"),
            units: "m",
            resolutions: [250,100,50,20,10,5,2.5,1,0.5,0.25,0.1,0.05],
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.PanZoomBar({panIcons: false}),
                new OpenLayers.Control.ArgParser(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine({
                    bottomInUnits: false,
                    bottomOutUnits: false
                }),
                new OpenLayers.Control.MousePosition({numDigits: 0})
            ],
            layers: [
                {
                    source: "olsource",
                    type: "OpenLayers.Layer.TMS",
                    group: 'background',
                    args: [
                        OpenLayers.i18n('plan'),
                        ['http://tile1-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile2-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile3-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile4-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile5-sitn.ne.ch/tilecache_new/tilecache.cgi/'],
                        {
                            layername: 'plan_ville_c2c',
                            type:'png; mode=24bit',
                            serverResolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
                            tileOrigin: new OpenLayers.LonLat(420000,30000),
                            ref: 'plan',
                            group: 'background'
                        }
                    ]
                }
            ],
            items: []
        },
        tools: [{
            ptype: 'cgxp_editing'
        }, {
            ptype: 'cgxp_themeselector',
            outputTarget: 'left-panel',
            layerTreeId: 'layertree',
            themes: THEMES
        }, {
            ptype: "cgxp_layertree",
            id: "layertree",
            outputConfig: {
                header: false,
                flex: 1,
                layout: "fit",
                autoScroll: true,
                themes: THEMES,
                defaultThemes: ["cadastre"],
                wmsURL: "http://sitn-proto-c2cgeoportail.demo-camptocamp.com/elemoine/wsgi/mapserv_proxy"
            },
            outputTarget: 'left-panel'
        }]
    });
});
