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
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = ModalDisclaimer
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a ModalDisclaimer plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_modaldisclaimer'
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: ModalDisclaimer(config)
 *
 *      Plugin to add a disclaimers for the layers in a modal window.
 *
 */
cgxp.plugins.ModalDisclaimer = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_modaldisclaimer */
    ptype: "cgxp_modaldisclaimer",

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.ModalDisclaimer.superclass.init.apply(this, arguments);

        this.target.mapPanel.layers.on({
            add: this.onAdd,
            scope: this
        });
    },

    /** private: method[onAdd]
     *  :arg store: ``GeoExt.data.LayerStore`` The layer store
     *  :arg record: ``GeoExt.data.LayerRecord`` The added layer record
     */
    onAdd: function(store, records) {
        var msg = [];
        Ext.each(records, function(record) {
            if (this.target.mapPanel.map.getLayersBy('id', record.id).length > 0) {
                // no need to display the disclaimer again if the layer is
                // already available and simply moved in the layertree.
                return;
            }
            Ext.iterate(record.get('disclaimer'), function(key, value) {
                // the key is the disclaimer message, this avoids duplicated
                // messages
                var html = [
                    '<div class="disclaimer-item">',
                        key,
                    '</div>'
                ].join('');
                msg.push(html);
            }, this);
        }, this);
        if (msg.length > 0) {
            new Ext.Window({
                modal: true,
                html: msg.join('<br />')
            }).show();
        }
    }
});

Ext.preg(cgxp.plugins.ModalDisclaimer.prototype.ptype, cgxp.plugins.ModalDisclaimer);
