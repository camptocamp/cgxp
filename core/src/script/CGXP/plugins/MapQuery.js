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
 * @includes OpenLayers/Layer/Vector.js
 * @includes OpenLayers/Layer/WMS.js
 * @includes OpenLayers/Request.js
 * @includes OpenLayers/Geometry/Collection.js
 * @includes GeoExt/Action.js
 * @includes GeoExt/Popup.js
 * @includes Ext/XTemplate.js
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
    xtemplate: null,

    /** api: config[layerName]
     */
    layerName: null,

    /** api: config[template]
     */
    template: null,

    /** api: config[alwaysActive]
     */
    alwaysActive: false,

    /** api: config[handlerOptions]
     */
    handlerOptions: null,

    /** api: config[styleMap]
     */
    styleMap: null,

    init: function() {
        cgxp.plugins.MapQuery.superclass.init.apply(this, arguments);

        this.highlightLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("cgxp"), {
                displayInLayerSwitcher: false,
                alwaysInRange: true,
                styleMap: this.styleMap
            });

        this.target.on('ready', this.viewerReady, this);

        if (this.template) {
            this.xtemplate = new Ext.XTemplate(this.template);
            this.xtemplate.compile();
        }
    },

    viewerReady: function() {
        this.target.mapPanel.map.addLayer(this.highlightLayer);
    },

    /** api: method[addActions]
     */
    addActions: function() { 
       
        if (this.alwaysActive) {
            var control = this.createControl();            
            this.target.mapPanel.map.addControl(control);
            control.activate();
            return;
        } else {
            var options = Ext.apply({
                allowDepress: true,
                enableToggle: true,
                iconCls: 'info',
                tooltip: OpenLayers.i18n("Query.actiontooltip"),
                toggleGroup: this.toggleGroup,
                control: this.createControl()
            }, this.options);
            var action = new GeoExt.Action(options);
            return cgxp.plugins.MapQuery.superclass.addActions.apply(this, [[action]]);         
        }
    },

    /**
     * api: method[createControl]
     * Create the WMS GFI control.
     */
    createControl: function() {

        return new OpenLayers.Control.WMSGetFeatureInfo({

            infoFormat: "application/vnd.ogc.gml",
            maxFeatures: this.maxFeatures || 100,
            handlerOptions: this.handlerOptions || {},
            hover: true,
            layer: new OpenLayers.Layer.WMS("MapQuery WMS", this.wmsURL, 
                                            {layers: [this.layerName]}),

            request: function(clickPosition, options) {

                var wmsOptions = this.buildWMSOptions(this.layer.url, [this.layer],
                                                      clickPosition, this.layer.params.FORMAT);
                var request = OpenLayers.Request.GET(wmsOptions);                
                this.hoverRequest = request;
            },
            eventListeners: {

                getfeatureinfo: function(e) {

                    if (e.features.length > 0) {

                        this.highlightLayer.destroyFeatures();
                        this.highlightLayer.addFeatures(e.features);
                        this.highlightLayer.redraw();

                        var geoms = [];
                        for (var i = 0; i < e.features.length; i++) {
                            geoms.push(e.features[i].geometry);
                        }
                        var location = new OpenLayers.Geometry.Collection(geoms).getCentroid();

                        if (this.popup != null) {
                            this.popup.close();
                        }
                        this.popup = new GeoExt.Popup({
                            title: "",
                            map: this.target.mapPanel.map,
                            location: location,
                            tpl: this.xtemplate,
                            data: e.features,
                            unpinnable: false
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
