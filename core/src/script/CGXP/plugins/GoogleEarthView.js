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

/** api: (extends)
 *  plugins/Tool.js
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

    /** api: Google Earth API key
     */
    apiKey: null,

    /** api: Component in which to create the GoogleEarthPanel
     */
    outputTarget: null,

    /** api: Region of the outputTarget
     */
    region: "east",

    /** api: Size of the GoogleEarthPanel in the outputTarget
     */
    size: "40%",

    init: function() {
        gxp.plugins.GoogleEarth.loader.loadScript({
            apiKey: this.apiKey,
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
        var button = new Ext.Button({
            enableToggle: true,
            iconCls: "cgxp-icon-googleearthview"
        });
        button.on({
            "toggle": function(button) {
                if (button.pressed) {

                    Ext.each(
                        this.target.mapPanel.map.getControlsByClass("OpenLayers.Control.KeyboardDefaults"),
                        function(control) {
                            control.deactivate();
                        });

                    this.googleEarthPanel = new cgxp.GoogleEarthPanel({
                        flyToSpeed: null,
                        id: "googleearthpanel",
                        mapPanel: this.target.mapPanel,
                        region: this.region
                    });

                    this.googleEarthViewControl = new OpenLayers.Control.GoogleEarthView();
                    this.pluginReadyCallback = OpenLayers.Function.bind(function(gePlugin) {
                        this.setGEPlugin(gePlugin);
                        this.activate();
                    }, this.googleEarthViewControl);
                    this.googleEarthPanel.on("pluginready", this.pluginReadyCallback);
                    this.target.mapPanel.map.addControl(this.googleEarthViewControl);

                    this.outputTarget.add(this.googleEarthPanel);
                    this.outputTarget.setSize(this.size, 0);
                    this.outputTarget.setVisible(true);
                    this.outputTarget.ownerCt.doLayout();

                } else {

                    this.googleEarthPanel.un("pluginready", this.pluginReadyCallback);
                    this.pluginReadyCallback = null;

                    this.target.mapPanel.map.removeControl(this.googleEarthViewControl);
                    this.googleEarthViewControl.destroy();
                    this.googleEarthViewControl = null;

                    this.outputTarget.remove(this.googleEarthPanel);
                    this.googleEarthPanel.destroy();
                    this.googleEarthPanel = null;

                    this.outputTarget.setVisible(false);
                    this.outputTarget.ownerCt.doLayout();

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
