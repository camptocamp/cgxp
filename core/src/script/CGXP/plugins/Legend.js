/**
 * Copyright (c) 2011-2014 by Camptocamp SA
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
 * @include CGXP/widgets/WMSLegend.js
 * @include CGXP/widgets/LegendImage.js
 * @include GeoExt/widgets/LegendPanel.js
 * @include GeoExt/widgets/UrlLegend.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Legend
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Legend plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_legend',
 *              id: "legendPanel",
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools'
 *          }]
 *          ...
 *      });
 */

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

    /** api: config[actionConfig]
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

    legendPanel: null,
    legendPanelAdded: false,

    /* i18n */
    legendbuttonText: "Legend",
    legendbuttonTooltip: "Display the map legend",

    /** private: method[addActions]
     */
    addActions: function() {
        var legendWin = new cgxp.tool.Window({
            width: 340,
            bodyStyle: 'padding: 5px',
            header: false,
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
                },
                itemXType: 'cgxp_legendimage',
                updateDelay: 2000
            },
            preferredTypes: ['cgxp_wmslegend']
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

        var button = new cgxp.tool.Button(Ext.apply({
            text: this.legendbuttonText,
            tooltip: this.legendbuttonTooltip,
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            window: legendWin
        }, this.actionConfig));
        return cgxp.plugins.Legend.superclass.addActions.apply(this, [button]);
    }

});

Ext.preg(cgxp.plugins.Legend.prototype.ptype, cgxp.plugins.Legend);
