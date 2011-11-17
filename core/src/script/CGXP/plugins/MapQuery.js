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

/*
 * @requires plugins/Tool.js
 * @includes OpenLayers/Control/WMSGetFeatureInfo.js
 * @includes OpenLayers/Request.js
 * @includes GeoExt/Action.js
 * @includes GeoExt/Popup.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = MapQuery
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: MapQuery(config)
 *
 */   
cgxp.plugins.MapQuery = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_mapquery */
    ptype: "cgxp_mapquery",

    popup: null,

    /** api: method[addActions]
     */
    addActions: function() {        
        var options = Ext.apply({
            allowDepress: true,
            enableToggle: true,
            iconCls: 'info',
            tooltip: OpenLayers.i18n("Query.actiontooltip"),
            toggleGroup: this.toggleGroup,
            control: this.createControl(this.layerName, this.htmlTemplate),
            alwaysActive: false            
        }, this.options);
        if (options.alwaysActive) {
            var control = this.createControl(this.layerName, this.htmlTemplate);
            control.activate();
            return;
        } 
        var action = new GeoExt.Action(options);
        return cgxp.plugins.MapQuery.superclass.addActions.apply(this, [[action]]);         
    },

    /** api: method[getPopupHtml]
     */
    getPopupHtml: function(features) {
        var html = '';
        for (var i=0; i<features.length; i++) {
            var htmlf = this.htmlTemplate;
            for (a in features[i].attributes) {
                htmlf = htmlf.replace('%' + a + '%', features[i].attributes[a]);
            }
            html += htmlf;
        }
        return html;
    },

    /**
     * api: method[createControl]
     * Create the WMS GFI control.
     */
    createControl: function(layerName, htmlTemplate) {

        this.map = this.target.mapPanel.map;
        this.htmlTemplate = htmlTemplate;

        return new OpenLayers.Control.WMSGetFeatureInfo({

            infoFormat: "application/vnd.ogc.gml",
            maxFeatures: this.maxFeatures || 100,
            map: this.map,
            hover: true,

            request: function(clickPosition, options) {

                var layers = this.map.getLayersByName(layerName);
                if (layers.length == 0) {
                    OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
                    return;
                }

                options = options || {};
                if (this.drillDown === false) {
                    var wmsOptions = this.buildWMSOptions(layers[0].url, layers,
                                                          clickPosition, layers[0].params.FORMAT);
                    var request = OpenLayers.Request.GET(wmsOptions);

                    if (options.hover === true) {
                        this.hoverRequest = request;
                    }
                } else {
   
                    this._requestCount = 0;
                    this._numRequests = layers.length;
                    this.features = [];
                    for (var i=0, len=layers.length; i<len; i++) {
                        var url = layer.url instanceof Array ? layer.url[0] : layer.url;
                        var wmsOptions = this.buildWMSOptions(url, [layer],
                                                              clickPosition, layer.params.FORMAT);
                        OpenLayers.Request.GET(wmsOptions);
                    }
                }
            },
            eventListeners: {

                getfeatureinfo: function(e) {
                    if (e.features.length > 0) {

                        var location = this.map.getLonLatFromPixel(e.xy);
                        var html = this.getPopupHtml(e.features);
                        if (this.popup != null) {
                            this.popup.close();
                        }
                        this.popup = new GeoExt.Popup({
                            title: "",
                            map: this.map,
                            location: location,
                            html: html
                        });
                        this.popup.show();
                    }
                },
                scope: this
            }
        });
    }
});

Ext.preg(cgxp.plugins.MapQuery.prototype.ptype, cgxp.plugins.MapQuery);
