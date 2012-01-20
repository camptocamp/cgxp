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

/*
 * @requires plugins/Tool.js
 * @include GeoExt/data/ScaleStore.js
 */

/*
 * Code based on http://api.geoext.org/1.1/examples/zoom-chooser.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = ScaleCombo
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: ScaleCombo(config)
 *
 * Tip: if this tool must be placed in the map.bbar, the bbar must be
 * initialized in the map object definition: "bbar: []".
 */   
cgxp.plugins.ScaleCombo = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_scalecombo */
    ptype: "cgxp_scalecombo",

    /** api: config[labelText]
     *  ``String``
     *  Text shown before the combo box (i18n).
     */
    labelText: "Zoom to: ",

    /** api: config[width]
     *  ``Integer``
     *  Combo box width in px.
     */
    width: 100,

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        var map = this.target.mapPanel.map;
        var scaleStore = new GeoExt.data.ScaleStore({map: map});
        var zoomSelector = new Ext.form.ComboBox({
            store: scaleStore,
            tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',
            editable: false,
            width: this.width,
            triggerAction: 'all', // needed so that the combo box doesn't filter by its current content
            mode: 'local'
        });
        
        // update zoom level when new scale is selected
        zoomSelector.on('select', 
            function(combo, record, index) {
                map.zoomTo(record.data.level);
            },
            this
        );

        // update combo value when map is zoomed
        map.events.register('zoomend', this, function() {
            var scale = scaleStore.queryBy(function(record){
                return this.map.getZoom() == record.data.level;
            });
    
            if (scale.length > 0) {
                scale = scale.items[0];
                zoomSelector.setValue("1 : " + parseInt(scale.data.scale));
            } else {
                if (!zoomSelector.rendered) return;
                zoomSelector.clearValue();
            }
        });

        var args = [this.labelText, zoomSelector];
        
        return cgxp.plugins.ScaleCombo.superclass.addActions.apply(this, [args]);
    }
});

Ext.preg(cgxp.plugins.ScaleCombo.prototype.ptype, cgxp.plugins.ScaleCombo);

