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
 *  class = PositionChooser
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a PositionChooser plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *           ptype: "cgxp_positionchooser",
 *           actionTarget: "center.tbar",
 *           positions:{
 *               'location A': INITIAL_EXTENT,
 *               'location B': [722421, 5860095, 747129, 5869764],
 *               ...
 *               'location Z': [616074, 5699359, 714907, 5738036]
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: PositionChooser(config)
 *
 * Tip: if this tool must be placed in the map.bbar, the bbar must be
 * initialized in the map object definition: "bbar: []".
 */
cgxp.plugins.PositionChooser = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_positionchooser */
    ptype: "cgxp_positionchooser",

    /** api: config[labelText]
     *  ``String``
     *  Text shown before the combo box (i18n).
     */
    labelText: "Move to: ",

    /** api: config[emptyText]
     *  ``String``
     *  Text shown in the combo box when empty (i18n).
     */
    emptyText: "Places... ",

    /** api: config[width]
     *  ``Number``
     *  Combo box width in px.
     */
    width: 100,

    /** api: config[tpl]
     *  ``String``
     *  Ext template to format the label value in the position Combo box.
     */
    tpl: '<tpl for="."><div class="x-combo-list-item">{values.label}</div></tpl>',

    /** api: config[positions]
     *  ``Object``
     *  A key-value ('label': [b,b,o,x]) object that define the existante positions
     */
    positions: {},

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        var map = this.target.mapPanel.map;

        var positionStore = new Ext.data.ArrayStore({
            fields: ['label', 'extent'],
            data: this.formatPositions(this.positions)
        });
        
        var positionSelector = new Ext.form.ComboBox({
            store: positionStore,
            tpl: this.tpl,
            editable: false,
            width: this.width,
            mode: 'local',
            emptyText: this.emptyText

        });

        // update extent when new position is selected
        positionSelector.on('select',
            function(combo, record, index) {
                map.zoomToExtent(record.data.extent);
            }
        );

        var args = [this.labelText, positionSelector];

        return cgxp.plugins.PositionChooser.superclass.addActions.apply(this, [args]);
    },

    formatPositions: function(position){
        var data = [];
            for (var pos in this.positions){
                data.push([pos, this.positions[pos]])
            }
            return data
    }   

});

Ext.preg(cgxp.plugins.PositionChooser.prototype.ptype, cgxp.plugins.PositionChooser);
