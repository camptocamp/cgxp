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

/**
 * @requires plugins/Tool.js
 * @requires ExtOverrides/BorderLayout.js
 * @include CGXP/tools/tools.js
 * @include CGXP/plugins/ToolActivateMgr.js
 * @include ux/widgets/StreetViewPanel.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = StreetView
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a StreetView plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_streetview',
 *              actionTarget: 'center.tbar',
 *              outputTarget: 'center',
 *              toggleGroup: 'maptools',
 *              baseURL: "${request.static_url('<project>:static/lib/cgxp/geoext.ux/ux/StreetViewPanel/')}"
 *          }]
 *          ...
 *      });
 *
 *  To use this plugin we need to create an API key,go to 
 *  `The Google API console <https://code.google.com/apis/console>`_:
 *
 *  * Sign in
 *  * In "Services" ckeck "Google Maps API v3" and "Street View Image API".
 *  * In "API access" click on "Create new Browser key...".
 *  * Fill the HTTP referers
 *  * Click on "Create"
 *  * Get the "API key"
 *  * Add this in the index.html file with the right <API key>:
 *
 *  .. code-block:: html
 *
 *     <script type="text/javascript" src='http://maps.google.com/maps?file=api&amp;key=<API key>'></script>
 *
 *  In the jsbuild/app.cfg, add in ``root``::
 *
 *      <project>/static/lib/cgxp/geoext.ux/ux/StreetViewPanel
 *
 *  and in ``include``::
 *
 *      CGXP/plugins/StreetView.js
 */

/** api: constructor
 *  .. class:: StreetView(config)
 *
 *    Provides two actions for streetviewing in and out.
 */
cgxp.plugins.StreetView = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_streetview */
    ptype: "cgxp_streetview",

    /** api: config[activateToggleGroup]
     *  ``String``
     *  The name of the activate toggle group this tool is in.
     *  Default is "clickgroup".
     */
    activateToggleGroup: "clickgroup",

    /** private: config[autoActivate]
     *  ``Boolean`` Set to false if the tool should be initialized without
     *  activating it. Should be false.
     */
    autoActivate: false,

    /** api: config[actionConfig]
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

    /** api: config[toggleGroup]
     *  The group theses toggle buttons are members of.
     */

    /** api: Size of the GoogleEarthPanel in the outputTarget
     */
    size: "40%",

    /** api: config[baseURL]
     *  The UX base URL.
     */
    baseURL: null,

    /** private: property[panel]
     *  The Street View panel.
     */

    /** i18n */
    tooltipText: "Show in StreetView",
    menuText: "StreetView",
    helpMessage: "Click on a road on the map to start StreetView.",

    /** private: property[intermediateContainer]
     *  Required intermediate container
     */
    intermediateContainer: null,

    /** private: method[init]
     */
    init: function(target) {
        cgxp.plugins.Print.superclass.init.call(this, target);
        if (this.activateToggleGroup) {
            cgxp.plugins.ToolActivateMgr.register(this);
        }
    },

    /** private: method[activate]
     */
    activate: function() {
        if (!this.active) {
            this.loadingChecker();
        }
        return cgxp.plugins.StreetView.superclass.activate.call(this);
    },

    /** private: method[deactivate]
     */
    deactivate: function() {
        if (this.active) {
            this.unloadStreetView();
        }
        return cgxp.plugins.StreetView.superclass.deactivate.call(this);
    },

    /** private: method[addActions]
     */
    addActions: function() {
        this.outputTarget = Ext.getCmp(this.outputTarget);
        var button = Ext.apply({
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            iconCls: "cgxp-icon-streetview",
            tooltip: this.tooltipText,
            menuText: this.menuText,
            listeners: {
                "toggle": function(item) {
                    if (item.pressed || item.checked) {
                        this.activate();
                    } else {
                        this.deactivate();
                    }
                },
                scope: this
            }
        }, this.actionConfig);
        return cgxp.plugins.StreetView.superclass.addActions.apply(this, [button]);
    },

    /** private: method[loadingChecker]
     *  Check if the east panel, which is shared between GoogleEarth and Streetview, 
     *  is correctly cleaned up (ie. give time to the other tool to uninitialize 
     *  the panel content before creating the new content)
     */
    loadingChecker: function() {
        if (this.outputTarget.layout.east !== undefined &&
            this.outputTarget.layout.east.splitEl !== undefined &&
            this.outputTarget.layout.east.splitEl !== null) {
            this.loadingChecker.defer(1000, this);
        } else {
            this.loadStreetView();
        }
    },

    /** private: method[loadGoogleEarth]
     *  Load and open the GoogleEarth panel and initialize GoogleEarth
     */
    loadStreetView: function() {

        if (this.intermediateContainer === null) {
            this.intermediateContainer = this.outputTarget.add({
                autoDestroy: true,
                layout: "fit",
                region: "east",
                split: true,
                collapseMode: "mini"
            });
        }

        this.streetViewPanel = new GeoExt.ux.StreetViewPanel({
            map: this.target.mapPanel.map,
            videoMode: true,
            showLinks: true,
            showTool: true,
            readPermalink: false,
            baseUrl: this.baseURL
        });

        this.outputTarget.add(this.intermediateContainer);

        this.intermediateContainer.add(this.streetViewPanel);
        this.intermediateContainer.setSize(this.size, 0);
        this.intermediateContainer.setVisible(true);

        /* Marked as not rendered in order to force the rendering of the component.
           Otherwise the panel is not rendered correctly when switching between 
           GoogleEarth and StreetView. */
        this.outputTarget.layout.rendered = false;

        this.outputTarget.doLayout();

        cgxp.tools.notification.show(this.helpMessage, 5000);
    },

    /** private: method[unloadGoogleEarth]
     *  Uninitialize GoogleEarth and unload and close the GoogleEarth panel
     */
    unloadStreetView: function() {

        this.streetViewPanel.panorama.navigationToolLayer.setVisibility(false);
        this.streetViewPanel.panorama.navigationLinkLayer.setVisibility(false);

        this.streetViewPanel.clickControl.deactivate();

        this.intermediateContainer.setVisible(false);

        this.intermediateContainer.destroy();
        this.intermediateContainer = null;

        /* solve problem with Ext duplicating the splitbar when doLayout is called
           because of the rendered = false above */
        if (this.outputTarget.layout.east && this.outputTarget.layout.east.splitEl) {
            this.outputTarget.layout.east.splitEl.remove();
            this.outputTarget.layout.east.splitEl = null;
            this.outputTarget.layout.east.split.destroy();
        }

        this.outputTarget.doLayout();
    }

});

Ext.preg(cgxp.plugins.StreetView.prototype.ptype, cgxp.plugins.StreetView);
