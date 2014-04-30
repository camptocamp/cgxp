/**
 * Copyright (c) 2012-2013 by Camptocamp SA
 *
 * CGXP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CGXP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @requires plugins/Tool.js
 * @include OpenLayers/Control/GetFeature.js
 * @include OpenLayers/Control/WMSGetFeatureInfo.js
 * @include OpenLayers/Protocol/WFS/v1_1_0.js
 * @include OpenLayers/Format/GML.js
 * @include OpenLayers/Format/WMSGetFeatureInfo.js
 * @include GeoExt/widgets/Action.js
 * @include CGXP/plugins/ToolActivateMgr.js
 */


/** api: (define)
 *  module = cgxp.plugins
 *  class = GetFeature
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a GetFeature plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      ...
 *      Ext.namespace("cgxp");
 *      // WFS namespace, depends of the backend used, default is for Mapserver
 *      cgxp.WFS_FEATURE_NS = "http://mapserver.gis.umn.edu/mapserver";
 *
 *      ...
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_getfeature",
 *              actionTarget: "center.tbar",
 *              toggleGroup: "maptools",
 *              events: EVENTS,
 *              themes: THEMES,
 *              mapserverURL: "${request.route_url('mapserverproxy', path='')}",
 *              WFSTypes: ${WFSTypes | n},
 *              externalWFSTypes: ${externalWFSTypes | n},
 *              enableWMTSLayers: true
 *          }]
 *          ...
 *      });
 *
 *  The min/maxResolutionHint can be computed with the following rule:
 *
 *  .. code-block:: javascript
 *
 *      1 / (1 / MIN/MAXSCALEDENOMINATOR * INCHES_PER_UNIT * DOTS_PER_INCH)
 *      1 / (1 / 25000 * 39.3701 * 96)
 *
 *  Or you can use min/maxScaleDenominator as set in MapServer.
 *
 */

/** api: constructor
 *  .. class:: GetFeature(config)
 *
 *  With this plugin we can query the map with a simple click
 *  (WMS GetFeatureInfo) or with a CTRL-Drag for a box query
 *  (WFS GetFeature).
 *  We can optionally (with actionTarget) add a toggle button
 *  to a toolbar to do a box query without pressing the CTRL key.
 *
 *  Only the currently visible layers are queried.
 *
 *  For a WMS layer the feature types sent in the WFS GetFeature query
 *  are obtained from its ``layers`` parameter.
 *
 *  For a layer of another type (layer that does not have a ``layers``
 *  parameter), the feature types are obtained from the layer's
 *  ``queryLayers`` option if it is defined, and from its
 *  ``mapserverLayers`` option if ``queryLayers`` is not defined.
 *
 *  Here's an example on how to use the ``queryLayers`` option
 *  in a layer config:
 *
 *  .. code-block:: javascript
 *
 *      ...
 *      queryLayers: [{
 *          name: "buildings",
 *          identifierAttribute: "name",
 *          maxResolutionHint: 6.6145797614602611
 *      }, {
 *          name: "parcels",
 *          identifierAttribute: "number",
 *          maxScaleDenominator: 10000
 *      }]
 *      ...
 * 
 *  If there are OpenLayers WMS layers including feature filters
 *  (``featureFilter`` property on the layer), then these filters are evaluated
 *  for each feature received in the WMS GetFeatureInfo
 *  and WFS GetFeature responses.
 *  Features that do not pass the filter are excluded from the features array
 *  passed in the queryresults event.
 *  
 *  .. code-block:: javascript
 *
 *    var layer = ...; // an OpenLayers layer
 *    var filter = ...; // an OpenLayers filter
 *    layer.featureFilter = filter
 *    
 *    // This can be used in conjonction with the GetMap request SLD parameter
 *    layer.mergeNewParams({ SLD: url }); // where the SLD file corresponds to the OpenLayers filter
 */
cgxp.plugins.GetFeature = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_getfeature */
    ptype: "cgxp_getfeature",

    /** api: config[toggleGroup]
     *  ``String`` If this tool should be radio-button style toggled with other
     *  tools, this string is to identify the toggle group.
     */

    /** api: config[actionTarget]
     *  ``String`` or ``null`` Where to place the optional tool button.
     *  If set to ``null``, no button is displayed (default is ``null``).
     */
    actionTarget: null,

    /** api: config[actionOptions]
     *  ``Object``
     *  Action options
     */
    actionOptions: {},

    /** api: config[events]
     *  ``Object``
     *  An Observer used to send events.
     */
    events: null,

    /** api: config[themes]
     *  ``Object`` List of internal and external themes and layers. (The
     *  same object as that passed to the :class:`cgxp.plugins.LayerTree`).
     */
    themes: null,

    /** api: config[geometryName]
     *  ``String``
     *  The geometry name.
     */
    geometryName: 'geom',

    /** api: config[enableWMTSLayers]
     *  ``Boolean``
     *  If true, WMTS layers will be queried as well.
     */
    enableWMTSLayers: false,

    /** api: config[WFSTypes]
     *  ``Array``
     *  The queryable type on the internal server.
     */

    /** api: config[externalWFSTypes]
     *  ``Array``
     *  The queryable type on the parent server.
     */

    /** api: config[mapserverURL]
     *  ``String``
     *  The mapserver proxy URL
     */

    /** api: config[autoDeactivate]
     *  ``Boolean``
     *  Deactivate the tool after query.
     *  Default is ``true``.
     */
    autoDeactivate: true,

    /** api: config[activateToggleGroup]
     *  ``String``
     *  The name of the activate toggle group this tool is in.
     *  Default is "clickgroup".
     */
    activateToggleGroup: "clickgroup",

    /** api: config[maxFeatures]
     *  ``Integer``
     *  Limit of features returned by mapserver. Default is 200.
     */
    maxFeatures: 200,

    /* i18n */
    tooltipText: "Query objects on the map",
    menuText: "Query the map",
    unqueriedLayerTitle: "Unable to query this layer",
    unqueriedLayerText: "This Layer only support single click query.",
    queryResultMessage: "Use the {key} key to perform a rectangular selection.",

    /** private: attribute[filter]
     *  ``OpenLayers.Filter``
     */
    filter: null,

    /** private: method[activate]
     */
    activate: function() {
        if (!this.active) {
            this.clickWMSControl.activate();
        }
        return cgxp.plugins.GetFeature.superclass.activate.call(this);
    },

    /** private: method[deactivate]
     */
    deactivate: function() {
        if (this.active) {
            this.clickWMSControl.deactivate();
        }
        return cgxp.plugins.GetFeature.superclass.deactivate.call(this);
    },

    /** private: method[init]
     */
    init: function(target) {
        if (this.activateToggleGroup) {
            cgxp.plugins.ToolActivateMgr.register(this);
        }
        this.buildControls(target.mapPanel.map);
        cgxp.plugins.GetFeature.superclass.init.call(this, target);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        if (this.actionTarget) {
            this.action = new GeoExt.Action(Ext.applyIf({
                allowDepress: true,
                enableToggle: true,
                iconCls: 'info',
                tooltip: this.tooltipText,
                menuText: this.menuText,
                toggleGroup: this.toggleGroup,
                control: this.toolWFSControl
            }, this.actionOptions));
            return cgxp.plugins.GetFeature.superclass.addActions.apply(this,
                    [[this.action]]);
        }
    },

    /** private: method[buildControls]
     *  Create the WMS and WFS controls.
     */
    buildControls: function(map) {
        function browse(node, config) {
            config = config || {};
            for (var i = 0, leni = node.length; i < leni; i++) {
                var child = node[i];
                if (child.children) {
                    browse(child.children, config);
                } else {
                    config[child.name] = child;
                }
            }
            return config;
        }
        this.layersConfig = browse(this.themes.local);
        if (this.themes.external) {
            this.externalLayersConfig = browse(this.themes.external);
        }

        this.buildWMSControl(map);
        this.buildWFSControls(map);
    },

    /** private method[getQueryableWMSLayers]
     */
    getQueryableWMSLayers: function(layers, external, nameOnly) {
        var layersConfig = external ? this.externalLayersConfig :
            this.layersConfig;
        var queryLayers = [];
        // Add only queryable layer or sublayer.
        Ext.each(layers, function(queryLayer) {
            if (queryLayer in layersConfig) {
                var queryLayerConfig = layersConfig[queryLayer];
                if (queryLayerConfig.queryable) {
                    if (nameOnly) {
                        queryLayers.push(queryLayerConfig.name);
                    }
                    else {
                        queryLayers.push(queryLayerConfig);
                    }
                }
                Ext.each(queryLayerConfig.childLayers, function(childLayer) {
                    if (childLayer.queryable) {
                        if (nameOnly) {
                            queryLayers.push(childLayer.name);
                        }
                        else {
                            queryLayers.push(childLayer);
                        }
                    }
                });
            }
        }, this);
        return queryLayers;
    },

    /** private method[createWMSControl]
     *  Create the WMS GetFeatureInfo control.
     */
    buildWMSControl: function(map) {
        var events = this.events;
        var self = this;

        // we overload findLayers to avoid sending requests
        // when we have no sub-layers selected
        this.clickWMSControl = new OpenLayers.Control.WMSGetFeatureInfo({
            infoFormat: "application/vnd.ogc.gml",
            maxFeatures: this.maxFeatures,
            queryVisible: true,
            drillDown: true,
            autoActivate: false,

            findLayers: function() {
                // OpenLayers.Control.WMSGetFeatureInfo.prototype.findLayers
                // modified to get BaseLayers and add a message on
                // no layers selected
                var candidates = this.layers || this.map.layers;
                var layers = [];
                var layer, url;
                for (var i = candidates.length - 1; i >= 0; --i) {
                    layer = candidates[i];
                    if (!this.queryVisible || layer.getVisibility()) {
                        if (layer instanceof OpenLayers.Layer.WMS) {
                            url = OpenLayers.Util.isArray(layer.url) ? layer.url[0] : layer.url;
                            // if the control was not configured with a url, set it
                            // to the first layer url
                            if (this.drillDown === false && !this.url) {
                                this.url = url;
                            }
                            if (this.drillDown === true || this.urlMatches(url)) {
                                layers.push(layer);
                            }
                        }
                        else if (self.enableWMTSLayers &&
                                (layer instanceof OpenLayers.Layer.WMTS ||
                                typeof layer == 'OpenLayers.Layer.TMS')) {
                            layers.push(layer);
                        }
                    }
                }
                return layers;
            },

            request: function(clickPosition, options) {
                // OpenLayers.Control.WMSGetFeatureInfo.prototype.request
                // modified to support WMTS layers, external parameter,
                // add a message on no layers selected
                // and lunch querystarts event
                self.events.fireEvent('querystarts');
                var layers = this.findLayers();
                if (layers.length === 0) {
                    self.events.fireEvent("nolayer");
                    // Reset the cursor.
                    OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
                    return;
                }

                options = options || {};
                this._requestCount = 0;
                this._numRequests = 0;
                this.features = [];
                // group according to service url to combine requests
                var externalServices = {}; // parent
                var internalServices = {}; // child and add by wmsbrowser
                for (var i=0, len=layers.length; i<len; i++) {
                    var layer = layers[i];
                    if (!(layer instanceof OpenLayers.Layer.WMS)) {
                        var queryLayers = layer.queryLayers || layer.mapserverLayers;
                        if (Ext.isArray(queryLayers)) {
                            var ql = [];
                            Ext.each(queryLayers, function(queryLayer) {
                                if (Ext.isString(queryLayer)) {
                                    ql.push(queryLayer);
                                }
                                else if (queryLayer.name) {
                                    ql.push(queryLayer.name);
                                }
                            });
                            queryLayers = ql;
                        }
                        // Create a fake WMS layer
                        layer = {
                            url: self.mapserverURL,
                            projection:
                                self.target.mapPanel.map.getProjectionObject(),
                            reverseAxisOrder: OpenLayers.Function.False,
                            params: Ext.apply({
                                LAYERS: queryLayers,
                                VERSION: '1.1.1'
                            }, layer.mapserverParams)
                        };
                    }
                    else {
                        // Create a fake WMS layer
                        layer = {
                            url: layer.url,
                            projection: layer.projection,
                            reverseAxisOrder: OpenLayers.Function.False,
                            params: Ext.apply({}, layer.params)
                        };
                        layer.params.LAYERS = self.getQueryableWMSLayers(
                            layer.params.LAYERS, layer.params.EXTERNAL, true);
                    }
                    if (layer.params.LAYERS && layer.params.LAYERS.length > 0) {
                        var services = layer.params.EXTERNAL ?
                            externalServices : internalServices;
                        var url = OpenLayers.Util.isArray(layer.url) ?
                            layer.url[0] : layer.url;
                        if (url in services) {
                            services[url].push(layer);
                        }
                        else {
                            this._numRequests++;
                            services[url] = [layer];
                        }
                    }
                }

                var me = this;
                var query = function(urls) {
                    var queryDone = false;
                    for (var url in urls) {
                        queryDone = true;
                        var wmsOptions = me.buildWMSOptions(url, urls[url],
                            clickPosition, 'image/png');
                        // Get the params from the first layer
                        var layer = urls[url][0];
                        for (var param in layer.params) {
                            if (wmsOptions.params[param] === undefined &&
                                    param != 'TRANSPARENT') {
                                wmsOptions.params[param] = layer.params[param];
                            }
                        }
                        OpenLayers.Request.GET(wmsOptions);
                    }
                    return queryDone;
                };
                var queryDone = false;
                queryDone = query(internalServices);
                queryDone = query(externalServices) || queryDone;
                if (!queryDone) {
                    self.events.fireEvent('queryresults', {
                        features: []
                    });
                    // Reset the cursor.
                    OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
                }

                if (self.autoDeactivate && self.action) {
                    self.action.items[0].toggle(false);
                }
            },

            eventListeners: {
                getfeatureinfo: function(e) {
                    this.events.fireEvent('queryresults', {
                        features: this.filterFeatures(e.features),
                        maxFeatures: self.maxFeatures,
                        message: self.getMessage()
                    });
                },
                activate: function() {
                    this.events.fireEvent('queryopen');
                },
                deactivate: function() {
                    this.events.fireEvent('queryclose');
                },
                clickout: function() {
                    // the GetFeature control converts empty result to clickout.
                    this.events.fireEvent('queryresults', {
                        features: []
                    });
                },
                scope: this
            }
        });
        // solve problem with drag before click where event has a none-empty
        // value for passesTolerance which bypass the click triggering
        this.clickWMSControl.handler.click = function() {
            var result = OpenLayers.Handler.Click.prototype.click
                    .apply(this, arguments);
            this.down = null;
            return result;
        };
        map.addControl(this.clickWMSControl);
    },

    /** private method[createWFSControls]
     *  Create the WFS GetFeature control.
     */
    buildWFSControls: function(map) {
        var self = this;
        var protocol = new OpenLayers.Protocol.WFS({
            url: this.mapserverURL,
            maxFeatures: this.maxFeatures,
            geometryName: this.geometryName,
            srsName: map.getProjection(),
            version: "1.1.0",
            formatOptions: {
                featureNS: cgxp.WFS_FEATURE_NS,
                autoconfig: false
            },
            read: function(options) {
                self.filter = 'filter' in options ? options.filter : null;
                options.params = options.params || {};
                Ext.apply(options.params, self.target.mapPanel.params);
                OpenLayers.Protocol.WFS.v1.prototype.read.apply(this, arguments);
            }
        });
        var externalProtocol = new OpenLayers.Protocol.WFS({
            url: this.mapserverURL,
            maxFeatures: this.maxFeatures,
            geometryName: this.geometryName,
            srsName: map.getProjection(),
            version: "1.1.0",
            formatOptions: {
                featureNS: cgxp.WFS_FEATURE_NS,
                autoconfig: false
            },
            read: function(options) {
                options.params = options.params || {};
                Ext.apply(options.params, self.target.mapPanel.params);
                Ext.apply(options.params, {'EXTERNAL': 'true'});
                OpenLayers.Protocol.WFS.v1.prototype.read.apply(this, arguments);
            }
        });

        var listeners = {
            featuresselected: function(e) {
                this.events.fireEvent('queryresults', {
                    features: this.filterFeatures(e.features),
                    maxFeatures: this.maxFeatures
                });
                if (e.features.length == this.maxFeatures) {
                    e.object.protocol.read({
                        filter: this.filter,
                        readOptions: {output: "object"},
                        resultType: "hits",
                        maxFeatures: null,
                        callback: function(response) {
                            var infos = {
                                numberOfFeatures: response.numberOfFeatures
                            };
                            this.events.fireEvent("queryinfos", infos);
                        },
                        scope: this
                    });
                }
            },
            activate: function() {
                this.events.fireEvent('queryopen');
            },
            deactivate: function() {
                this.events.fireEvent('queryclose');
            },
            clickout: function() {
                // the GetFeature control converts empty result to clickout.
                this.events.fireEvent('queryresults', {
                    features: []
                });
            },
            scope: this
        };
        var request = function() {
            self.events.fireEvent('querystarts');

            var olLayers = self.target.mapPanel.map.
                    getLayersByClass("OpenLayers.Layer.WMS");

            var l = self.getLayers.call(self);
            if (l.internalLayers.length > 0) {
                protocol.format.featureType = l.internalLayers;
                this.protocol = protocol;
                OpenLayers.Control.GetFeature.prototype.request.apply(this, arguments);
            }
            if (l.externalLayers.length > 0) {
                externalProtocol.format.featureType = l.externalLayers;
                this.protocol = externalProtocol;
                OpenLayers.Control.GetFeature.prototype.request.apply(this, arguments);
            }
            if (l.unqueriedLayers.length > 0) {
                self.events.fireEvent('queryresults', {
                    features: [],
                    unqueriedLayers: l.unqueriedLayers
                });
            }
            if (l.internalLayers.length == 0 && l.externalLayers.length == 0 &&
                    l.unqueriedLayers.length == 0) {
                self.events.fireEvent('queryresults', {
                    features: []
                });
            }
            if (self.autoDeactivate && self.action) {
                self.action.items[0].toggle(false);
            }
        };

        if (this.actionTarget) {
            // we overload findLayers to avoid sending requests
            // when we have no sub-layers selected
            this.toolWFSControl = new OpenLayers.Control.GetFeature({
                target: this.target,
                box: true,
                click: false,
                single: false,
                eventListeners: listeners,
                request: request
            });
            // don't convert pixel to box, let the WFS GetFeature to query
            this.toolWFSControl.click = true;
            map.addControl(this.toolWFSControl);
        }
        this.ctrlWFSControl = new OpenLayers.Control.GetFeature({
            target: this.target,
            box: true,
            click: false,
            single: false,
            handlerOptions: {
                box: {
                    keyMask: Ext.isMac ? OpenLayers.Handler.MOD_META :
                        OpenLayers.Handler.MOD_CTRL
                }
            },
            autoActivate: true,
            eventListeners: listeners,
            request: request
        });
        map.addControl(this.ctrlWFSControl);
    },

    /** private: method[getLayers]
     *
     *  Gets the list of layers (internal and external) to build a request
     *  with.
     *  :returns: ``Object`` An object with `internalLayers` and `externalLayers`
     *  properties.
     */
    getLayers: function() {
        var map = this.target.mapPanel.map;
        var units = map.getUnits();
        function inRange(l, res) {
            if (!l.minResolutionHint && l.minScaleDenominator) {
                l.minResolutionHint =
                    OpenLayers.Util.getResolutionFromScale(l.minScaleDenominator, units);
            }
            if (!l.maxResolutionHint && l.maxScaleDenominator) {
                l.maxResolutionHint =
                    OpenLayers.Util.getResolutionFromScale(l.maxScaleDenominator, units);
            }
            return (!((l.minResolutionHint && res < l.minResolutionHint) ||
                (l.maxResolutionHint && res > l.maxResolutionHint)));
        }

        var olLayers = map.getLayersByClass("OpenLayers.Layer.WMS");
        if (this.enableWMTSLayers) {
            olLayers = olLayers.concat(
                map.getLayersByClass("OpenLayers.Layer.WMTS")
            );
            olLayers = olLayers.concat(
                map.getLayersByClass("OpenLayers.Layer.TMS")
            );
        }
        var internalLayers = [];
        var externalLayers = [];
        var unqueriedLayers = [];

        var currentRes = map.getResolution();
        Ext.each(olLayers, function(olLayer) {
            if (olLayer.getVisibility() === true) {
                var external = olLayer.mapserverParams &&
                    olLayer.mapserverParams.EXTERNAL ||
                    olLayer.params && olLayer.params.EXTERNAL;
                var layers;
                if (olLayer.mapserverLayers || olLayer.queryLayers) {
                    layers = Ext.isArray(olLayer.queryLayers) ?
                        olLayer.queryLayers :
                        olLayer.queryLayers || olLayer.mapserverLayers;
                    if (!Ext.isArray(layers)) {
                        layers = layers.split(',');
                    }
                }
                else if (olLayer.params && olLayer.params.LAYERS) {
                    layers = olLayer.params.LAYERS;
                    if (!Ext.isArray(layers)) {
                        layers = layers.split(',');
                    }
                    layers = this.getQueryableWMSLayers(layers, external);
                }
                if (!layers) {
                    return;
                }

                var filteredLayers = [];
                Ext.each(layers, function(layer) {
                    if (Ext.isString(layer)) {
                        filteredLayers.push(layer);
                    }
                    else if (inRange(layer, currentRes)) {
                        filteredLayers.push(layer.name);
                    }
                }, this);

                Ext.each(filteredLayers, function(layer) {
                    var queried = false;
                    if (external) {
                        if (this.externalWFSTypes.indexOf(layer) >= 0) {
                            externalLayers.push(layer);
                            queried = true;
                        }
                    }
                    else {
                        if (this.WFSTypes.indexOf(layer) >= 0) {
                            internalLayers.push(layer);
                            queried = true;
                        }
                    }
                    if (!queried) {
                        unqueriedLayers.push({
                            unqueriedLayerId: layer,
                            unqueriedLayerTitle: this.unqueriedLayerTitle,
                            unqueriedLayerText: this.unqueriedLayerText
                        });
                    }
                }, this);
            }
        }, this);

        return {
            internalLayers: internalLayers,
            externalLayers: externalLayers,
            unqueriedLayers: unqueriedLayers
        };
    },

    /** private: method[filterFeatures]
     *
     *  Filter features from layers with a featureFilter property
     *
     *  :returns: ``Array`` of features without filtered ones
     */
    filterFeatures: function(features) {
        var i, ii, j, jj;
        var layer, featureFilter, feature;

        var map = this.target.mapPanel.map;

        // Index featureFilters on query layer names
        var featureFilters;
        for (i=0, ii=map.layers.length; i<ii; i++) {
            layer = map.layers[i];
            featureFilter = layer.featureFilter;
            if (featureFilter && featureFilter.evaluate) {
                var queryLayers = layer.params.LAYERS;
                if (!Ext.isArray(queryLayers)) {
                    queryLayers = queryLayers.split(',');
                }
                for (j=0, jj=queryLayers.length; j<jj; j++) {
                    if (!featureFilters) {
                        featureFilters = {};
                    }
                    featureFilters[queryLayers[j]] = featureFilter;
                }
            }
        }
        if (!featureFilters) {
            return features;
        }

        // Filter features
        var filteredFeatures = [];
        for (i=0, ii=features.length; i<ii; i++) {
            feature = features[i];
            featureFilter = featureFilters[feature.type];
            if (featureFilter) {
                if (featureFilter.evaluate(feature)) {
                    filteredFeatures.push(feature);
                }
            }
            else {
                filteredFeatures.push(feature);
            }
        }
        return filteredFeatures;
    },

    getMessage: function() {
        var tpl = new Ext.Template(this.queryResultMessage);
        var key = 'CTRL';
        if (Ext.isMac) {
            key = '&#8984;';
        }
        return tpl.applyTemplate({key: key});
    }
});

Ext.preg(cgxp.plugins.GetFeature.prototype.ptype, cgxp.plugins.GetFeature);
