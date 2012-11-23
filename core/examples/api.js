var MAX_EXTENT = [420000, 30000, 900000, 350000];
var INITIAL_EXTENT = [515000, 180000, 580000, 230000];
var RESTRICTED_EXTENT = [420000, 30000, 900000, 350000];
var WMS_PROXY_URL = "http://sitn-proto-c2cgeoportail.demo-camptocamp.com/elemoine/wsgi/mapserv_proxy";
// example of a class inherited from cgxp.api.Map
// This one does not need ExtJS at all. It's an OpenLayers only example.
var Map = function() {
    this.wmsURL = WMS_PROXY_URL;
    return cgxp.api.Map.apply(this, arguments);
};
OpenLayers.inherit(Map, cgxp.api.Map, {
    initMap: function() {
        var mapConfig = {
            maxExtent: MAX_EXTENT,
            extent: INITIAL_EXTENT,
            restrictedExtent: RESTRICTED_EXTENT,
            projection: "EPSG:21781",
            resolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.LayerSwitcher(),
                new OpenLayers.Control.PanZoomBar({
                    panIcons: false,
                    zoomWorldIcon: true
                }),
                new OpenLayers.Control.OverviewMap({
                    layers: [
                        new OpenLayers.Layer.Image(
                            "overview",
                            "http://sitn-proto-c2cgeoportail.demo-camptocamp.com/elemoine/wsgi/proj/images/keymap_sitn.png",
                            new OpenLayers.Bounds(522000, 180000, 575000, 225000),
                            new OpenLayers.Size(150, 126)
                        )
                    ],
                    size: new OpenLayers.Size(150, 126),
                    maximized: false,
                    isSuitableOverview: function() {
                        return true;
                    },
                    mapOptions: {
                        projection: new OpenLayers.Projection("EPSG:21781"),
                        displayProjection: new OpenLayers.Projection("EPSG:21781"),
                        units: "m",
                        theme: null
                    }
                })
            ],
            layers: [{
                source: 'olsource',
                type: "OpenLayers.Layer.TMS",
                args: [
                    OpenLayers.i18n('Plan de ville'),
                    ['http://tile1-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile2-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile3-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile4-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile5-sitn.ne.ch/tilecache_new/tilecache.cgi/'],
                    {
                        layername: 'plan_ville_c2c',
                        type:'png; mode=24bit',
                        serverResolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
                        maxExtent: new OpenLayers.Bounds(420000,30000,900000,360000),
                        tileOrigin: new OpenLayers.LonLat(420000,30000),
                        ref: 'plan',
                        group: 'background'
                    }
                ]
            },{
                source: "olsource",
                type: "OpenLayers.Layer.TMS",
                args: [
                    OpenLayers.i18n('Orthophoto'),
                    ['http://tile1-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile2-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile3-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile4-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile5-sitn.ne.ch/tilecache_new/tilecache.cgi/'],
                    {
                        layername: 'ortho2011',
                        ref: 'ortho',
                        //layername: 'Orthophoto',
                        type:'png; mode=24bit',
                        serverResolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
                        maxExtent: new OpenLayers.Bounds(420000,30000,900000,360000),
                        tileOrigin: new OpenLayers.LonLat(420000,30000),
                        opacity: 0
                    }
                ]
            }]
        };

        this.initMapFromConfig(mapConfig);
    }
});

// example of a class inherited from cgxp.api.Map which creates a viewer.
var XMap = function() {
    this.wmsURL = WMS_PROXY_URL;
    return cgxp.api.Map.apply(this, arguments);
};
OpenLayers.inherit(XMap, cgxp.api.Map, {
    initMap: function() {
        var mapConfig = {
            maxExtent: MAX_EXTENT,
            extent: INITIAL_EXTENT,
            restrictedExtent: RESTRICTED_EXTENT,
            projection: "EPSG:21781",
            resolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.LayerSwitcher(),
                new OpenLayers.Control.PanZoomBar({
                    panIcons: false,
                    zoomWorldIcon: true
                }),
                new OpenLayers.Control.OverviewMap({
                    layers: [
                        new OpenLayers.Layer.Image(
                            "overview",
                            "http://sitn-proto-c2cgeoportail.demo-camptocamp.com/elemoine/wsgi/proj/images/keymap_sitn.png",
                            new OpenLayers.Bounds(522000, 180000, 575000, 225000),
                            new OpenLayers.Size(150, 126)
                        )
                    ],
                    size: new OpenLayers.Size(150, 126),
                    maximized: false,
                    isSuitableOverview: function() {
                        return true;
                    },
                    mapOptions: {
                        projection: new OpenLayers.Projection("EPSG:21781"),
                        displayProjection: new OpenLayers.Projection("EPSG:21781"),
                        units: "m",
                        theme: null
                    }
                })
            ],
            layers: [{
                source: 'olsource',
                type: "OpenLayers.Layer.TMS",
                args: [
                    OpenLayers.i18n('Plan de ville'),
                    ['http://tile1-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile2-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile3-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile4-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile5-sitn.ne.ch/tilecache_new/tilecache.cgi/'],
                    {
                        layername: 'plan_ville_c2c',
                        type:'png; mode=24bit',
                        serverResolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
                        maxExtent: new OpenLayers.Bounds(420000,30000,900000,360000),
                        tileOrigin: new OpenLayers.LonLat(420000,30000),
                        ref: 'plan',
                        group: 'background'
                    }
                ]
            },{
                source: "olsource",
                type: "OpenLayers.Layer.TMS",
                args: [
                    OpenLayers.i18n('Orthophoto'),
                    ['http://tile1-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile2-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile3-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile4-sitn.ne.ch/tilecache_new/tilecache.cgi/', 'http://tile5-sitn.ne.ch/tilecache_new/tilecache.cgi/'],
                    {
                        layername: 'ortho2011',
                        ref: 'ortho',
                        //layername: 'Orthophoto',
                        type:'png; mode=24bit',
                        serverResolutions: [250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.125,0.0625],
                        maxExtent: new OpenLayers.Bounds(420000,30000,900000,360000),
                        tileOrigin: new OpenLayers.LonLat(420000,30000),
                        opacity: 0
                    }
                ]
            }]
        };

        var config = this.adaptConfigForViewer(mapConfig);
        var app = new gxp.Viewer({
            portalConfig: {
                renderTo: config.div,
                height: Ext.get(config.div).getHeight(),
                layout: "fit",
                items: [config.id]
            },
            // configuration of all tool plugins for this application
            tools: [
            {
                ptype: "cgxp_mapopacityslider"
            },
            {
                ptype: "gxp_zoomtoextent",
                actionTarget: "map.tbar",
                closest: true,
                extent: INITIAL_EXTENT
            },
            {
                ptype: "cgxp_menushortcut",
                actionTarget: "map.tbar",
                type: '-'
            },
            {
                ptype: "cgxp_zoom",
                actionTarget: "map.tbar",
                toggleGroup: "maptools"
            }],
            sources: {
                olsource: {
                    ptype: "gxp_olsource"
                }
            },
            map: config
        });
        app.on('ready',
            this.onViewerReady.createDelegate(this, [app]));
    }
});

window.onload = function() {
    var markers = [
        [544410, 210100, 14, 14, 'images/info.png'],
        [544450, 210000, 18, 18, 'images/essence.png'],
        [544310, 210200, 14, 14, 'images/parking.png']
    ];
    var map1 = new Map({
        div: 'map1',
        center: [544500, 210100],
        zoom: 8,
        layerSwitcher: true,
        //layerSwitcherExpanded: true,
        layers: ['parcelles', 'batiments_ofs']
        //overview: true
        //overviewExpanded: true
    });
    // show a maker with default icon at the center of the map
    map1.addMarker();
    for (var i = 0; i < markers.length; i++) {
        var m = markers[i];
        map1.addMarker({
            position: [m[0], m[1]],
            size: [m[2], m[3]],
            icon: m[4]
        });
    }

    var map2 = new XMap({
        div: 'map2',
        center: [544500, 210100],
        zoom: 8,
        layerSwitcher: true,
        layerSwitcherExpanded: true,
        layers: ['parcelles', 'batiments_ofs'],
        overview: true,
        overviewExpanded: true
    });
};
