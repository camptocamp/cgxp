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
 * @requires plugins/Tool.js
 * @include CGXP/widgets/tool/Button.js
 * @include CGXP/widgets/tool/Window.js
 * @include GeoExt/widgets/LegendPanel.js
 * @include GeoExt/widgets/WMSLegend.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Legend
 */

Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Legend(config)
 *
 *    Provides an action that opens a legend panel.
 */
cgxp.plugins.Legend = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_legend */
    ptype: "cgxp_legend",

    /** api: config[toggleGroup]
     *  The group this toggle button is member of.
     */
    toggleGroup: null,

    legendPanel: null,
    legendPanelAdded: false,

    legendbuttonText: "Legend",
    legendbuttonTooltip: "Display the map legend",
    legendwindowTitle: "Legend",

    /** api: method[addActions]
     */
    addActions: function() {
        var legendWin = new cgxp.tool.Window({
            width: 340,
            bodyStyle: 'padding: 5px',
            title: this.legendwindowTitle,
            border: false,
            layout: 'fit',
            autoHeight: false,
            height: 350,
            closeAction: 'hide',
            autoScroll: true,
            cls: 'legend toolwindow'
        }); 

        this.legendPanel = new GeoExt.LegendPanel({
            unstyled: true,
            autoScroll: true,
            defaults: {
                baseParams: {
                    FORMAT: 'image/png'
                }   
            }   
        }); 

        // _gx_legendpanel should be available only when window is open
        legendWin.on({
            'show': function() {
                if (!this.legendPanelAdded) {
                    legendWin.add(this.legendPanel);
                    legendWin.doLayout();
                }   
            },
            scope: this
        });

        var button = new cgxp.tool.Button({
            text: this.legendbuttonText,
            tooltip: this.legendbuttonTooltip,
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            window: legendWin
        });
        return cgxp.plugins.Legend.superclass.addActions.apply(this, [button]);
    }

});

Ext.preg(cgxp.plugins.Legend.prototype.ptype, cgxp.plugins.Legend);
