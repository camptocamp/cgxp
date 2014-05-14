/**
 * Copyright (c) 2013 by Camptocamp SA
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

    /** api: config[layerAliases]
     *  ``Object``
     *  List of layer aliases. If we need to clone a layer for the
     *  query builder, we can use the config from the original layer
     *  with this config:
     *
     *  .. code-block:: javascript
     *
     *      layerAliases: {
     *          'original_layer': ['cloned_layer']
     *      }
     */
    layerAliases: {},

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

        this.layers = {};
        var self = this;
        function addLayer(name, layer) {
            self.layers[name] = layer;
            if (self.layerAliases[name]) {
                Ext.each(self.layerAliases[name], function(alias) {
                    self.layers[alias] = layer;
                });
            }
        }
        function browseThemes(nodes) {
            Ext.each(nodes, function(child) {
                if (child.children) {
                    browseThemes(child.children);
                } else {
                    // is not a WMS layer
                    if (!child.childLayers) {
                        return;
                    }
                    // is not a mapserver group
                    if (child.childLayers.length === 0) {
                        addLayer(child.name, child);
                    }
                    else {
                        Ext.each(child.childLayers, function(layer) {
                            addLayer(layer.name, child);
                        });
                    }
                }
            });
        }
        if (this.themes) {
            browseThemes(this.themes.external || []);
            browseThemes(this.themes.local);
        }

        this.target.on('ready', function() {
            Ext.each(this.target.mapPanel.map.layers, function(layer) {
                if (Ext.isArray(layer.queryLayers)) {
                    Ext.each(layer.queryLayers, function(queryLayer) {
                        if (queryLayer.name && queryLayer.identifierAttribute) {
                            this.layers[queryLayer.name] = queryLayer;
                        }
                    }, this);
                }
            }, this);
        }, this);
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
            if (style.label === undefined && layerMD && layerMD.identifierAttribute) {
                style.label = feature.attributes[layerMD.identifierAttribute];
            }
            return style;
        };
    }
});
