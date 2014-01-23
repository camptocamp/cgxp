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

// Not relay true, but works well for the docs.
/** api: (define)
 *  module = CGXP
 *  class = Global
 */
Ext.namespace("cgxp");

/** api: config[cgxp.WFS_FEATURE_NS]
 *  ``String``
 *  WFS namespace, depends of the backend used, default is for Mapserver.
 */
cgxp.WFS_FEATURE_NS = "http://mapserver.gis.umn.edu/mapserver";

/** api: config[cgxp.LEGEND_INCLUDE_LAYER_NAME]
 *  ``Boolean``
 *  False to don't include legend name, useful for QGIS server who
 *  already incude it in the legend.
 *  Default is true.
 */
cgxp.LEGEND_INCLUDE_LAYER_NAME = true;
