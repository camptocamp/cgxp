/**
 * Copyright (c) 2011 Camptocamp
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
 * @include OpenLayers/Protocol/WFS/v1_0_0.js
 * @include OpenLayers/Format/GML.js
 * @include OpenLayers/Format/WMSGetFeatureInfo.js
 * @include GeoExt/widgets/Action.js
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
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_getfeature",
 *              actionTarget: "center.tbar",
 *              toggleGroup: "maptools",
 *              events: EVENTS,
 *              themes: THEMES,
 *              WFSURL: "${request.route_url('mapserverproxy', path='')}",
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
 *  to a toolbar to do a box query without the pressing the CTRL.
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
 *          maxResolutionHint: 6.6145797614602611
 *      }, {
 *          name: "parcels",
 *          maxScaleDenominator: 10000
 *      }]
 *      ...
 *
 */
cgxp.plugins.GetFeature = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_wfsgetfeature */
    ptype: "cgxp_getfeature",

    /** api: config[toggleGroup]
     *  ``String`` If this tool should be radio-button style toggled with other
     *  tools, this string is to identify the toggle group.
     */

    /** api: config[actionTarget]
     *  ``String`` or ``Null`` Where to place the optional tool's actions.
     */

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

    /** api: config[WFSURL]
     *  ``String``
     *  The mapserver proxy URL
     */

    /* i18n */
    actionTooltip: 'Query the map',
    noLayerSelectedMessage: 'No layer selected',

    /** api: method[addActions]
     */
    addActions: function() {
        this.buildControls();
        var action = new GeoExt.Action(Ext.applyIf({
            allowDepress: true,
            enableToggle: true,
            iconCls: 'info',
            tooltip: this.actionTooltip,
            toggleGroup: this.toggleGroup,
            control: this.toolWFSControl
        }, this.actionOptions));
        return cgxp.plugins.GetFeature.superclass.addActions.apply(this, [[action]]);
    },

    /** private: method[buildControls]
     *  Create the WMS and WFS controls.
     */
    buildControls: function() {
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
        };
        var themes = Array.concat(
            this.themes.local || [],
            this.themes.external || []);
        this.layersConfig = browse(themes)

        this.buildWMSControl();
        this.target.mapPanel.map.addControl(this.clickWMSControl);

        this.buildWFSControls();
        this.target.mapPanel.map.addControl(this.ctrlWFSControl);
        this.target.mapPanel.map.addControl(this.toolWFSControl);
    },

    /** private method[createWMSControl]
     *  Create the WMS GetFeatureIndo control.
     */
    buildWMSControl: function() {
        var events = this.events;
        var self = this;

        // we overload findLayers to avoid sending requests
        // when we have no sub-layers selected
        this.clickWMSControl = new OpenLayers.Control.WMSGetFeatureInfo({
            infoFormat: "application/vnd.ogc.gml",
            maxFeatures: this.maxFeatures || 100,
            queryVisible: true,
            drillDown: true,
            autoActivate: true,
            findLayers: function() {
                var layers = OpenLayers.Control.WMSGetFeatureInfo
                    .prototype.findLayers.apply(this, arguments);
                if (layers.length == 0) {
                    Ext.MessageBox.alert("Info", this.noLayerSelectedMessage);
                }
                return layers;
            },

            // copied from OpenLayers.Control.WMSGetFeatureInfo and updated as
            // stated in comments
            request: function(clickPosition, options) {
                events.fireEvent('querystarts');
                var layers = this.findLayers();
                if (layers.length === 0) {
                    this.events.fireEvent("nogetfeatureinfo");
                    // Reset the cursor.
                    OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
                    return;
                }

                options = options || {};
                if (this.drillDown === false) {
                    var wmsOptions = this.buildWMSOptions(this.url, layers,
                        clickPosition, layers[0].params.FORMAT);
                    var request = OpenLayers.Request.GET(wmsOptions);

                    if (options.hover === true) {
                        this.hoverRequest = request;
                    }
                } else {
                    // Following is specific code, updated from original
                    // OpenLayers.Control.WMSGetFeatureInfo code to make
                    // exactly one request by layer, so our mapserver proxy
                    // don't get lost.
                    this._requestCount = 0;
                    this._numRequests = layers.length;
                    this.features = [];
                    for (var i=0, len=layers.length; i<len; i++) {
                        var layer = layers[i];
                        var url = layer.url instanceof Array ? layer.url[0] : layer.url;
                        var wmsOptions = this.buildWMSOptions(url, [layer],
                            clickPosition, layer.params.FORMAT);
                        var queryLayers = [];
                        // Add only queryable layer or sublayer.
                        Ext.each(wmsOptions.params.QUERY_LAYERS, function(queryLayer) {
                            if (queryLayer in this.layersConfig) {
                                if (this.layersConfig[queryLayer].queryable) {
                                    queryLayers.push(queryLayer);
                                }
                                Ext.each(this.layersConfig[queryLayer]
                                        .childLayers, function(childLayer) {
                                    if (childLayer.queryable) {
                                        queryLayers.push(childLayer.name);
                                    }
                                });
                            }
                            else {
                                queryLayers.push(queryLayer);
                            }
                        }, self);
                        wmsOptions.params.QUERY_LAYERS = queryLayers;
                        OpenLayers.Request.GET(wmsOptions);
                    }
                }
            },

            eventListeners: {
                getfeatureinfo: function(e) {
                    this.events.fireEvent('queryresults', e.features);
                },
                activate: function() {
                    this.events.fireEvent('queryopen');
                },
                deactivate: function() {
                    this.events.fireEvent('queryclose');
                },
                clickout: function() {
                    // the GetFeature control converts empty result to clickout.
                    this.events.fireEvent('queryresults', []);
                },
                scope: this
            }
        });
    },

    /** private method[createWFSControls]
     *  Create the WFS GetFeature control.
     */
    buildWFSControls: function() {
        var protocol = new OpenLayers.Protocol.WFS({
            url: this.WFSURL,
            geometryName: this.geometryName,
            srsName: this.target.mapPanel.map.getProjection(),
            formatOptions: {
                featureNS: 'http://mapserver.gis.umn.edu/mapserver',
                autoconfig: false
            }
        });
        var externalProtocol = new OpenLayers.Protocol.WFS({
            url: this.WFSURL + "?EXTERNAL=true",
            geometryName: this.geometryName,
            srsName: this.target.mapPanel.map.getProjection(),
            formatOptions: {
                featureNS: 'http://mapserver.gis.umn.edu/mapserver',
                autoconfig: false
            }
        });

        var listners = {
            featuresselected: function(e) {
                this.events.fireEvent('queryresults', e.features);
            },
            activate: function() {
                this.events.fireEvent('queryopen');
            },
            deactivate: function() {
                this.events.fireEvent('queryclose');
            },
            clickout: function() {
                // the GetFeature control converts empty result to clickout.
                this.events.fireEvent('queryresults', []);
            },
            scope: this
        };
        var self = this;
        var request = function() {
            self.events.fireEvent('querystarts');
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
        };

        // we overload findLayers to avoid sending requests
        // when we have no sub-layers selected
        this.toolWFSControl = new OpenLayers.Control.GetFeature({
            target: this.target,
            box: true, 
            click: false, 
            single: false, 
            eventListeners: listners,
            request: request
        });
        this.ctrlWFSControl = new OpenLayers.Control.GetFeature({
            target: this.target,
            box: true, 
            click: false, 
            single: false, 
            handlerOptions: {
                box: {
                    keyMask: OpenLayers.Handler.MOD_CTRL
                }
            },
            autoActivate: true,
            eventListeners: listners,
            request: request
        });
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

        var currentRes = map.getResolution();
        Ext.each(olLayers, function(layer) {
            var j, lenj, l, k;
            if (layer.getVisibility() === true) {
                var layers = layer.params.LAYERS ||
                             layer.queryLayers ||
                             layer.mapserverLayers;
                if (!layers) {
                    return;
                }

                if (!Ext.isArray(layers)) {
                    layers = layers.split(',');
                }

                var filteredLayers = [];
                for (j = 0, lenj = layers.length; j < lenj; j++) {
                    l = this.layersConfig[layers[j]];
                    if (l) {
                        if (l.childLayers && l.childLayers.length > 0) {
                            // layer is a layergroup (as per Mapserver)
                            for (k = 0, lenk = l.childLayers.length; k < lenk; k++) {
                                var c = l.childLayers[k];
                                if (inRange(c, currentRes)) {
                                    filteredLayers.push(c.name);
                                }
                            }
                        } else {
                            // layer is not a layergroup
                            if (inRange(l, currentRes)) {
                                filteredLayers.push(layers[j]);
                            }
                        }
                    } else if (inRange(layers[j], currentRes)) {
                        filteredLayers.push(layers[j].name || layers[j]);
                    }
                }

                for (j = 0, lenj = filteredLayers.length ; j < lenj ; j++) {
                    for (var i = 0, leni = this.WFSTypes.length ; i < leni ; i++) {
                        if (this.WFSTypes[i] === filteredLayers[j]) {
                            internalLayers.push(this.WFSTypes[i]);
                            break;
                        }
                    }
                    for (k = 0, lenk = this.externalWFSTypes.length ; k < lenk ; k++) {
                        if (this.externalWFSTypes[k] === filteredLayers[j]) {
                            externalLayers.push(this.externalWFSTypes[k]);
                            break;
                        }
                    }
                }
            }
        }, this);

        return {
            internalLayers: internalLayers,
            externalLayers: externalLayers
        };
    }
});

Ext.preg(cgxp.plugins.GetFeature.prototype.ptype, cgxp.plugins.GetFeature);
