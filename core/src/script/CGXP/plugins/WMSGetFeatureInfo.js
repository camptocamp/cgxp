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
 * @include OpenLayers/Control/WMSGetFeatureInfo.js
 * @include OpenLayers/Format/WMSGetFeatureInfo.js
 * @include OpenLayers/Format/GML.js
 * @include GeoExt/widgets/Action.js
 */


/** api: (define)
 *  module = cgxp.plugins
 *  class = WMSGetFeatureInfo
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing on to add a Permalink plugin to a
 *  Viewer:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_wmsgetfeatureinfo',
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools',
 *              featureManager: 'featuremanager',
 *              events: EVENTS
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: WMSGetFeatureInfo(config)
 *
 *    Map queries (with WMS GetFeatureInfo)
 *
 *    Options:
 *    * events - ``Ext.util.Observable`` The application events manager.
 */
cgxp.plugins.WMSGetFeatureInfo = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_wmsgetfeatureinfo */
    ptype: "cgxp_wmsgetfeatureinfo",

    /** api: config[options]
     *  ``Object``
     *  Actions options
     */
    options: {},

    /** api: config[events]
     *  ``Object``
     *  An Observer used to receive events.
     */
    events: null,

    /** api: method[addActions]
     */
    addActions: function() {
        var control =  this.createControl();
        this.target.mapPanel.map.addControl(control);
        var action = new GeoExt.Action(Ext.applyIf({
            allowDepress: true,
            enableToggle: true,
            iconCls: 'info',
            tooltip: OpenLayers.i18n("Query.actiontooltip"),
            toggleGroup: this.toggleGroup,
            control: control
        }, this.options));
        return cgxp.plugins.WMSGetFeatureInfo.superclass.addActions.apply(this, [[action]]);
    },

    /**
     * Method: createControl
     * Create the WMS GFI control.
     *
     * Returns:
     * {OpenLayers.Control.WMSGetFeatureInfo}
     */
    createControl: function() {
        // we overload findLayers to avoid sending requests
        // when we have no sub-layers selected
        return new OpenLayers.Control.WMSGetFeatureInfo({
            infoFormat: "application/vnd.ogc.gml",
            maxFeatures: this.maxFeatures || 100,
            queryVisible: true,
            drillDown: true,
            globalEvents: this.events,
            findLayers: function() {
                var wmsLayers = this.map.getLayersByClass("OpenLayers.Layer.WMS");
                for (var i = 0, len = wmsLayers.length ; i < len ; i++) {
                    var layer = wmsLayers[i];
                    if (layer.getVisibility() === true) {
                        var GFI = OpenLayers.Control.WMSGetFeatureInfo;
                        return GFI.prototype.findLayers.apply(this, arguments);
                    }
                }
                Ext.MessageBox.alert("Info",
                        OpenLayers.i18n("Query.nolayerselectedmsg"));
                return [];
            },

            // copied from OpenLayers.Control.WMSGetFeatureInfo and updated as
            // stated in comments
            request: function(clickPosition, options) {
                var layers = this.findLayers();
                if (layers.length === 0) {
                    this.globalEvents.fireEvent("nogetfeatureinfo");
                    // Reset the cursor.
                    OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
                    return;
                }

                options = options || {};
                if (this.drillDown === false) {
                    var wmsOptions = this.buildWMSOptions(this.url, layers,
                        clickPosition, layers[0].params.FORMAT);
                    var request = OpenLayers.Request.GET(wmsOptions);

                    if (options.hover === true) {
                        this.hoverRequest = request;
                    }
                } else {
                    // Following is specific code, updated from original
                    // OpenLayers.Control.WMSGetFeatureInfo code to make
                    // exactly one request by layer, so our mapserver proxy
                    // don't get lost.
                    this._requestCount = 0;
                    this._numRequests = layers.length;
                    this.features = [];
                    for (var i=0, len=layers.length; i<len; i++) {
                        var layer = layers[i];
                        var url = layer.url instanceof Array ? layer.url[0] : layer.url;
                        var wmsOptions = this.buildWMSOptions(url, [layer],
                            clickPosition, layer.params.FORMAT);
                        OpenLayers.Request.GET(wmsOptions);
                    }
                }
            },

            eventListeners: {
                beforegetfeatureinfo: function() {
                    this.events.fireEvent('querystarts');
                },
                getfeatureinfo: function(e) {
                    this.events.fireEvent('queryresults', e.features);
                },
                activate: function() {
                    this.events.fireEvent('queryopen');
                },
                deactivate: function() {
                    this.events.fireEvent('queryclose');
                },
                scope: this
            }
        });
    }
});

Ext.preg(cgxp.plugins.WMSGetFeatureInfo.prototype.ptype, cgxp.plugins.WMSGetFeatureInfo);
