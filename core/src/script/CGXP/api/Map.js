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

if (!window.cgxp) {
    cgxp = {};
}
if (!cgxp.api) {
    cgxp.api = {};
}

cgxp.api.Map = function(config) {
    this.userConfig = config;
    this.initMap();
};

cgxp.api.Map.prototype = {

    /** private: config[userConfig]
     *  The config as set by the end user.
     */
    userConfig: null,

    /** api: method[initMap]
     *  Is intended to be overriden in inherited classes.
     *  :arg config:  ``Object``
     */
    initMap: function() { },

    /** api: method[adaptConfigForViewer]
     *  Convenience method to add some required options to mapConfig before
     *  using it to create a viewer.
     *  :arg config: ``Object`` the map config
     *  :returns ``Object`` The new config to be used for the map option of the
     *      viewer
     */
    adaptConfigForViewer: function(config) {
        var newConfig = OpenLayers.Util.extend({}, config);
        OpenLayers.Util.extend(newConfig , this.userConfig);
        // we use the dom id also to give an id to the mappanel in the viewer
        newConfig.id = config.div + "-map";
        newConfig.tbar = [];
        return newConfig;
    },

    /** api: method[onViewerReady]
     *  Method to be called as CGXP.Viewer ready event callback.
     *  :arg viewer: ``GXP.widgets.Viewer`` the viewer
     */
    onViewerReady: function(viewer) {
        var config = this.userConfig;

        if (config.showMarker) {
            this.showMarker();
        }
    },

    /** api: method[initializeViewer]
     *  Convenience method to create a map from a config.
     *  :arg config:  ``Object``
     */
    createMapFromConfig: function(config) {
        OpenLayers.Util.extend(config, this.userConfig);
        for (var i = 0; i < config.layers.length; i++) {
            var layer = config.layers[i];
            config.layers[i] = this.createBaseLayerFromConfig(layer);
        }
        this.map = new OpenLayers.Map(config);
        if (config.showMarker) {
            this.showMarker();
        }
    },

    /** private: method[createBaseLayerFromConfig]
     *  Convenience to create a layer from a layer source.
     */
    createBaseLayerFromConfig: function(config) {
        // get class based on type in config
        var Class = window;
        var parts = config.type.split(".");
        for (var i=0, ii=parts.length; i<ii; ++i) {
            Class = Class[parts[i]];
            if (!Class) {
                break;
            }
        }

        if (Class && Class.prototype && Class.prototype.initialize) {

            // create a constructor for the given layer type
            var Constructor = function() {
                // this only works for args that can be serialized as JSON
                Class.prototype.initialize.apply(this, config.args);
            };
            Constructor.prototype = Class.prototype;

            // create a new layer given type and args
            return new Constructor();
        } else {
            throw new Error("Cannot construct OpenLayers layer from given type: " + config.type);
        }
    },

    /** private: method[showMarker]
     *  Adds a marker to the map at a specific location.
     *  :arg vector  ``OpenLayers.Layer.Vector`` The vector layer.
     *  :arg loc ``OpenLayers.LonLat`` The location.
     */
    showMarker: function(vector, loc) {
        if (!vector) {
            vector = new OpenLayers.Layer.Vector(
                OpenLayers.Util.createUniqueID("cgxp"), {
                    displayInLayerSwitcher: false,
                    alwaysInRange: true
            });
            this.map.addLayer(vector);
        }
        if (!loc) {
            loc = this.map.getCenter();
        }
        var geometry = new OpenLayers.Geometry.Point(loc.lon, loc.lat);
        var feature = new OpenLayers.Feature.Vector(geometry, {}, {
            externalGraphic: OpenLayers.Util.getImagesLocation() + 'marker.png',
            graphicWidth: 21,
            graphicHeight: 25,
            graphicYOffset: -25/2
        });
        vector.addFeatures([feature]);
    }
};
