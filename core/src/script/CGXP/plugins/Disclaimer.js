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
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Disclaimer
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Disclaimer plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_disclaimer',
 *              outputTarget: 'map'
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Disclaimer(config)
 *
 *      Plugin to add a disclaimers for the layers in the map. Should
 *      be used with an ``outputTarget``.
 *
 */
cgxp.plugins.Disclaimer = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_disclaimer */
    ptype: "cgxp_disclaimer",

    /** private: property[disclaimers]
     *  ``Object`` Object that keeps track of all current disclaimers
     */
    disclaimers: null,

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.Disclaimer.superclass.init.apply(this, arguments);

        this.disclaimers = {};
        this.target.mapPanel.layers.on({
            add: this.onAdd,
            remove: this.onRemove,
            scope: this
        });
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        config = Ext.apply({
            xtype: 'container',
            style: {
                'z-index': this.target.mapPanel.map.Z_INDEX_BASE.Control
            },
            cls: 'disclaimer-ct'
        }, config || {});
        return cgxp.plugins.Disclaimer.superclass.addOutput.call(
            this, config);
    },

    /** private: method[addDisclaimer]
     *  :arg msg: ``String`` The disclaimer message
     */
    addDisclaimer: function(msg) {
        var html = [
            '<div class="disclaimer-item">',
                '<div class="x-tool x-tool-close">&nbsp;</div>',
                msg,
            '</div>'
        ].join('');

        return Ext.DomHelper.append(
            this.output[0].getEl(),
            {html: html},
            true
        ).slideIn('t');
    },

    /** private: method[removeDisclaimer]
     *  :arg msg: ``String`` The disclaimer message
     */
    removeDisclaimer: function(msg) {
        var d = this.disclaimers[msg];
        if (d && d.elt) {
            d.elt.slideOut('t', {remove: true});
            d.elt = null;
        }
    },

    /** private: method[onAdd]
     *  :arg store: ``GeoExt.data.LayerStore`` The layer store
     *  :arg record: ``GeoExt.data.LayerRecord`` The added layer record
     */
    onAdd: function(store, records) {
        Ext.each(records, function(record) {
            if (this.target.mapPanel.map.getLayersBy('id', record.id).length > 0) {
                // no need to display the disclaimer again if the layer is
                // already available and simply moved in the layertree.
                return;
            }
            var d = record.get('disclaimer');
            Ext.iterate(d, function(key, value) {
                if (!this.disclaimers[key]) {
                    this.disclaimers[key] = {
                        nb: 0,
                        elt: null
                    };
                }
                var disclaimer = this.disclaimers[key];
                disclaimer.nb++;
                if (!disclaimer.elt) {
                    disclaimer.elt = this.addDisclaimer(key);
                    disclaimer.elt.select('.x-tool-close').on(
                        'click',
                        this.removeDisclaimer.createDelegate(this, [key]),
                        this);
                }
            }, this);
        }, this);
    },


    /** private: method[onRemove]
     *  :arg store: ``GeoExt.data.LayerStore`` The layer store
     *  :arg record: ``GeoExt.data.LayerRecord`` The removed layer record
     */
    onRemove: function(store, record) {
        var d = record.get('disclaimer');
        Ext.iterate(d, function(key, value) {
            if (this.disclaimers[key]) {
                if (--this.disclaimers[key].nb === 0) {
                    this.removeDisclaimer(key);
                }
            }
        }, this);
    }
});

Ext.preg(cgxp.plugins.Disclaimer.prototype.ptype, cgxp.plugins.Disclaimer);
