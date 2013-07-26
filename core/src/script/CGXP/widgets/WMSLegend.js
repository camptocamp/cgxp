/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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
 * @requires GeoExt/data/PrintProvider.js
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

    /** api: config[defaultStyleIsFirst]
     *  ``Boolean``
     *  If no style can be found for a layer, use a GetLegendGraphic request.
     */
    defaultStyleIsFirst: false,

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
(function() {
    var encoders = GeoExt.data.PrintProvider.prototype.encoders;
    encoders.legends.cgxp_wmslegend = function(cmp, scale) {
        // We need to call the non-deferred version of the "update"
        // function, to deal with the case where the legend panel
        // does not yet include legend images. This effectively
        // happens when the legend panel is not rendered at print
        // time.
        GeoExt.WMSLegend.prototype.update.call(cmp);

        // Add a name for all WMS layers
        var enc = encoders.legends.base.call(this, cmp);
        var icons = [];
        for (var i = 1, len = cmp.items.getCount() ; i < len ; ++i) {
            var url = cmp.items.get(i).url;
            if (url.toLowerCase().indexOf('request=getlegendgraphic') != -1) {
                var split = url.split("?");
                var params = Ext.urlDecode(split[1]);
                if (cmp.useScaleParameter === true) {
                    params['SCALE'] = scale;
                }
                url = split[0] + "?" + Ext.urlEncode(params);
                enc[0].classes.push({
                    name: OpenLayers.i18n(params.LAYER),
                    icons: [this.getAbsoluteUrl(url)]
                });
            }
            else {
                enc[0].classes.push({
                    name: "",
                    icons: [this.getAbsoluteUrl(url)]
                });
            }
        }
        return enc;
    };
})();
