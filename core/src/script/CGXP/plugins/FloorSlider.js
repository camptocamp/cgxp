/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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
 * @requires plugins/Tool.js
 * @include CGXP/widgets/FloorSlider.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FloorSlider
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a FloorSlider plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_floorslider',
 *              minValue: -2,
 *              maxValue: 4
 *          }]
 *          ...
 *      });
 *
 *  When the floor is changed if it exists `setFloor(floor)` is called
 *  on OpenLayers layers, or a floor parameter is changed for
 *  layers with parameters (WMS and WMTS).
 *
 *  Mapserver layers should be ready to receive a floor parameters
 *  in the query string, then add the following code in the where
 *  close of your query (your table should have a floor column):
 *
 *  .. code-block:: none
 *
 *      (floor = %floor% OR %floor% IS NULL OR floor IS NULL) AND ...
 *
 *  and add in the METADATA section:
 *
 *  .. code-block:: none
 *
 *      "default_floor" "NULL"
 *      "floor_validation_pattern" "^-?[0-9]$"
 *
 */

/** api: constructor
 *  .. class:: FloorSlider(config)
 *
 */
cgxp.plugins.FloorSlider = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_floorslider */
    ptype: "cgxp_floorslider",

    /** api: config[minValue]
     *  ``Number``
     *  The fist floor value.
     */
    minValue: 0,

    /** api: config[value]
     *  ``Number``
     *  The default floor value, default is 0.
     */
    value: 0,

    /** api: config[maxValue]
     *  ``Number``
     *  The max floor value.
     */
    maxValue: 10,

    /** api: config[maxIsSky]
     *  ``Boolean``
     *  If set to ``true`` the label for the slider's max value will be
     *  the value of the ``skyText`` config option,
     *  and no floor param will be set in the query string of requests.
     *  Default is ``true``.
     */
    maxIsSky: true,

    /** api: config[widgetOptions]
     *  ``Object``
     *  Additional slider options.
     *  See `CGXP.FloorSlider <../widgets/FloorSlider.html>`_.
     */
    widgetOptions: {},

    /** private: property[floorSlider]
     *  ``cgxp.FloorSlider``
     *  The FloorSlider widget
     */

    /** public: method[init]
     */
    init: function() {
        cgxp.plugins.FloorSlider.superclass.init.apply(this, arguments);
        this.target.addListener('ready', function() {
            var mapPanel = this.target.mapPanel;
            this.floorSlider = new cgxp.FloorSlider(Ext.apply({
                minValue: this.minValue,
                maxValue: this.maxValue,
                value: this.value,
                maxIsSky: this.maxIsSky,
                mapPanel: mapPanel
            }, this.widgetOptions));
        }, this);
    },

    /** public: method[getFloor]
     *  Get the current floor, ``undefined`` for sky.
     */
    getFloor: function() {
        return this.floorSlider.getFloor();
    }
});

Ext.preg(cgxp.plugins.FloorSlider.prototype.ptype, cgxp.plugins.FloorSlider);
