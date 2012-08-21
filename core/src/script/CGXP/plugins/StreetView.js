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

/**
 * @requires plugins/Tool.js
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
 *  Don't mis to add in the html file:
 *
 *  .. code-block:: html
 *
 *     <script type="text/javascript" src='http://maps.google.com/maps?file=api&amp;key=<your key>'></script>
 *
 *  In the jsbuild/app.cfg, add in ``root``::
 *
 *      regiogis/static/lib/cgxp/geoext.ux/ux/StreetViewPanel
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

    /** api: method[addActions]
     */
    addActions: function() {
        this.outputTarget = Ext.getCmp(this.outputTarget);
        var button = new Ext.Button(Ext.apply({
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            iconCls: "cgxp-icon-streetview",
            listeners: {
                "toggle": function(button) {
                    if (button.pressed) {
                        if (!this.panel) {
                            this.panel = new GeoExt.ux.StreetViewPanel({
                                map: this.target.mapPanel.map,
                                videoMode: true,
                                showLinks: true,
                                showTool: true,
                                readPermalink: false,
                                baseUrl: this.baseURL,
                                autoDestroy: false,
                                region: "east",
                                split: true,
                                collapseMode: "mini"
                            });
                        }
                        else {
                            this.panel.panorama.navigationToolLayer.setVisibility(true);
                            this.panel.panorama.navigationLinkLayer.setVisibility(true);
                        }
                        this.outputTarget.add(this.panel);
                        // mark as not rendered to force to render the new component.
                        this.outputTarget.layout.rendered = false;

                        this.panel.setSize(this.size, 0);
                        this.panel.setVisible(true);
                        this.panel.doLayout();

                        (function() {
                            this.outputTarget.doLayout();
                        }).defer(100, this);
                    }
                    else {
                        this.panel.panorama.navigationToolLayer.setVisibility(false);
                        this.panel.panorama.navigationLinkLayer.setVisibility(false);
                        this.panel.setVisible(false);
                        this.outputTarget.doLayout();
                    }
                },
                scope: this
            }
        }, this.actionConfig));
        return cgxp.plugins.StreetView.superclass.addActions.apply(this, [button]);
    }
});

Ext.preg(cgxp.plugins.StreetView.prototype.ptype, cgxp.plugins.StreetView);
