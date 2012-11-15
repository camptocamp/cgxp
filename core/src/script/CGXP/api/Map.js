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
    if (this.userConfig.layers) {
        // don't overwrite mapConfig layers with userConfig layers
        this.userConfig.overlays = this.userConfig.layers;
        delete this.userConfig.layers;
    }
    this.initMap();
};

cgxp.api.Map.prototype = {

    /** api: config[wmsURL]
     *  The URL to the WMS service.
     */
    wmsURL: null,

    /** private: config[userConfig]
     *  The config as set by the end user.
     */
    userConfig: null,

    /** private: config[markersLayer]
     *  The markers layer.
     */
    markersLayer: null,

    /** api: method[initMap]
     *  Is intended to be overriden in inherited classes.
     *  :arg config:  ``Object``
     */
    initMap: function() { },

    /** private: method[adaptConfig]
     *  Adapts the config before creating the map.
     *  :arg config ``Object`` the map config
     */
    adaptConfig: function(config) {
        // remove any controls if not used by user
        function getBy(array, property, match) {
            var test = (typeof match.test == "function");
            var found = OpenLayers.Array.filter(array, function(item) {
                return item[property] == match || (test && match.test(item[property]));
            });
            return found;
        }
        var switcher = getBy(config.controls, "CLASS_NAME",
            'OpenLayers.Control.LayerSwitcher')[0];
        if (!this.userConfig.layerSwitcher && switcher) {
            OpenLayers.Util.removeItem(config.controls, switcher);
        }
        var overview = getBy(config.controls, "CLASS_NAME",
            'OpenLayers.Control.OverviewMap')[0];
        if (!this.userConfig.overview && switcher) {
            OpenLayers.Util.removeItem(config.controls, overview);
        }
    },

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

        this.adaptConfig(config);

        return newConfig;
    },

    /** api: method[onViewerReady]
     *  Method to be called as CGXP.Viewer ready event callback.
     *  :arg viewer: ``GXP.widgets.Viewer`` the viewer
     */
    onViewerReady: function(viewer) {
        this.map = viewer.mapPanel.map;

        var config = this.userConfig;

        // viewer mappanel works with alloverlays, then we don't want the base
        // layers to appear in the layerSwitcher
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.displayInLayerSwitcher = false;
        }
        this.addOverlayLayers(this.userConfig.overlays);
        this.onMapCreated();
    },

    /** api: method[initMapFromConfig]
     *  Convenience method to create a map from a config.
     *  :arg config:  ``Object``
     */
    initMapFromConfig: function(config) {
        var i;
        for (i = 0; i < config.layers.length; i++) {
            var layer = config.layers[i];
            config.layers[i] = this.createBaseLayerFromConfig(layer);
            config.layers[i].opacity = 1;
        }

        this.adaptConfig(config);

        OpenLayers.Util.extend(config, this.userConfig);

        this.map = new OpenLayers.Map(config);

        this.addOverlayLayers(this.userConfig.overlays);
        this.onMapCreated();
    },

    /** private: method[onMapCreated]
     *  Called both for basic or viewer powered versions after the map is
     *  created.
     */
    onMapCreated: function() {
        var config = this.userConfig;

        var layerSwitcher = this.map
            .getControlsByClass("OpenLayers.Control.LayerSwitcher")[0];
        // redraw the switcher for the viewer version
        layerSwitcher && layerSwitcher.redraw();
        if (config.layerSwitcherExpanded) {
            layerSwitcher && layerSwitcher.maximizeControl();
        }

        var overview = this.map
            .getControlsByClass("OpenLayers.Control.OverviewMap")[0];
        if (config.overviewExpanded) {
            overview && overview.maximizeControl();
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

    /** private: method[createOverlayLayer]
     * :arg layer ``String`` The name of the layer to add.
     * :arg external ``Boolean`` Whether it is an external layer or not.
     */
    createOverlayLayer: function(layer, external) {
        var params = {
            layers: layer,
            format: 'image/png'
        };
        if (external) {
            params.external = true;
        }
        return new OpenLayers.Layer.WMS(OpenLayers.i18n(layer),
            this.wmsURL, params, {
            isBaseLayer: false,
            singleTile: true,
            ratio: 1,
            visibility: true
        });
    },

    /** private: method[addOverlayLayers]
     */
    addOverlayLayers: function(overlays) {
        if (overlays) {
            for (var i = 0; i < overlays.length; i++) {
                var layer = this.createOverlayLayer(overlays[i]);
                this.map.addLayer(layer);
            }
        }
    },

    /** api: method[addMarker]
     *  :arg options ``Object`` List of marker options
     */
    addMarker: function(options) {
        options = options || {};
        var lonlat = (options.position) ?
            new OpenLayers.LonLat(options.position[0], options.position[1]) :
            this.map.getCenter();

        var iconPath = options.icon || (OpenLayers.Util.getImagesLocation() + 'marker.png');
        var iconWidth = options.size && options.size[0] || 21;
        var iconHeight = options.size && options.size[1] || 25;
        var size = new OpenLayers.Size(iconWidth, iconHeight);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon(iconPath, size, offset);

        this.getMarkersLayer().addMarker(
            new OpenLayers.Marker(lonlat, icon)
        );
    },

    /** private: method[getMarkersLayer]
     */
    getMarkersLayer: function() {
        if (!this.markersLayer) {
            this.markersLayer = new OpenLayers.Layer.Markers("Markers");
            this.map.addLayer(this.markersLayer);
        }

        return this.markersLayer;
    }
};
