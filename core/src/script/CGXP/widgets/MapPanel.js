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
 */
Ext.namespace("cgxp");

cgxp.MapPanel = Ext.extend(GeoExt.MapPanel, {

    /** api: property[vectorLayer]
     *  :class:`OpenLayers.Layer.Vector`
     */
    vectorLayer: null,

    /** private: property[initialState]
     */

    /** private: method[initComponent]
     */
    initComponent: function() {
        var result = cgxp.MapPanel.superclass.initComponent.call(this);
        this.map.events.register('changebaselayer', this, this.applyStateOnRender);
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
        if(!this.map) {
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
                    )
                )
            ]);
        }
    },

    /** private: method[applyStateOnRender]
     *
     *  Apply the state on render event
     */
    applyStateOnRender: function() {
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
    }
});

/** api: xtype = cgxp_mappanel */
Ext.reg('cgxp_mappanel', cgxp.MapPanel);

