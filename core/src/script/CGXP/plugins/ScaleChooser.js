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
 *  class = ScaleChooser
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a ScaleChooser plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_scalechooser',
 *              actionTarget: 'center.bbar'
 *          }]
 *          ...
 *      });
 *
 *
 *  If we add:
 *
 *  .. code-block:: javascript
 *
 *              roundValues: [10, 20, 50, 100, 250, 500]
 *
 *  The following scales ``[4, 9, 22, 48, 103, 231, 478, 978]``
 *  will be display as ``[10, 10, 20, 50, 100, 250, 500, 500]``
 *
 *
 *  If we add:
 *
 *  .. code-block:: javascript
 *
 *              roundValues: [1, 2.5, 5, 10],
 *              power10: true
 *
 *  The following scales ``[4, 9, 22, 48, 103, 231, 478, 978]``
 *  will be display as ``[5, 10, 25, 50, 100, 250, 500, 1000]``
 *
 *
 *  If you need something more specific, you can overwrite the
 *  method ``round`` like this:
 *
 *  .. code-block:: javascript
 *
 *      round: function(value) {
 *          // your code
 *      }
 */

/** api: constructor
 *  .. class:: ScaleChooser(config)
 *
 * Tip: if this tool must be placed in the map.bbar, the bbar must be
 * initialized in the map object definition: "bbar: []".
 */
cgxp.plugins.ScaleChooser = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_scalechooser */
    ptype: "cgxp_scalechooser",

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

    /** api: config[scaleStoreListeners]
     *  ``Object``
     *  Ext listener config to be applied on the scale store.
     */
    scaleStoreListeners: {},

    /** api: config[tpl]
     *  ``String``
     *  Ext template to format the scale value in the scale combobox.
     */
    tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',

    /** api: config[roundValues]
     *  ``Array(Number)``
     *  The possible values on witch we want to round.
     *  Defaults to undefined (disabled).
     */

    /** api: config[power10]
     *  ``Boolean``
     *  If ``true``, the possible ``roundValues`` will be multiples of
     *  10, 100, ... of the submitted ``roundValues``.
     *  The latter values should then be contained between 1 and 10
     *  and they should start with 1 and end with 10.
     *
     *  For example if it's ``true`` and ``roundValues`` is ``[1, 2.5, 5, 10]``
     *  than all the possible values are
     *  ``[..., 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 25, 50, 100, ...]``.
     *
     *  Defaults to false.
     */
    power10: false,

    /** api: config[formatValue]
     *  ``Function``
     *  Callback function to format the value of the selected scale in the scale combobox.
     */
    formatValue: function(scale) {
        return "1 : " + parseInt(scale.data.scale);
    },

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        var map = this.target.mapPanel.map;
        var scaleStore = new GeoExt.data.ScaleStore({
            map: map,
            listeners: this.scaleStoreListeners
        });
        scaleStore.addListener('load', this.roundStore, this);
        var zoomSelector = new Ext.form.ComboBox({
            store: scaleStore,
            tpl: this.tpl,
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
                zoomSelector.setValue(this.formatValue(scale));
            } else {
                if (!zoomSelector.rendered) return;
                zoomSelector.clearValue();
            }
        });

        var args = [this.labelText, zoomSelector];

        return cgxp.plugins.ScaleChooser.superclass.addActions.apply(this, [args]);
    },

    /** api: method[roundStore]
     *  :arg store: ``Ext.data.Store``
     *  :arg records: ``Array(Ext.data.Record)``
     *  :arg options: ``Object``
     *
     *  This method is used to round the voll store.
     */
    roundStore: function(store) {
        store.each(function(record) {
            var scale = record.get('scale');
            scale = this.round(scale);
            record.set('scale', scale);
        }, this);
    },

    /** api: method[round]
     *  :arg value: ``Number`` a scale value to round
     *
     *  This method is used to round a scale value.
     */
    round: function(value) {
        if (this.roundValues) {
            var base = 1;
            var rest = value;
            if (this.power10) {
                var log = Math.log(value)/Math.log(10);
                base = Math.pow(10, Math.floor(log));
                rest = value / base;
            }

            var diff = Number.POSITIVE_INFINITY;
            var roundRest = 1;
            for (var i in this.roundValues) {
                var v = this.roundValues[i];
                var d = Math.abs(Math.log(v/rest))
                if (d < diff) {
                    diff = d;
                    roundRest = v;
                }
            }

            return base * roundRest;
        }
        else {
            return value;
        }
    }
});

Ext.preg(cgxp.plugins.ScaleChooser.prototype.ptype, cgxp.plugins.ScaleChooser);
