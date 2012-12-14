/**
 * Copyright (c) 2012 Camptocamp
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
 * @requires plugins/OSMSource.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = OSMSource
 */

/** api: (extends)
 *  plugins/OSMSource.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: OSMSource(config)
 *
 *    Plugin for using OpenStreetMap layers with :class:`gxp.Viewer` instances.
 *
 *    Available layer names are "mapnik" and "osmarender"
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "osm": {
 *        ptype: "cgxp_osmsource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "osm",
 *        name: "mapnik"
 *        ref: "mapnik",
 *        group: "background"
 *    }
 */
cgxp.plugins.OSMSource = Ext.extend(gxp.plugins.OSMSource, {

    /** api: ptype = cgxp_osmsource */
    ptype: "cgxp_osmsource",

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record = cgxp.plugins.OSMSource.superclass
                         .createLayerRecord.apply(this, arguments);
        if (record) {
            var layer = record.getLayer();
            if (config.group) {
                layer.group = config.group;
            }
            if (config.ref) {
                layer.ref = config.ref;
            }
        }
        return record;
    }
});

Ext.preg(cgxp.plugins.OSMSource.prototype.ptype, cgxp.plugins.OSMSource);
