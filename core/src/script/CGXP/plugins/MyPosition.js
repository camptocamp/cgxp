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
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Point.js
 * @include OpenLayers/Geometry/Polygon.js
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
 *  .. class:: MyPosition(config)
 *
 *    Provides a "My Position" button that tries to recenter on
 *    the user's current position.
 */
cgxp.plugins.MyPosition = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_myposition */
    ptype: "cgxp_myposition",

    /** api: config[recenteringZoom]
     *  ``Number``
     *
     *  Zoomlevel to use when recentering to the user's location. Default is 11. 
     */
    recenteringZoom: 11,

    /** api: config[drawAccuracy]
     *  ``Boolean``
     *
     *  If true, a circle is displayed around the user's position,
     *  showing the accuracy of the geolocation. Default is false. 
     */
    drawAccuracy: false,

    /** api: config[stylePoint]
    * ``Object`` 
    * 
    * Feature style hash to apply to the
    * position marker, default is {pointRadius: 4}.
    */
    stylePoint: {
        pointRadius: 4,
    },

    /** api: config[styleAccuracy]
    * ``Object`` 
    *
    * Feature style hash to apply to the
    * accuracy circle, default is
    * {fillColor: "#f70082", strokeColor: "#f70082", fillOpacity: 0.4}.
    */
    styleAccuracy: {
        fillColor: "#0099ff",
        strokeColor: "#000000",
        strokeWidth: 1,
        fillOpacity: 0.3
    },

    /** i18n */
    actionTooltip: "Recenter to my location",

    /** private: method[addActions]
     */
    addActions: function() {
        if (!('geolocation' in navigator)) return [];

        var map = this.target.mapPanel.map;
        var layer = new OpenLayers.Layer.Vector("Geolocation");
        this.layer = layer
        this.target.on('ready', this.viewerReady, this);
        var circle = new OpenLayers.Feature.Vector(null, {}, this.styleAccuracy);
        var marker = new OpenLayers.Feature.Vector(null, {}, this.stylePoint);
        var button = new Ext.Button({
            tooltip: this.actionTooltip,
            iconCls: 'myposition',
            handler: function() {
                var self = this;
                navigator.geolocation.getCurrentPosition(function(pos) {
                    var position = new OpenLayers.LonLat(pos.coords.longitude,
                                                         pos.coords.latitude);
                    position.transform(new OpenLayers.Projection("EPSG:4326"),
                                       map.getProjectionObject());
                    var center = new OpenLayers.Geometry.Point(position.lon, position.lat);
                    self.layer.removeFeatures([circle, marker]);
                    circle.geometry = new OpenLayers.Geometry.Polygon.createRegularPolygon(
                                      center, pos.coords.accuracy, 64, 0);
                    var nearestZoom = map.getZoomForExtent(circle.geometry.getBounds())
                    var zoom = Math.max(Math.min(self.recenteringZoom, nearestZoom), 1);
                    map.setCenter(position, zoom);
                    if (self.drawAccuracy) {
                        marker.geometry = center;
                        self.layer.addFeatures([circle, marker]);
                    };
                }); 
            },
            scope: this
        });

        return cgxp.plugins.MyPosition.superclass.addActions.apply(this, [button]);
    },

    /** private: method[viewerReady]
    */
    viewerReady: function() {
        this.target.mapPanel.map.addLayer(this.layer);
    }
});

Ext.preg(cgxp.plugins.MyPosition.prototype.ptype, cgxp.plugins.MyPosition);
