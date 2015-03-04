/**
 * Copyright (c) 2011-2014 by Camptocamp SA
 *
 * CGXP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CGXP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Namespace: AutoProjection
 */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 * @requires OpenLayers/Util.js
 * @include OpenLayers/Map.js
 */

OpenLayers.AutoProjection = OpenLayers.Class({
    initialize: function(config) {
        this.buildProjectionList(config.projectionCodes);
        if (config.map === undefined){
            this.restrictedExtent = config.restrictedExtent;
            this.projection = config.projection;
        } else {
            this.restrictedExtent = config.map.restrictedExtent;
            this.projection = config.map.projection;
        }
        if (this.restrictedExtent === null){
            this.restrictedExtent = new OpenLayers.Bounds(Number.MIN_VALUE,
                                                          Number.MIN_VALUE,
                                                          Number.MAX_VALUE,
                                                          Number.MAX_VALUE);
        }
    },

    /** private: property[projections]
     *  List of OpenLayers.Projection object
     *  used to reproject some coordinates. It's based
     *  on projectionCodes
     */
    projections: null,

    /** private: method[buildProjectionList]
     *  :arg config: ``Object`` the object containing projection Codes
     *
     *  Take a list of projection codes in config.projectionCodes
     *  and fill the projections dictionary with Openlayers.Projection
     *  objects.
     */
    buildProjectionList: function(projectionCodes){
        this.projections = [];
        if (!projectionCodes) {
            return;
        }
        for (var i = 0, ln = projectionCodes.length, code; i < ln; i++) {
            code = String(projectionCodes[i]).toUpperCase();
            if (code.substr(0, 5) != "EPSG:") {
                code = "EPSG:" + code;
            }
            this.projections[i] = new OpenLayers.Projection(code);
        }
        return;
    },

    /** public: method[tryProjection]
     *  :arg point: ``Array`` point to project
     *  :arg map: ``Object`` the map object
     *
     *  It projects the point using the projection list 
     *  and finds the first one for which it falls
     *  inside of the restricted Extent.
     */
    tryProjection: function(point) {
        if (this.projections.length === 0) {
            this.projections = [this.projection];
        }
        for (var i=0; i < this.projections.length; ++i) {
            var projection = this.projections[i];
            var position = new OpenLayers.LonLat(point[0], point[1]);
            position.transform(projection, this.projection);
            if (this.restrictedExtent.containsLonLat(position)) {
                return [position.lon, position.lat];
            }
        }
        return null;
    },

    CLASS_NAME: "OpenLayers.AutoProjection"
});
