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

/**
 * @requires plugins/Tool.js
 * @include CGXP/widgets/tree/LayerTree.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = LayerTree
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add the LayerTree, ThemeChooser
 *  and ThemeSelector plugins to a `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          portalConfig: {
 *              layout: "border",
 *              // by configuring items here, we don't need to configure portalItems
 *              // and save a wrapping container
 *              items: [{
 *                  region: "north",
 *                  contentEl: 'header-out'
 *              },
 *              {
 *                  region: 'center',
 *                  layout: 'border',
 *                  id: 'center',
 *                  tbar: [],
 *                  items: [
 *                      "app-map"
 *                  ]
 *              },
 *              {
 *                  id: "featuregrid-container",
 *                  xtype: "panel",
 *                  layout: "fit",
 *                  region: "south",
 *                  height: 160,
 *                  split: true,
 *                  collapseMode: "mini",
 *                  hidden: true,
 *                  bodyStyle: 'background-color: transparent;'
 *              },
 *              {
 *                  layout: "accordion",
 *                  id: "left-panel",
 *                  region: "west",
 *                  width: 300,
 *                  minWidth: 300,
 *                  split: true,
 *                  collapseMode: "mini",
 *                  border: false,
 *                  defaults: {width: 300},
 *                  items: [{
 *                      xtype: "panel",
 *                      title: OpenLayers.i18n("layertree"),
 *                      id: 'layerpanel',
 *                      layout: "vbox",
 *                      layoutConfig: {
 *                          align: "stretch"
 *                      }
 *                  }]
 *              }]
 *          },
 *          tools: [{
 *              ptype: "cgxp_themeselector",
 *              outputTarget: "layerpanel",
 *              layerTreeId: "layertree",
 *              themes: THEMES,
 *              outputConfig: {
 *                  layout: "fit",
 *                  style: "padding: 3px 0 3px 3px;"
 *              }
 *          },
 *          {
 *              ptype: "cgxp_themefinder",
 *              outputTarget: "layerpanel",
 *              layerTreeId: "layertree",
 *              themes: THEMES,
 *              outputConfig: {
 *                  layout: "fit",
 *                  style: "padding: 3px;"
 *              }
 *          },
 *          {
 *              ptype: "cgxp_layertree",
 *              id: "layertree",
 *              themes: THEMES,,
 *              // default themes works only with theme groups
 *              defaultThemes: ["default_theme_to_load"],
 *              wmsURL: "${request.route_url('mapserverproxy', path='')}",
 *              outputTarget: "layerpanel"
 *              outputConfig: {
 *                  header: false,
 *                  flex: 1,
 *                  layout: "fit",
 *                  autoScroll: true
 *              }
 *          },
 *          ...
 *          ]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: LayerTree(config)
 *
 */
cgxp.plugins.LayerTree = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_layertree */
    ptype: "cgxp_layertree",

    /** api: config[themes]
     *  ``Object``
     *  List of internal and external themes. Mandatory.
     */
    themes: null,

    /** api: config[wmsURL]
     *  ``String``
     *  The URL of the WMS. Mandatory.
     */
    wmsURL: null,

    /** api: config[defaultThemes]
     *  ``Array(String)``
     *  The themes to load at init time. Optional.
     */
    defaultThemes: null,

    /** api: config[showKMLIn2D]
     *  ``Boolean`
     *  Indicate if KML layers should be shown in the 2D map.
     *  Default is ``true``.
     */
    showKMLIn2D: true,

    /** private: property[tree]
     */
    tree: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        cgxp.plugins.LayerTree.superclass.constructor.call(this, config);
        this.addEvents(
            /** api: event[loadtheme]
             *  Fired when a theme is loaded.
             */
            "loadtheme"
        );
    },

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.LayerTree.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },

    /** private: method[viewerReady]
     */
    viewerReady: function() {
        this.tree.delayedApplyState();
        this.tree.loadDefaultThemes();
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        config = Ext.apply({
            xtype: "cgxp_layertree",
            mapPanel: this.target.mapPanel,
            themes: this.themes,
            wmsURL: this.wmsURL,
            defaultThemes: this.defaultThemes
        }, config || {});

        this.tree = cgxp.plugins.LayerTree.superclass.addOutput.call(this, config);
        this.relayEvents(this.tree, ['loadtheme']);
        this.tree.on('togglekml', this.toggleKml, this);
        return this.tree;
    },

    /** private: method[toggleKml]
     */
    toggleKml: function(e) {
        var layerName = e.layerName;
        var map = this.target.mapPanel.map;
        if (map.getLayersByName(layerName).length === 0) {
            var layer = new OpenLayers.Layer.Vector(layerName, {
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: e.url,
                    format: new OpenLayers.Format.KML({
                        extractStyles: true,
                        internalProjection: map.projection
                    })
                }),
                visibility: this.showKMLIn2D
            });
            map.addLayer(layer);
        } else {
            Ext.each(map.getLayersByName(layerName), function(layer) {
                map.removeLayer(layer);
            });
        }
    }

});

Ext.preg(cgxp.plugins.LayerTree.prototype.ptype, cgxp.plugins.LayerTree);
