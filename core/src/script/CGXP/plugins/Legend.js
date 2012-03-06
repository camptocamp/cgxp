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

/**
 * @requires CGXP/plugins/Panel.js
 * @include GeoExt/widgets/LegendPanel.js
 * @include GeoExt/widgets/WMSLegend.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Legend
 */

/** api: (extends)
 *  cgxp/plugins/Panel.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Legend(config)
 *
 *    Provides an action that opens a legend panel.
 */
cgxp.plugins.Legend = Ext.extend(cgxp.plugins.Panel, {

    /** api: ptype = cgxp_legend */
    ptype: "cgxp_legend",

    buttonText: "Legend",
    buttonTooltipText: "Display the map legend",
    titleText: "Legend",
    outputConfig: {
        bodyCssClass: 'legend',
        width: 300,
        defaults: {
            autoScroll: true
        }
    },

    /** api: method[addOutput]
     */
    addOutput: function() {
        return cgxp.plugins.Legend.superclass.addOutput.call(this, 
            new GeoExt.LegendPanel({
                unstyled: true,
                autoScroll: true,
                defaults: {
                    baseParams: {
                        FORMAT: 'image/png'
                    }
                } 
            })
        );
    }
});

Ext.preg(cgxp.plugins.Legend.prototype.ptype, cgxp.plugins.Legend);
