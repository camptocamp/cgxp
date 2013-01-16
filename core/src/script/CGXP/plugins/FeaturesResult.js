/**
 * Copyright (c) 2013 Camptocamp
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
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FeaturesResult
 */

Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: FeaturesResult(config)
 *
 *      Abstract plugin to display results.
 */
cgxp.plugins.FeaturesResult = Ext.extend(gxp.plugins.Tool, {

    /** private: attribute[layers]
     *  ``Array``
     *  The list of layers.
     */
    layers: null,

    /** private: attibute[vectorLayer]
     *  ``OpenLayers.Layer.Vector``
     *  The vector layer used to display the features.
     */
    vectorLayer: null,

    init: function(target) {
        cgxp.plugins.FeaturesResult.superclass.init.apply(this, arguments);

        var layers = {};
        function browseThemes(node) {
            Ext.each(nodes, function(child) {
                if (child.children) {
                    browseThemes(child.children);
                } else {
                    // is a group
                    if (child.childLayers.length == 0) {
                        layers[child.name] = child;
                    }
                    else {
                        Ext.each(child.childLayers, function(layer) {
                            layers[layer.name] = child;
                        });
                    }
                }
            });
        }
        if (this.themes) {
            browseThemes(this.themes.external || []);
            browseThemes(this.themes.local);
        }
        this.layers = layers;
    },

    /** private: method[createVectorLayer]
     * ``Object``
     */
    createVectorLayer: function(options) {
        this.vectorLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("c2cgeoportal"),
            Ext.apply({
                displayInLayerSwitcher: false,
                alwaysInRange: true
            }, options)
        );
        // add identifierAttribute as label
        var self = this;
        this.vectorLayer.styleMap.createSymbolizer = function(feature) {
            var style = OpenLayers.StyleMap.prototype.
                createSymbolizer.apply(this, arguments);
            var layerMD = self.layers[feature.type];
            if (layerMD && layerMD.identifierAttribute) {
                style.label = feature.attributes[layerMD.identifierAttribute];
            }
            return style;
        };
    }
});
