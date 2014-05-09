/**
 * Copyright (c) 2012-2014 by Camptocamp SA
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
 * @requires OpenLayers/Format/GML/v3.js
 */

// Patch OpenLayers to accept curveMembers
// curveMembers will not be part of OpenLayers because it's not part of Simple Features profile
// See: https://github.com/openlayers/openlayers/pull/1323
// Mapserver issue: https://github.com/mapserver/mapserver/issues/4924
OpenLayers.Format.GML.v3.prototype.readers.gml["curveMembers"] = function(node, obj) {
    this.readChildNodes(node, obj);
};
