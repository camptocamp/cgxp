/**
 * Copyright (c) 2012-2014 by Camptocamp SA
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
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = LocationChooser
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a LocationChooser plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *           ptype: "cgxp_locationchooser",
 *           actionTarget: "center.tbar",
 *           locations: {
 *               'Location A': INITIAL_EXTENT,
 *               'Location B': [722421, 5860095, 747129, 5869764],
 *               ...
 *               'Location Z': [616074, 5699359, 714907, 5738036]
 *          }]
 *          ...
 *      });
 *
 *  Note that the "locations" labels are automatically internationalized if
 *  a translation exists in the "Lang" files.
 */

/** api: constructor
 *  .. class:: LocationChooser(config)
 *
 *     Tip: if this tool must be placed in the map.bbar, the bbar must be
 *     initialized in the map object definition: "bbar: []".
 */
cgxp.plugins.LocationChooser = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_locationchooser */
    ptype: "cgxp_locationchooser",

    /* i18n */
    labelText: "Move to",
    tooltipText: "Center the map on a predefined location",

    /** api: config[width]
     *  ``Number``
     *  Combo box width in px.
     */
    width: 100,

    /** api: config[locations]
     *  ``Object``
     *  A key-value ('Label': [b,b,o,x]) object that defines the locations
     */
    locations: {},

    /** private: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        var button = new Ext.Button({
            iconCls: "cgxp-icon-locationchooser",
            tooltip: this.tooltipText,
            text: this.labelText,
            menu: new Ext.menu.Menu({
                cls: 'cgxp-menu-locationchooser'
            })
        });
        this.addMenuItems(button.menu);

        return cgxp.plugins.LocationChooser.superclass.addActions.apply(this, [button]);
    },

    /** private: method[onItemClick]
     */
    onItemClick: function(item, pressed) {
        this.target.mapPanel.map.zoomToExtent(item.cgxpLocation);
    },

    /** private: method[addMenuItems]
     * :arg menu ``Object``
     */
    addMenuItems: function(menu) {
        for (var loc in this.locations) {
            menu.add({
                text: OpenLayers.i18n(loc),
                handler: this.onItemClick,
                cgxpLocation: this.locations[loc],
                scope: this
            });
        }
    }
});

Ext.preg(cgxp.plugins.LocationChooser.prototype.ptype, cgxp.plugins.LocationChooser);
