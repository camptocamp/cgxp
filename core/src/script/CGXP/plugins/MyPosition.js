/**
 * Copyright (c) 2011-2013 by Lionel Besson, Camptocamp SA
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
 * @requires plugins/Tool.js
 * @include OpenLayers/BaseTypes/LonLat.js
 * @include OpenLayers/Projection.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = MyPosition
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a MyPosition plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_myposition",
 *              actionTarget: "center.tbar"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Help(config)
 *
 *    Provides a "My Position" button that tries to recenter on
 *    the user's current position.
 */
cgxp.plugins.MyPosition = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_myposition */
    ptype: "cgxp_myposition",

    /** api: config[recenteringZoom]
     *  ``Integer``
     *  Zoomlevel to use when recentering to the user's location. Default is 11. 
     */
    recenteringZoom: 11,

    /** i18n */
    actionText: "My position",

    /** api: method[addActions]
     */
    addActions: function() {
        if (!('geolocation' in navigator)) return [];

        var map = this.target.mapPanel.map;
        var button = new Ext.Button({
            tooltip: this.actionText,
            iconCls: 'myposition',
            handler: function() {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    var position = new OpenLayers.LonLat(pos.coords.longitude,
                                                         pos.coords.latitude);
                    position.transform(new OpenLayers.Projection("EPSG:4326"),
                                       map.getProjectionObject());
                    var zoom = Math.max(this.recenteringZoom, map.getZoom());
                    map.setCenter(position, zoom);
                });
            },
            scope: this
        });

        return cgxp.plugins.MyPosition.superclass.addActions.apply(this, [button]);
    }
});

Ext.preg(cgxp.plugins.MyPosition.prototype.ptype, cgxp.plugins.MyPosition);
