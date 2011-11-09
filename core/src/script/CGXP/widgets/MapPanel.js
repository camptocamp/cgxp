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
 */

Ext.namespace("cgxp_mappanel");

cgxp.MapPanel = Ext.extend(GeoExt.MapPanel, {

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
    }
});

/** api: xtype = cgxp_mappanel */
Ext.reg('cgxp_mappanel', cgxp.MapPanel);

