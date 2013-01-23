/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 * @include OpenLayers/Control/WMSGetFeatureInfo.js
 * @include OpenLayers/Format/WMSGetFeatureInfo.js
 * @include OpenLayers/Format/GML.js
 * @include OpenLayers/Request/XMLHttpRequest.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Request.js
 * @include OpenLayers/Geometry/Collection.js
 * @include GeoExt/widgets/Action.js
 * @include GeoExt/widgets/Popup.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = MapQuery
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

    /** api: config[layerName]
     */
    layerName: null,

    /** api: config[bodyTemplate]
     */
    titleTemplate: null,

    /** api: config[bodyTemplate]
     */
    bodyTemplate: null,

    /** api: config[alwaysActive]
     */
    alwaysActive: false,

    /** api: config[handlerOptions]
     */
    handlerOptions: null,

    /** api: config[styleMap]
     */
    styleMap: null,

    /** api: config[highlightLayerOptions]
     *  ``Object``
     *  Optional options passed to the highlight layer constructor.
     */
    highlightLayerOptions: null,

    /** api: config[actionConfig]
     *  ``Object``
     *  Configuration object for the action created by this plugin.
     */

    /* i18n */
    actionTooltip: 'Query the map',
    menuText: 'Query the map',

    init: function() {
        cgxp.plugins.MapQuery.superclass.init.apply(this, arguments);

        this.highlightLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("cgxp"), Ext.apply({
                displayInLayerSwitcher: false,
                alwaysInRange: true,
                styleMap: this.styleMap
            }, this.highlightLayerOptions));

        this.target.on('ready', this.viewerReady, this);

        if (typeof this.titleTemplate === 'string') {
            this.titleTemplate = new Ext.XTemplate(this.titleTemplate);
        }
        if (typeof this.bodyTemplate === 'string') {
            this.bodyTemplate = new Ext.XTemplate(this.bodyTemplate);
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
                tooltip: this.actionTooltip,
                menuText: this.menuText,
                toggleGroup: this.toggleGroup,
                control: this.createControl()
            }, this.actionConfig);
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
                        var title = this.titleTemplate.apply(e.features);
                        this.popup = new GeoExt.Popup({
                            title: title,
                            closable: false,
                            header: false,
                            bodyBorder: false,
                            border: false,
                            resizable: false,
                            map: this.target.mapPanel.map,
                            location: location,
                            tpl: this.bodyTemplate,
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
