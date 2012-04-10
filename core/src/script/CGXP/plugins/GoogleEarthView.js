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

    /** api[config]: actionConfig
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

    /** private: Required intermediate container
     */
    intermediateContainer: null,

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
    },

    /** private: method[addActions]
     */
    addActions: function() {
        this.outputTarget = Ext.getCmp(this.outputTarget);
        var button = new Ext.Button(Ext.apply({
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            iconCls: "cgxp-icon-googleearthview"
        }, this.actionConfig));
        button.on({
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
                        // mark as not rendered to force to render the new component.
                        this.outputTarget.layout.rendered = false;
                    }

                    this.googleEarthPanel = new cgxp.GoogleEarthPanel({
                        flyToSpeed: null,
                        id: "googleearthpanel",
                        mapPanel: this.target.mapPanel
                    });

                    this.googleEarthViewControl = new OpenLayers.Control.GoogleEarthView();
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

                        this.setGEPlugin(gePlugin);
                        this.activate();

                    }, this.googleEarthViewControl);
                    this.googleEarthPanel.on("pluginready", this.pluginReadyCallback);
                    this.target.mapPanel.map.addControl(this.googleEarthViewControl);

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
        });
        return cgxp.plugins.GoogleEarthView.superclass.addActions.apply(this, [button]);
    }

});

Ext.preg(cgxp.plugins.GoogleEarthView.prototype.ptype, cgxp.plugins.GoogleEarthView);
