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
 * @include widgets/GoogleEarthPanel.js
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
 *  TODO description
 */
cgxp.plugins.GoogleEarthView = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_googleearthview */
    ptype: "cgxp_googleearthview",

    earthReadyCallback: null,

    googleEarthViewControl: null,

    googleEarthPanel: null,

    /** private: method[addActions]
     */
    addActions: function() {
        window.g = this;
        window.console.log("addActions");
        var button = new Ext.Button({
            text: OpenLayers.i18n("Tools.googleearthview"),
            enableToggle: true
        });
        button.on({
            "toggle": function(button) {
                window.console.log("toggle(" + button.pressed + ")");
                if (button.pressed) {
                    this.googleEarthPanel = new gxp.GoogleEarthPanel({
                        mapPanel: this.target.mapPanel,
                        region: "east"
                    });
                    // FIXME add googleEarthPanel
                    this.googleEarthViewControl = new OpenLayers.Control.GoogleEarthView();
                    this.earthReadyCallback = OpenLayers.Function.bind(function(gePlugin) {
                        this.setGEPlugin(gePlugin);
                        this.activate();
                    }, this.googleEarthViewControl);
                    this.googleEarthPanel.on("earthready", this.earthReadyCallback);
                    this.target.mapPanel.map.addControl(this.googleEarthViewControl);
                } else {
                    this.target.mapPanel.map.removeControl(this.googleEarthViewControl);
                    this.googleEarthViewControl = null;
                    this.googleEarthPanel.un("earthready", this.earthReadyCallback);
                    this.earthReadyCallback = null;
                    // FIXME remove googleEarthPanel
                }
            },
            scope: this
        });
        return cgxp.plugins.GoogleEarthView.superclass.addActions.apply(this, [button]);
    },

    /** private: method[addOutput]
     */
    addOutput: function() {
        window.console.log("addOutput");
        return cgxp.plugins.GoogleEarthView.superclass.addOutput.apply(this, [googleEarthPanel]);
    }

});

Ext.preg(cgxp.plugins.GoogleEarthView.prototype.ptype, cgxp.plugins.GoogleEarthView);
