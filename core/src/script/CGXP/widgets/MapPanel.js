/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 * @requires GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/Popup.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Point.js
 */

/** api: (define)
 *  module = cgxp
 *  class = MapPanel
 *
 *  A specific ``GeoExt.MapPanel`` that overrides the ``getState`` method
 *  to remove visibility- and opacity-related states from the global
 *  state.
 *
 *  Used state (prefixed with 'map_' in the Permalink):
 *   * x, y, zoom: map context (read - write)
 *   * crosshair: if true defined a point at the center of the screen with
 *                the style: crosshairStyle.
 *   * tooltip: text that will be open in a popup at the center of the screen
 */
Ext.namespace("cgxp");

cgxp.MapPanel = Ext.extend(GeoExt.MapPanel, {

    /** api: property[vectorLayer]
     *  :class:``OpenLayers.Layer.Vector``
     */
    vectorLayer: null,

    /** api: property[crosshairStyle]
     *  ``Object``
     *  The crosshair style
     */
    crosshairStyle: {},

    /** api: property[params]
     *  ``Object``
     *  The layers params, read only.
     */

    /** private: property[initialState]
     */

    /** private: method[initComponent]
     */
    initComponent: function() {
        this.params = {};
        this.stateEvents.push('paramschange');
        this.map = this.map || {};
        this.map.setBaseLayer = function(newBaseLayer) {
            if (newBaseLayer != this.baseLayer) {
                // ensure newBaseLayer is already loaded
                if (OpenLayers.Util.indexOf(this.layers, newBaseLayer) != -1) {

                    var oldResolution = this.getResolution()
                    // preserve center and scale when changing base layers
                    //var center = this.getCachedCenter();
                    var newResolution = OpenLayers.Util.getResolutionFromScale(
                        this.getScale(), newBaseLayer.units
                    );

                    // make the old base layer invisible
                    if (this.baseLayer != null && !this.allOverlays) {
                        this.baseLayer.setVisibility(false);
                    }

                    // set new baselayer
                    this.baseLayer = newBaseLayer;

                    if(!this.allOverlays || this.baseLayer.visibility) {
                        this.baseLayer.setVisibility(true);
                        // Layer may previously have been visible but not in range.
                        // In this case we need to redraw it to make it visible.
                        if (this.baseLayer.inRange === false) {
                            this.baseLayer.redraw();
                        }
                    }

                    // recenter the map
                    if (center != null) {
                        // new zoom level derived from old scale
                        var newZoom = this.getZoomForResolution(
                            newResolution || this.resolution, true
                        );
                        // zoom and force zoom change
                        this.setCenter(center, newZoom, false, oldResolution != newResolution);
                    }

                    this.events.triggerEvent("changebaselayer", {
                        layer: this.baseLayer
                    });
                }
            }
        };
        var result = cgxp.MapPanel.superclass.initComponent.call(this);
        this.map.events.register('changebaselayer', this, this.applyStateOnChangebaselayer);
        // The crosshair should always be on top
        this.map.events.register('addlayer', this, function(event) {
            if (this.vectorLayer) {
                this.map.raiseLayer(this.vectorLayer, 1);
            }
            this.setLayerParams(event.layer, this.params);
        });
        this.addEvents(
            /** private: event[paramschange]
             *  Throws when a param change.
             */
            'paramschange'
        );
    },

    /** private: method[getState]
     *  :return:  ``Object`` The state.
     *
     *  Override the GeoExt.MapPanel getState to remove the OL layers
     *  visibility and opacity state
     */
    getState: function() {
        var state;

        // Ext delays the call to getState when a state event
        // occurs, so the MapPanel may have been destroyed
        // between the time the event occurred and the time
        // getState is called
        if (!this.map) {
            return;
        }

        // record location and zoom level
        var center = this.map.getCenter();
        // map may not be centered yet, because it may still have zero
        // dimensions or no layers
        state = center ? {
            x: center.lon,
            y: center.lat,
            zoom: this.map.getZoom()
        } : {};

        for (param in this.params) {
            state['param_' + param] = this.params[param];
        }

        // record layer visibility and opacity
        // OVERRIDE / REMOVED !

        return state;
    },

    /** private: method[applyState]
     *  :param state: ``Object`` The state to apply.
     *
     *  Override the GeoExt.MapPanel applyState to handle extra parameters
     *  such as map_tooltip and map_crosshair
     */
    applyState: function(state) {
        this.initialState = state;
        cgxp.MapPanel.superclass.applyState.apply(this, arguments);
        if (state.crosshair && state.x && state.y) {
            this.getVectorLayer().addFeatures([
                new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(
                        state.x, state.y
                    ), {},
                    Ext.apply({
                        externalGraphic: OpenLayers.Util.getImagesLocation() +
                            "crosshair.png",
                        graphicWidth: 16,
                        graphicHeight: 16
                    }, this.crosshairStyle)
                )
            ]);
        }
        params = {};
        for (key in state) {

            if (state.hasOwnProperty(key) && key.startsWith &&
                    key.startsWith('param_')) {
                params[key.substring(6)] = state[key]
            }
        }
        this.setParams(params);
    },

    /** private: method[applyStateOnChangebaselayer]
     *
     *  Apply the state on usable base layer
     *  (all Ext and GeoExt events will be too early).
     */
    applyStateOnChangebaselayer: function() {
        if (this.initialState && this.initialState.tooltip &&
                this.map.baseLayer.CLASS_NAME != "OpenLayers.Layer") {
            new GeoExt.Popup({
                location: this.center,
                map: this.map,
                unpinnable: false,
                html: this.initialState.tooltip
            }).show();
            this.initialState = undefined;
        }
    },

    /** private: method[getVectorLayer]
     *  :return:  ``OpenLayers.Layer.Vector`` The vector layer.
     *
     *  Creates a layer to display features if not already existing.
     */
    getVectorLayer: function() {
        if (!this.vectorLayer) {
            this.vectorLayer = new OpenLayers.Layer.Vector('cgxp_marker', {
                displayInLayerSwitcher: false
            });
            this.map.addLayer(this.vectorLayer);
        }
        return this.vectorLayer;
    },

    /** public: method[setParams]
     *  :param params: ``Object`` The new parameters.
     *
     *  Set a parameter on all the layers and fire event with modified params.
     */
    setParams: function(params) {
        var dirty = false;
        for (param in params) {
            if (this.params[param] !== params[param]) {
                this.params[param] = params[param];
                dirty = true;
            }
            else {
                delete params[param];
            }
        }

        if (dirty) {
            Ext.each(this.map.layers, function(layer) {
                this.setLayerParams(layer, params);
            }, this);
            this.fireEvent('paramschange', params);
        }
    },

    /** private: method[setLayerParams]
     *
     *  Set a parameter on the layer.
     */
    setLayerParams: function(layer, params) {
        if (layer.setParams) {
            layer.setParams(params);
        }
        else if (layer.mergeNewParams) { // WMS or WMTS
            layer.mergeNewParams(params);
        }
    }
});

/** api: xtype = cgxp_mappanel */
Ext.reg('cgxp_mappanel', cgxp.MapPanel);
