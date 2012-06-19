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
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/WMTS.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = WMTSSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: WMTSSource(config)
 *
 */
cgxp.plugins.WMTSSource = Ext.extend(gxp.plugins.LayerSource, {

    /** api: ptype = cgxp_wmtssource */
    ptype: "cgxp_wmtssource",

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        
        if (Ext.isArray(config.args)) {
            config.args = config.args[0];
        }
        var layer = new cgxp.layers.WMTS(config.args);

        // apply properties that may have come from saved config
        if ("visibility" in config) {
            layer.visibility = config.visibility;
        }   
    
        // create a layer record for this layer
        var Record = GeoExt.data.LayerRecord.create([
            {name: "name", type: "string"},
            {name: "source", type: "string"}, 
            {name: "group", type: "string"},
            {name: "fixed", type: "boolean"},
            {name: "selected", type: "boolean"},
            {name: "args"}
        ]); 
        var data = { 
            layer: layer,
            title: layer.name,
            name: config.name || layer.name,
            source: config.source,
            group: config.group,
            fixed: ("fixed" in config) ? config.fixed : false,
            selected: ("selected" in config) ? config.selected : false,
            args: config.args,
            properties: ("properties" in config) ? config.properties : undefined
        };  
        return new Record(data, layer.id);
    },

    /** api: method[getConfigForRecord]
     *  :arg record: :class:`GeoExt.data.LayerRecord`
     *  :returns: ``Object``
     *
     *  Create a config object that can be used to recreate the given record.
     */
    getConfigForRecord: function(record) {
        // get general config
        var config = cgxp.plugins.WMTSSource.superclass.getConfigForRecord.apply(this, arguments);
        // add config specific to this source
        var layer = record.getLayer();
        return Ext.apply(config, {
            args: record.get("args")
        });
    }
});

Ext.preg(cgxp.plugins.WMTSSource.prototype.ptype, cgxp.plugins.WMTSSource);

/** api: (define)
 *  module = cgxp.layers
 *  class = WMTS
 */
Ext.namespace("cgxp.layers");

/** api: constructor
 *  .. class:: WMTS(config)
 *
 */
cgxp.layers.WMTS = OpenLayers.Class(OpenLayers.Layer.WMTS, {

    /** 
     * APIProperty: url
     * {String|Array(String)} The base URL or request URL template for the WMTS
     * service when zoomlevel threshold is reached.
     */
    secondaryUrl: null,

    /** 
     * APIProperty: zoomThreshold
     * Max zoomlevel for using standard base url. Above this zoomlevel, the
     * secondaryUrl is used as base url.
     */
    zoomThreshold: null,

    getURL: function(bounds) {
        if (this.secondaryUrl && this.zoomThreshold &&
            this.map.getZoom() > this.zoomThreshold) {
            var standardUrl = this.url;
            this.url = this.secondaryUrl;
            var url = OpenLayers.Layer.WMTS.prototype.getURL.apply(this, [bounds]);
            this.url = standardUrl;
            return url;
        }   
    
        return OpenLayers.Layer.WMTS.prototype.getURL.apply(this, [bounds]);
    }   
});
