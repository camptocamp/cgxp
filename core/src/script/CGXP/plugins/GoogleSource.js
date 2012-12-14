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
 * @requires plugins/GoogleSource.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = GoogleSource
 */

/** api: (extends)
 *  plugins/GoogleSource.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: GoogleSource(config)
 *
 *    Plugin for using Google layers with :class:`gxp.Viewer` instances. The
 *    plugin uses the GMaps v3 API and also takes care of loading the
 *    required Google resources.
 *
 *    Available layer names for this source are "ROADMAP", "SATELLITE",
 *    "HYBRID" and "TERRAIN"
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "google": {
 *        ptype: "cgxp_google"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "google",
 *        name: "TERRAIN",
 *        ref: "google_terrain",
 *        group: "background"
 *    }
 */
cgxp.plugins.GoogleSource = Ext.extend(gxp.plugins.GoogleSource, {

    /** api: ptype = cgxp_googlesource */
    ptype: "cgxp_googlesource",

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record = cgxp.plugins.GoogleSource.superclass
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

Ext.preg(cgxp.plugins.GoogleSource.prototype.ptype, cgxp.plugins.GoogleSource);
