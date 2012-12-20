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

/**
 * @requires plugins/Tool.js
 * @include OpenLayers/Control/GoogleEarthView.js
 * @include plugins/GoogleEarth.js
 * @include CGXP/widgets/GoogleEarthPanel.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = GoogleEarthView
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add the GoogleEarth plugins to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          portalConfig: {
 *              layout: "border",
 *              // by configuring items here, we don't need to configure portalItems
 *              // and save a wrapping container
 *              items: [{
 *                  region: "north",
 *                  contentEl: 'header-out'
 *              },
 *              {
 *                  region: 'center',
 *                  layout: 'border',
 *                  id: 'center',
 *                  tbar: [],
 *                  items: [
 *                      "app-map"
 *                  ]
 *              },
 *              {
 *                  id: "featuregrid-container",
 *                  xtype: "panel",
 *                  layout: "fit",
 *                  region: "south",
 *                  height: 160,
 *                  split: true,
 *                  collapseMode: "mini",
 *                  hidden: true,
 *                  bodyStyle: 'background-color: transparent;'
 *              },
 *              {
 *                  layout: "accordion",
 *                  id: "left-panel",
 *                  region: "west",
 *                  width: 300,
 *                  minWidth: 300,
 *                  split: true,
 *                  collapseMode: "mini",
 *                  border: false,
 *                  defaults: {width: 300},
 *                  items: [{
 *                      xtype: "panel",
 *                      title: OpenLayers.i18n("layertree"),
 *                      id: 'layerpanel',
 *                      layout: "vbox",
 *                      layoutConfig: {
 *                          align: "stretch"
 *                      }
 *                  }]
 *              }]
 *          },
 *          tools: [{
 *              ptype: "cgxp_googleearthview",
 *              showRoadsLayer: true,
 *              showBuildingsLayer: true,
 *              showBordersLayer: true,
 *              showTerrainLayer: true,
 *              showTreesLayer: true,
 *              toggleGroup: "maptools",
 *              outputTarget: "center",
 *              actionTarget: "center.tbar"
 *          },
 *          ...
 *          {
 *              ptype: "cgxp_menushortcut",
 *              actionTarget: "center.bbar",
 *              type: '->'
 *          },
 *          {
 *              ptype: "cgxp_addkmlfile",
 *              echoUrl: "${request.route_url('echo', path='')}",
 *              actionTarget: "center.bbar"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: GoogleEarthView(config)
 *
 *  GoogleEarthView provides a toolbar button that toggles a GoogleEarthPanel
 *  view of the map.
 *
 */
cgxp.plugins.GoogleEarthView = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_googleearthview */
    ptype: "cgxp_googleearthview",

    /** api: config[actionConfig]
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

    /** api: Component in which to create the GoogleEarthPanel
     */
    outputTarget: null,

    /** api: Size of the GoogleEarthPanel in the outputTarget
     */
    size: "40%",

    /** api: config[showBordersLayer]
     *  ``Boolean`` or ``null``
     *  Enable or disable the Google Earth Plugin's built-in borders layer.
     *  Set this to one of three values:
     *
     *  * ``true``: force layer to be enabled
     *  * ``false``: force layer to be disabled
     *  * ``null``: leave layer as default
     */
    showBordersLayer: null,

    /** api: config[showBuildingsLayer]
     *  ``Boolean`` or ``null``
     *  Enable or disable the Google Earth Plugin's built-in buildings layer.
     *  See comments for showBordersLayer above.
     */
    showBuildingsLayer: null,

    /** api: config[showBuildingsLowResolutionLayer]
     *  ``Boolean`` or ``null``
     *  Enable or disable the Google Earth Plugin's built-in low resolution buildings layer.
     *  See comments for showBordersLayer above.
     */
    showBuildingsLowResolutionLayer: null,

    /** api: config[showRoadsLayer]
     *  ``Boolean`` or ``null``
     *  Enable or disable the Google Earth Plugin's built-in roads layer.
     *  See comments for showBordersLayer above.
     */
    showRoadsLayer: null,

    /** api: config[showTerrainLayer]
     *  ``Boolean`` or ``null``
     *  Enable or disable the Google Earth Plugin's built-in terrain layer.
     *  See comments for showBordersLayer above.
     */
    showTerrainLayer: null,

    /** api: config[showTreesLayer]
     *  ``Boolean`` or ``null``
     *  Enable or disable the Google Earth Plugin's built-in trees layer.
     *  See comments for showBordersLayer above.
     */
    showTreesLayer: null,

    /** private: property[intermediateContainer]
     *  Required intermediate container
     */
    intermediateContainer: null,

    /** i18n */
    tooltipText: 'GoogleEarth',
    menuText: 'GoogleEarth',

    /** private: method[init]
     */
    init: function() {
        gxp.plugins.GoogleEarth.loader.loadScript({
            callback: Ext.emptyFn,
            errback: Ext.emptyFn,
            failure: Ext.emptyFn,
            ready: Ext.emptyFn,
            scope: this,
            timeout: 30 * 1000
        });
        cgxp.plugins.GoogleEarthView.superclass.init.apply(this, arguments);
        this.googleEarthViewControl = null;
        this.pluginReadyCallback = null;
        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        // detect when a KML layer is added to the map
        this.target.mapPanel.layers.on("add", function(store) {
            store.each(function(layer) {
                var lyr = layer.getLayer();
                if (lyr instanceof OpenLayers.Layer.Vector &&
                    lyr.protocol instanceof OpenLayers.Protocol.HTTP &&
                    typeof lyr.protocol.url == 'string' &&
                    lyr.protocol.format instanceof OpenLayers.Format.KML) {
                    this.actions[0].items[0].toggle(true);
                }
            }, this);
        }, this);
    },

    /** private: method[addActions]
     */
    addActions: function() {
        this.outputTarget = Ext.getCmp(this.outputTarget);
        var button = Ext.apply({
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            iconCls: "cgxp-icon-googleearthview",
            toottip: this.tooltipText,
            menuText: this.menuText,
            listeners: {
                "toggle": function(button) {
                    if (button.pressed) {

                        Ext.each(
                            this.target.mapPanel.map.getControlsByClass("OpenLayers.Control.KeyboardDefaults"),
                            function(control) {
                                control.deactivate();
                            });

                        if (this.intermediateContainer === null) {
                            this.intermediateContainer = this.outputTarget.add({
                                autoDestroy: false,
                                layout: "fit",
                                region: "east",
                                split: true,
                                collapseMode: "mini"
                            });
                        }

                        this.googleEarthPanel = new cgxp.GoogleEarthPanel({
                            flyToSpeed: null,
                            id: "googleearthpanel",
                            mapPanel: this.target.mapPanel
                        });

                        this.googleEarthViewControl = new OpenLayers.Control.GoogleEarthView();
                        var googleEarthView = this;
                        this.pluginReadyCallback = OpenLayers.Function.bind(function(gePlugin) {

                            // The gxp.GoogleEarthPanel fits the 3D view to the 2D view as closely as possible.
                            // We want some hot tilting action, so we set our own camera position here.
                            // This callback is called after the gxp.GoogleEarthPanel sets its camera, so ours wins.

                            var extent = this.map.getExtent();
                            var mapProjection = this.map.getProjectionObject();

                            var lookAt = gePlugin.createLookAt("");

                            // Place the look at point top left of the center of the map
                            var lookAtGeometry = new OpenLayers.Geometry.Point(
                                0.6 * extent.left   + 0.4 * extent.right,
                                0.4 * extent.bottom + 0.6 * extent.top);
                            lookAtGeometry.transform(mapProjection, this.geProjection);
                            var latitude = lookAtGeometry.y;
                            var longitude = lookAtGeometry.x;
                            var altitude = 0;
                            var altitudeMode = gePlugin.ALTITUDE_RELATIVE_TO_GROUND;

                            // Place the camera bottom right of the center of the map
                            var heading = -45;
                            var tilt = 60;
                            var cameraGeometry = new OpenLayers.Geometry.Point(
                                0.4 * extent.left   + 0.6 * extent.right,
                                0.6 * extent.bottom + 0.4 * extent.top);
                            cameraGeometry.transform(mapProjection, this.geProjection);
                            var range = OpenLayers.Spherical.computeDistanceBetween(
                                new OpenLayers.LonLat(cameraGeometry.x, cameraGeometry.y),
                                new OpenLayers.LonLat(lookAtGeometry.x, lookAtGeometry.y));

                            lookAt.set(latitude, longitude, altitude, altitudeMode, heading, tilt, range);
                            gePlugin.getView().setAbstractView(lookAt);

                            var layerRoot = gePlugin.getLayerRoot();
                            if (googleEarthView.showBordersLayer !== null) {
                                layerRoot.enableLayerById(gePlugin.LAYER_BORDERS, googleEarthView.showBordersLayer);
                            }
                            if (googleEarthView.showBuildingsLayer !== null) {
                                layerRoot.enableLayerById(gePlugin.LAYER_BUILDINGS, googleEarthView.showBuildingsLayer);
                            }
                            if (googleEarthView.showBuildingsLowResolutionLayer !== null) {
                                layerRoot.enableLayerById(gePlugin.LAYER_BUILDINGS_LOW_RESOLUTION, googleEarthView.showBuildingsLowResolutionLayer);
                            }
                            if (googleEarthView.showRoadsLayer !== null) {
                                layerRoot.enableLayerById(gePlugin.LAYER_ROADS, googleEarthView.showRoadsLayer);
                            }
                            if (googleEarthView.showTerrainLayer !== null) {
                                layerRoot.enableLayerById(gePlugin.LAYER_TERRAIN, googleEarthView.showTerrainLayer);
                            }
                            if (googleEarthView.showTreesLayer !== null) {
                                layerRoot.enableLayerById(gePlugin.LAYER_TREES, googleEarthView.showTreesLayer);
                            }

                            this.setGEPlugin(gePlugin);
                            this.activate();

                        }, this.googleEarthViewControl);
                        this.googleEarthPanel.on("pluginready", this.pluginReadyCallback);
                        this.target.mapPanel.map.addControl(this.googleEarthViewControl);

                        this.outputTarget.add(this.intermediateContainer);
                        // mark as not rendered to force to render the new component.
                        this.outputTarget.layout.rendered = false;

                        this.intermediateContainer.add(this.googleEarthPanel);
                        this.intermediateContainer.setSize(this.size, 0);
                        this.intermediateContainer.setVisible(true);
                        this.outputTarget.doLayout();
                    } else {

                        this.googleEarthPanel.un("pluginready", this.pluginReadyCallback);
                        this.pluginReadyCallback = null;

                        this.target.mapPanel.map.removeControl(this.googleEarthViewControl);
                        this.googleEarthViewControl.destroy();
                        this.googleEarthViewControl = null;

                        this.googleEarthPanel.destroy();
                        this.googleEarthPanel = null;

                        this.intermediateContainer.setVisible(false);
                        this.outputTarget.doLayout();

                        Ext.each(
                            this.target.mapPanel.map.getControlsByClass("OpenLayers.Control.KeyboardDefaults"),
                            function(control) {
                                control.activate();
                            });

                    }
                },
                scope: this
            }
        }, this.actionConfig);
        return cgxp.plugins.GoogleEarthView.superclass.addActions.apply(this, [button]);
    }
});

Ext.preg(cgxp.plugins.GoogleEarthView.prototype.ptype, cgxp.plugins.GoogleEarthView);
