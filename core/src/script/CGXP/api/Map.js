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
 * @include GeoExt/widgets/tree/LayerParamNode.js
 */

Ext.namespace('cgxp.api');

cgxp.api.Map = Ext.extend(Object, {

    /**
     * Constructor
     * see apihelp.html page to see hoe to use the API.
     */
    constructor: function(config) {
        this.initializeViewer({
            width: config.width,
            height: config.height,
            renderTo: config.div
        });

        this.viewer.on('ready', function() {
            if (config.easting != undefined && config.northing != undefined 
                    && config.zoom != undefined) {
                var center = new OpenLayers.LonLat(config.easting, config.northing);
                this.viewer.mapPanel.map.setCenter(center, config.zoom);
            }

            if (config.overlays) {
                var hasLocal = config.overlays.local;
                var hasExternal = config.overlays.external;
                if (hasLocal) {
                    this.viewer.mapPanel.map.addLayer(
                            this.createApiOverlays(config.overlays.local, 'local'));
                }
                if (hasExternal) {
                    this.viewer.mapPanel.map.addLayer(
                            this.createApiOverlays(config.overlays.external, 'external'));
                }
                // if local/external is not specified, take overlays as local
                if (!hasLocal && !hasExternal) {
                    this.viewer.mapPanel.map.addLayer(
                            this.createApiOverlays(config.overlays, 'local'));
                }
            }

            if (config.showMarker) {
                var vectorLayer = new OpenLayers.Layer.Vector(
                    OpenLayers.Util.createUniqueID("c2cgeoportal"), {
                        displayInLayerSwitcher: false,
                        alwaysInRange: true
                });
                this.viewer.mapPanel.map.addLayer(vectorLayer);
                this.showMarker(vectorLayer, center || map.mapPanel.map.getCenter());
            }
        }, this);
    },

    /**
     * Method: initializeViewer
     * Initialize the gxp viewer object
     */
    initializeViewer: function(viewerConfig, apiConfig) {
        // should be overwritten

        // thoses properties should be defined
        // this.mapserverproxyURL
        // this.themes
        // this.viewer
    },

    /**
     * Method: showMarker
     * Add a marker to the map at a specific location.
     *
     * Parameters:
     * vector - {OpenLayers.Layer.Vector} The vector layer.
     * loc - {OpenLayers.LonLat} The location.
     */
    showMarker: function(vector, loc) {
        var geometry = new OpenLayers.Geometry.Point(loc.lon, loc.lat);
        var feature = new OpenLayers.Feature.Vector(geometry, {}, {
            externalGraphic: OpenLayers.Util.getImagesLocation() + 'marker.png',
            graphicWidth: 21,
            graphicHeight: 25,
            graphicYOffset: -25/2
        });
        vector.addFeatures([feature]);
    },

    /**
     * Method: createApiOverlays
     * Return WMS overlays for the map.
     *
     * Returns:
     * {OpenLayers.Layer.WMS} overlay layer instance.
     */
    createApiOverlays: function(overlays, type) {
        var layers = [], themes = this.themes[type];
        if (themes) {
            uppermost: for (var i = 0, len = overlays.length; i < len; i++) {
                var name = overlays[i];
                for (var j = 0, lenj = themes.length; j < lenj; j++) {
                    var theme = themes[j];
                    if (theme.name == name) {
                        layers = layers.concat(this._getNodeChildren(theme));
                        continue uppermost;
                    }
                }
                layers.push(name);
            }
        }
        var params = {
            layers: layers,
            format: 'image/png'
        };
        if (type == 'external') {
            params.external = true;
        }
        return new OpenLayers.Layer.WMS("overlays_" + type, 
            this.mapserverproxyURL, params, {
            isBaseLayer: false,
            singleTile: true,
            ratio: 1,
            visibility: true
        });
    },

    /**
     * Method: _getNodeChildren
     * Gets the Mapserver layers associated to given theme node 
     *
     * Returns:
     * Array
     */
    _getNodeChildren: function(node) {
        var children = [];
        if (node.children) {
            for (var i = 0, len = node.children.length; i < len; i++) {
                children = children.concat(this._getNodeChildren(node.children[i]));
            }
        } else {
            children.push(node.name);
        }
        return children;
    },

    /**
     * Method: recenterCb
     * The recenter callback function.
     *
     * Parameters:
     * geojson - {String} The GeoJSON string.
     */
    recenterCb: function(geojson) {
        var format = new OpenLayers.Format.GeoJSON();
        var feature = format.read(geojson, "Feature");
        this.viewer.mapPanel.map.zoomToExtent(feature.bounds);
    },

    /**
     * APIMethod: recenter
     * Center the map on a specific feature.
     *
     * Parameters:
     * fid - {String} The id of the feature.
     */
    recenter: function(fid) {
        var url = 'changeme/' + fid + '.json';
        Ext.ux.JSONP.request(url, {
            callbackKey: "cb",
            params: {
                no_geom: true
            },
            callback: recenterCb,
            scope: this
        });
    }


});

