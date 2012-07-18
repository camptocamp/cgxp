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

/**
 * @requires plugins/Tool.js
 * @include OpenLayers/Util.js
 * @include OpenLayers/Control/Navigation.js
 * @include OpenLayers/Control/Zoom.js
 * @include GeoExt.ux/data/Store.js
 * @include GeoExt.ux/data/WMSBrowserWMSCapabilitiesStore.js
 * @include GeoExt.ux/plugins/WMSBrowserAlerts.js
 * @include GeoExt.ux/widgets/WMSBrowser.js
 * @include GeoExt.ux/widgets/WMSBrowserStatusBar.js
 * @include GeoExt.ux/widgets/grid/WMSBrowserGridPanel.js
 * @include GeoExt.ux/widgets/tree/WMSBrowserRootNode.js
 * @include GeoExt.ux/widgets/tree/WMSBrowserTreePanel.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = WMSBrowser
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: WMSBrowser(config)
 *
 *  This plugin provides an "Add WMS layer" button.
 *  Note: OpenLayers.ProxyHost must be set !
 */
cgxp.plugins.WMSBrowser = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_wmsbrowser */
    ptype: "cgxp_wmsbrowser",

    /** api: config[buttonText]
     *  ``String`` The "+ WMS layers" button text (i18n).
     */
    buttonText: "+ WMS layers",

    /** api: config[windowTitleText]
     *  ``String`` The "Add WMS layers" window title text (i18n).
     */
    windowTitleText: "Add WMS layers",

    /** api: config[layerTreeId]
     *  ``String`` Id of the layertree tool (optional).
     *   If specified, layers are added to the layertree in a dedicated group
     */
    layerTreeId: null,
    
    /** private: property[wmsBrowser]
     *  :class:`GeoExt.ux.WMSBrowser` a ref to the WMSBrowser instance.
     */
    wmsBrowser: null,

    /** private: method[addActions]
     */
    addActions: function() {
        var btn = {
            text: this.buttonText,
            handler: Ext.createDelegate(this.showPopup, this)
        };
        return cgxp.plugins.WMSBrowser.superclass.addActions.apply(this,[btn]);
    },

    showPopup: function() {
        if (!this.window) {
            this.window = new Ext.Window({
                closeAction: 'hide',
                resizable: false,
                width: 550,
                height: 450,
                title: this.windowTitleText,
                layout: 'fit',
                items: [this.createWMSBrowser()]
            });
        }
        this.window.show();
    },

    createWMSBrowser: function() {
        if (!this.wmsBrowser) {
            var layers = []
            Ext.each(this.target.mapPanel.map.layers, function(layer) {
                if (layer.visibility && layer.group == 'background') {
                    layers.push(layer.clone());
                }
            });
            var config = {
                border: false,
                zoomOnLayerAdded: true,
                closeOnLayerAdded: false,
                mapPanelPreviewOptions: {
                    height: 170,
                    collapsed: false,
                    extent: this.target.mapPanel.map.getExtent(),
                    map: {
                        projection: this.target.mapPanel.map.projection,
                        maxExtent: this.target.mapPanel.map.maxExtent,
                        restrictedExtent: this.target.mapPanel.map.restrictedExtent,
                        units: this.target.mapPanel.map.units,
                        resolutions: this.target.mapPanel.map.resolutions,
                        controls: [
                            new OpenLayers.Control.Navigation(),
                            new OpenLayers.Control.Zoom()
                        ]
                    },
                    layers: layers,
                    style: {
                        'padding': '0 0 0 10px'
                    },
                    collapsible: false
                },
                layerStore: this.target.mapPanel.layers
            };
            if (this.layerTreeId && this.target.tools[this.layerTreeId]) {
                config.listeners = {
                    "layeradded": this.onLayerAdded,
                    scope: this.target.tools[this.layerTreeId].tree
                };
            }
            this.wmsBrowser = new GeoExt.ux.WMSBrowser(config);
        }
        return this.wmsBrowser;
    },
    
    onLayerAdded: function(o) {
        // instruct the layertree to add new layers in a single group
        // with a single OpenLayers layer
        var layer = o.layer,
            layerNames = layer.params.LAYERS,
            layerTitles = layer.name.split(','),
            children = [], urlObj, groupName;
        Ext.each(layerNames, function(layerName, idx) {
            children.push({
                displayName: layerTitles[idx],
                name: layerName,
                layer: layer,
                editable: false
            });
        });

        // create a human readable group name
        urlObj = OpenLayers.Util.createUrlObject(layer.url, {
            ignorePort80: true
        });
        groupName = urlObj.host + (urlObj.port ? ':'+urlObj.port : '') + urlObj.pathname;
        
        this.addGroup({
            displayName: groupName,
            isExpanded: true,
            name: groupName,
            allOlLayers: [layer],
            layer: layer,
            children: children
        }, true);
    }
    
});

Ext.preg(cgxp.plugins.WMSBrowser.prototype.ptype, cgxp.plugins.WMSBrowser);