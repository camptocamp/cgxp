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
        return new GeoExt.ux.WMSBrowser({
            border: false,
            zoomOnLayerAdded: false,
            closeOnLayerAdded: false,
            mapPanelPreviewOptions: {
                height: 170,
                collapsed: false
            },
            layerStore: this.target.mapPanel.layers
        });
    }
});

Ext.preg(cgxp.plugins.WMSBrowser.prototype.ptype, cgxp.plugins.WMSBrowser);