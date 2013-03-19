/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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
 * @include CGXP/api/Click.js
 * @include OpenLayers/Map.js
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Geometry/Point.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Renderer/SVG.js
 * @include OpenLayers/Renderer/VML.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Protocol/HTTP.js
 * @include OpenLayers/Protocol/Script.js
 * @include OpenLayers/Control/GetFeature.js
 * @include OpenLayers/Format/WMSGetFeatureInfo.js
 * @include OpenLayers/Format/GML.js
 * @include OpenLayers/Format/GPX.js
 * @include OpenLayers/Format/Text.js
 * @include OpenLayers/Popup/FramedCloud.js
 * @include OpenLayers/Control/SelectFeature.js
 */

/** api: (define)
 *  module = cgxp.api
 *  class = Map
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
    this.deferedCalls = [];
    this.initMap();
};

cgxp.api.Map.prototype = {

    /** private: property[wmsURL]
     *  The URL to the WMS service.
     */
    wmsURL: null,

    /** private: property[queryableLayers]
     *  The list of layers (names) declared as queryable.
     */
    queryableLayers: null,

    /** private: property[userConfig]
     *  The config as set by the end user.
     */
    userConfig: null,

    /** private: property[vectorLayer]
     *  The vector layer.
     */
    vectorLayer: null,

    /** private: property[deferedCalls]
     *  List of methods called while (viewer's) map is not ready yet.
     *  Those methods are supposed to be called again after the viewer is ready.
     */
    deferedCalls: null,

    /** api: method[initMap]
     *  :arg config:  ``Object``
     *
     *  Is intended to be overriden in inheriting classes.
     */
    initMap: function() { },

    /** private: method[adaptConfig]
     *  :arg config: ``Object`` the map config
     *
     *  Adapts the config before creating the map.
     */
    adaptConfig: function(config) {
        var userConfig = this.userConfig;

        // adapt the controls array in the config based
        // on the user config
        function getBy(array, property, match) {
            var test = (typeof match.test == "function");
            var found = OpenLayers.Array.filter(array, function(item) {
                return item[property] == match ||
                    (test && match.test(item[property]));
            });
            return found;
        }
        var switcher = getBy(config.controls, "CLASS_NAME",
            'OpenLayers.Control.LayerSwitcher')[0];
        if (!userConfig.addLayerSwitcher && switcher) {
            OpenLayers.Util.removeItem(config.controls, switcher);
        }
        var overview = getBy(config.controls, "CLASS_NAME",
            'OpenLayers.Control.OverviewMap')[0];
        if (!userConfig.addMiniMap && overview) {
            OpenLayers.Util.removeItem(config.controls, overview);
        }
        var mousePos = getBy(config.controls, "CLASS_NAME",
            'OpenLayers.Control.MousePosition')[0];
        if (!userConfig.showCoords && mousePos) {
            OpenLayers.Util.removeItem(config.controls, mousePos);
        }

        // adapt the layers array in the config based on
        // the user config
        function getLayerByRef(ref) {
            var i, j, layer, layerArgs, layers = config.layers;
            for (i = 0; i < layers.length; ++i) {
                layer = layers[i];
                layerArgs = layer.args;
                if (layerArgs) {
                    for (j = 0; j < layerArgs.length; ++j) {
                        if (layerArgs[j].ref == ref) {
                            return layer;
                        }
                    }
                }
            }
        }
        if (userConfig.backgroundLayers) {
            var i,
                layerRefs = userConfig.backgroundLayers,
                layer, layers = [];
            for (i = 0; i < layerRefs.length; ++i) {
                layer = getLayerByRef(layerRefs[i]);
                if (layer) {
                    layers.push(layer);
                }
            }
            config.layers = layers;
        }
    },

    /** api: method[adaptConfigForViewer]
     *  :arg config: ``Object`` the map config
     *  :returns: ``Object`` The new config to be used for the map option of the
     *      viewer
     *
     *  Convenience method to add some required options to mapConfig before
     *  using it to create a viewer.
     */
    adaptConfigForViewer: function(config) {
        var newConfig = OpenLayers.Util.extend({}, config);
        OpenLayers.Util.extend(newConfig , this.userConfig);

        // we use the dom id also to give an id to the mappanel
        // in the viewer
        newConfig.id = this.userConfig.div + "-map";
        newConfig.tbar = [];

        this.adaptConfig(newConfig);

        // if backgroundLayers is set we reverse the layers
        // array for the layer order to match what the user
        // provided.
        if (newConfig.backgroundLayers) {
            newConfig.layers.reverse();
        }

        return newConfig;
    },

    /** api: method[onViewerReady]
     *  :arg viewer: ``GXP.widgets.Viewer`` the viewer
     *
     *  Method to be called as GXP.widgets.Viewer ready event callback.
     */
    onViewerReady: function(viewer) {
        var i;
        this.map = viewer.mapPanel.map;

        var config = this.userConfig;

        // viewer mappanel works with alloverlays, then we don't want the base
        // layers to appear in the layerSwitcher
        for (i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.displayInLayerSwitcher = false;
        }
        this.addOverlayLayers(this.userConfig.overlays);
        this.onMapCreated();
        for (i = 0; i < this.deferedCalls.length; i++) {
            this.deferedCalls[i]();
        }
    },

    /** api: method[initMapFromConfig]
     *  :arg config: ``Object``
     *
     *  Convenience method to create a map from a config.
     */
    initMapFromConfig: function(config) {
        this.adaptConfig(config);

        var i;
        for (i = 0; i < config.layers.length; i++) {
            var layer = config.layers[i];
            config.layers[i] = this.createBaseLayerFromConfig(layer);
            config.layers[i].opacity = 1;
        }

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
        if (config.miniMapExpanded) {
            overview && overview.maximizeControl();
        }

        this.createQueryControl();

        if (!this.map.getCenter()) {
            this.map.zoomToMaxExtent();
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
     * :arg layer: ``String`` The name of the layer to add.
     * :arg external: ``Boolean`` Whether it is an external layer or not.
     */
    createOverlayLayer: function(layer, external) {
        var params = {
            layers: layer,
            format: 'image/png',
            transparent: true
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

    /** api: method[recenter]
     *  :arg center: ``Array(Number)`` Center coordinates
     *  :arg zoom: ``Number``
     */
    recenter: function(center, zoom) {
        if (!this.map) {
            this.deferedCalls.push(
                OpenLayers.Function.bind(this.recenter, this, center, zoom));
            return;
        }
        this.map.setCenter(new OpenLayers.LonLat(center[0], center[1]), zoom);
    },

    /** api: method[recenterOnObjects]
     *  :arg layer: ``String`` The layer name
     *  :arg ids: ``Array(String)`` The ids of the feature to recenter on.
     *  :arg highlight: ``Boolean`` Tells whether to hilight the features or not.
     *      Defaults to false.
     */
    recenterOnObjects: function(layer, ids, highlight) {
        if (!this.map) {
            this.deferedCalls.push(
                OpenLayers.Function.bind(this.recenterOnObjects, this, layer, ids, highlight));
            return;
        }
        highlight = !!highlight;
        var protocol = new OpenLayers.Protocol.Script({
            url: this.wmsURL,
            format: new OpenLayers.Format.GML()
        });

        var featureIds = [];
        for (var i = 0; i < ids.length; i++) {
            featureIds.push(layer + '.' + ids[i]);
        }
        var params = {
            service: 'WFS',
            request: 'getfeature',
            version: '1.0.0',
            typename: layer,
            featureid: featureIds.join(','),
            maxFeatures: ids.length
        };
        var response = protocol.read({
            params: params,
            callback: function(result) {
                if(result.success()) {
                    if(result.features.length) {
                        var bounds = new OpenLayers.Bounds();
                        for (var i = 0; i < result.features.length; i++) {
                            bounds.extend(result.features[i].geometry.getBounds());
                            if (highlight) {
                                this.getVectorLayer().addFeatures(
                                    [result.features[i]]);
                            }
                        }
                        this.map.zoomToExtent(bounds);
                    }
                }
            },
            scope: this
        });
    },

    /** api: method[addMarker]
     *  :arg options: ``Object`` List of marker options
     */
    addMarker: function(options) {
        if (!this.map) {
            this.deferedCalls.push(
                OpenLayers.Function.bind(this.addMarker, this, options));
            return;
        }
        options = options || {};
        var lonlat = (options.position) ?
            new OpenLayers.LonLat(options.position[0], options.position[1]) :
            this.map.getCenter();

        var path = options.icon || (OpenLayers.Util.getImagesLocation() + 'marker.png');
        var width = options.size && options.size[0] || 21;
        var height = options.size && options.size[1] || 25;

        var style = OpenLayers.Util.applyDefaults({
            externalGraphic: path,
            graphicWidth: width,
            graphicHeight: height,
            graphicXOffset: -width/2,
            graphicYOffset: -height/2,
            graphicOpacity: 1
        }, OpenLayers.Feature.Vector.style['default']);

        this.getVectorLayer().addFeatures([
            new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
                null,
                style
            )
        ]);
    },

    /** private: method[getVectorLayer]
     */
    getVectorLayer: function() {
        if (!this.vectorLayer) {
            this.vectorLayer = new OpenLayers.Layer.Vector("Vector", {
                displayInLayerSwitcher: false
            });
            this.map.addLayer(this.vectorLayer);
        }

        return this.vectorLayer;
    },

    /** private: method[createQueryControl]
     */
    createQueryControl: function() {
        var map = this.map,
            queryableLayers = this.queryableLayers || [];

        var protocol = new OpenLayers.Protocol.Script({
            url: this.wmsURL,
            format: new OpenLayers.Format.WMSGetFeatureInfo(),
            filterToParams: function (params) {
                var layers = map.layers;
                var layerNames = [];
                for (var i = 0, len = layers.length; i < len; i++) {
                    var layer = layers[i];
                    if (layer instanceof OpenLayers.Layer.WMS &&
                        layer.getVisibility() &&
                        layer.params.LAYERS != null) {
                        for (var j = 0; j < queryableLayers.length; j++) {
                            if (layer.params.LAYERS.indexOf(queryableLayers[j]) != -1){
                                layerNames.push(queryableLayers[j]);
                            }
                        }
                    }
                }

                if (layerNames.length != 0) {
                    return {
                        service: "WMS",
                        version: "1.1.1",
                        request: "GetFeatureInfo",
                        bbox: map.getExtent().toBBOX(),
                        feature_count: 1,
                        height: map.getSize().h,
                        width: map.getSize().w,
                        info_format: "application/vnd.ogc.gml",
                        srs: map.getProjection(),
                        x: params.xy.x,
                        y: params.xy.y,
                        layers: layerNames,
                        query_layers: layerNames,
                        styles: 'default'
                    }
                }
            }
        });
        var click = new cgxp.api.Click({
            protocol: protocol
        });
        this.map.addControl(click);
        click.activate();
        click.events.on({
            featureselected: function(obj) {
                this.showPopup(obj.feature, obj.event.xy);
            },
            scope: this
        });
    },

    /** private: method[showPopup]
     *  :arg feature: ``OpenLayers.Feature.Vector``
     *  :arg position: ``OpenLayers.Pixel``
     */
    showPopup: function(feature, position) {
        var detail = [],
            attributes = feature.attributes;
        detail.push('<table class="detail">');
        var hasAttributes = false;
        for (var k in attributes) {
            if (attributes.hasOwnProperty(k) && attributes[k]) {
                hasAttributes = true;
                detail = detail.concat([
                    '<tr>',
                    '<th>',
                    OpenLayers.i18n(k),
                    '</th>',
                    '<td>',
                    attributes[k],
                    '</td>',
                    '</tr>'
                ]);
            }
        }
        detail.push('</table>');
        var popup = new OpenLayers.Popup.FramedCloud(
            "featurePopup",
            this.map.getLonLatFromPixel(position),
            null,
            detail.join(''),
            null,
            true,
            null // on close
        );
        this.map.addPopup(popup);
    },

    /** api: method[addCustomLayer]
     *  :arg layerType: ``String`` A text description of the layer format
     *      (either "text" or "gpx")
     *  :arg layerName: ``String`` A text description for the layer
     *  :arg layerUrl: ``String`` The url the file to load
     *  :arg options: ``Object`` Optional (only if layerType="gpx") styling
     *      properties (ie. strokeColor, strokeWidth, strokeOpacity)
     */
    addCustomLayer: function (layerType, layerName, layerUrl, options) {
        if (!this.map) {
            this.deferedCalls.push(
                OpenLayers.Function.bind(this.addCustomLayer, this,
                    layerType, layerName, layerUrl, options));
            return;
        }
        options = options || {};

        if (layerType=="gpx") {
            var protocol = new OpenLayers.Protocol.HTTP({
                url: layerUrl,
                format: new OpenLayers.Format.GPX({
                    externalProjection: new OpenLayers.Projection("EPSG:4326"),
                    internalProjection: this.map.getProjection()
                })
            });
            protocol.read({
                callback: function(result) {
                    if(result.success()) {
                        var features = result.features;
                        if(features.length) {
                            for (var i = 0; i < features.length; i++) {
                                features[i].style = OpenLayers.Util.applyDefaults({
                                    strokeColor: options.strokeColor || 'red',
                                    strokeWidth: options.strokeWidth || 3,
                                    strokeOpacity: options.strokeOpacity || 0.8
                                }, OpenLayers.Feature.Vector.style['default']);
                            }
                            this.getVectorLayer().addFeatures(features);
                            this.map.zoomToExtent(
                                this.getVectorLayer().getDataExtent());
                        }
                    }
                },
                scope: this
            });
        } else if (layerType=="text") {
            var protocol = new OpenLayers.Protocol.HTTP({
                url: layerUrl,
                format: new OpenLayers.Format.Text()
            });
            protocol.read({
                callback: function(result) {
                    if(result.success()) {
                        var features = result.features;
                        this.getVectorLayer().addFeatures(features);
                        this.map.zoomToExtent(
                            this.getVectorLayer().getDataExtent());
                    }
                },
                scope: this
            });
            var control = new OpenLayers.Control.SelectFeature(this.getVectorLayer());

            this.map.addControl(control);
            control.activate();

            var popup;
            function onPopupClose(evt) {
                control.unselectAll();
            }
            function onFeatureSelect(evt) {
                var feature = evt.feature;
                if (feature.attributes.title && feature.attributes.description) {
                    popup = new OpenLayers.Popup.FramedCloud(
                        "featurePopup",
                        feature.geometry.getBounds().getCenterLonLat(),
                        new OpenLayers.Size(200,120),
                        "<b>"+feature.attributes.title + "</b><br />" +
                            feature.attributes.description,
                        null,
                        true,
                        onPopupClose
                    );
                    this.map.addPopup(popup);
                }
            }
            function onFeatureUnselect(evt) {
                if (popup) {
                    popup.destroy();
                    popup = null;
                }
            }
            this.getVectorLayer().events.on({
                'featureselected': OpenLayers.Function.bind(onFeatureSelect, this),
                'featureunselected': OpenLayers.Function.bind(onFeatureUnselect, this),
                'featuresadded': function(obj) {
                    for (var i=0;i<obj.features.length;i++) {
                        var feature = obj.features[i];
                        feature.style.cursor = 'pointer';
                    }
                    this.getVectorLayer().redraw();
                },
                scope: this
            });
        }
    }
};
