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
 */

/** api: constructor
 *  .. class:: FloorSlider(config)
 *
 */   
cgxp.plugins.FloorSlider = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_floorslider */
    ptype: "cgxp_floorslider",

    /** api: config[minValue]
     *  ``int``
     *  The fist floor value.
     */
    minValue: 0,

    /** api: config[value]
     *  ``int``
     *  The default floor value, default is 0.
     */
    value: 0,

    /** api: config[maxValue]
     *  ``int``
     *  The max floor value.
     */
    maxValue: 10,

    /** api: config[maxMeanAll]
     * ``Boolean``
     * Max value mean all floor, default is true.
     */
    maxMeanAll: true,

    /** api: config[widgetOptions]
     * ``Object``
     * Additional slider options.
     */
    widgetOptions: {},

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        this.target.addListener('ready', function() {
            var mapPanel = this.target.mapPanel;
            var floorSlider = new cgxp.FloorSlider(Ext.apply({
                minValue: this.minValue,
                maxValue: this.maxValue,
                value: this.value,
                maxMeanAll: this.maxMeanAll,
                mapPanel: mapPanel
            }, this.widgetOptions));
        }, this);
    }
});

Ext.preg(cgxp.plugins.FloorSlider.prototype.ptype, cgxp.plugins.FloorSlider);
