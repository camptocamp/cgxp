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
/*
 * @requires GeoExt/widgets/LegendImage.js
 */

/** api: (define)
 *  module = cgxp
 *  class = LegendImage
 *
 *  A specific ``GeoExt.LegendImage`` that overrides the ``getImgEl`` method
 *  to add a label to each layer.params.LAYERS legend graphic item.
 */
Ext.namespace("cgxp");

cgxp.LegendImage = Ext.extend(GeoExt.LegendImage, {

    /** private: method[initComponent]
     */
    initComponent: function() {
        cgxp.LegendImage.superclass.initComponent.call(this);
        var name = OpenLayers.i18n(this.itemId);
        if (name == this.itemId && cgxp.plugins.WMSBrowser &&
            this.itemId in cgxp.plugins.WMSBrowser.layer_names) {
            name = cgxp.plugins.WMSBrowser.layer_names[this.itemId];
        }
        this.autoEl = {
            tag: "div",
            children: [{
                tag: 'label',
                cls: 'x-tree-node layerparam-label',
                html: name
            },{
                tag: "img",
                "class": (this.imgCls ? this.imgCls + " " + this.noImgCls : this.noImgCls),
                src: this.defaultImgSrc
            }]
        };
    },

    /** private: method[getImgEl]
     */
    getImgEl: function() {
        if (this.getEl()) {
            return Ext.select('img', false, this.getEl().dom).first();
        } else {
            return false;
        }
    }
});
Ext.reg('cgxp_legendimage', cgxp.LegendImage);
