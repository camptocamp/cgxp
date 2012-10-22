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
 * @requires GeoExt/widgets/WMSLegend.js
 * @include OpenLayers/Layer/WMS.js
 */

/** api: (define)
 *  module = cgxp
 *  class = WMSLegend
 *
 *  A specific ``GeoExt.WMSLegend`` that defers legend updates. The
 *  objective is to give priority to map image requests.
 */
Ext.namespace("cgxp");


cgxp.WMSLegend = Ext.extend(GeoExt.WMSLegend, {

    /** api: config[updateDelay]
     *  ``Number``
     *  Set to a positive number to defer legend updates. Defaults
     *  is 0.
     */
    updateDelay: 0,

    /** private: method[initComponent]
     *  Initialized the WMS legend.
     */
    initComponent: function() {
        if (this.updateDelay > 0) {
            this.update = this.deferredUpdate();
        }
        cgxp.WMSLegend.superclass.initComponent.call(this);
    },

    /** private: deferredUpdate
     *  Decorate the prototype's update function to defer calls
     *  to this.update.
     *  :return: ``Function``
     */
    deferredUpdate: function() {
        var originalUpdate = this.update;
        return function() {
            if (this._timeoutId) {
                window.clearTimeout(this._timeoutId);
            }
            this._timeoutId = window.setTimeout(function() {
                delete this._timeoutId;
                originalUpdate.apply(this, arguments);
            }.createDelegate(this), this.updateDelay);
        }.createDelegate(this);
    },

    beforeDestroy: function() {
        if (this._timeoutId) {
            window.clearTimeout(this._timeoutId);
            delete this._timeoutId;
        }
        cgxp.WMSLegend.superclass.beforeDestroy.call(this);
    }
});

/** private: method[supports]
 *  Private override
 */
cgxp.WMSLegend.supports = function(layerRecord) {
    return layerRecord.getLayer() instanceof OpenLayers.Layer.WMS ? 1 : 0;
};

/** api: legendtype = cgxp_wmslegend */
GeoExt.LayerLegend.types.cgxp_wmslegend = cgxp.WMSLegend;

/** api: xtype = cgxp_wmslegend */
Ext.reg('cgxp_wmslegend', cgxp.WMSLegend);

/**
 * Register cgxp_wmslegend as a legends encoder.
 */
GeoExt.data.PrintProvider.prototype.encoders.legends.cgxp_wmslegend =
    GeoExt.data.PrintProvider.prototype.encoders.legends.gx_wmslegend;
