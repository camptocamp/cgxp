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
 * @include GeoExt/data/FeatureStore.js
 * @include GeoExt.ux/Ext.ux.grid.GridMouseEvents.js
 * @include Ext/examples/ux/RowExpander.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FeatureWindow
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: FeaturesWindow(config)
 *
 *  This plugin shows query results in a window (popup) using a grouping grid.
 */   
cgxp.plugins.FeaturesWindow = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_featureswindow*/
    ptype: "cgxp_featureswindow",

    /** api: config[themes]
     *  ``Object``
     *  List of internal and external themes and layers.
     */
    themes: null,

    /** private: attibute[vectorLayer]
     * ``Object``
     * The layer used to display the features.
     */
    vectorLayer: null,

    /** private: attribute[featuresWindow]
     * ``Ext.Window``
     */
    featuresWindow: null,

    /** private: attribute[layers]
     * ``Array``
     */
    layers: null,

    /** api: config[highlightStyle]
     *  ``Object``
     *  A style properties object to be used to show features on the map when
     *  hovering the row in the grid.
     */
    highlightStyle: null,

    windowTitleText: "Results",
    itemsText: "Items",
    itemText: "Item",

    init: function(config) {
        this.highlightStyle = OpenLayers.Util.applyDefaults(
            this.highlightStyle || {
                fillColor: 'red',
                strokeColor: 'red'
            }, OpenLayers.Feature.Vector.style['default']
        );
        cgxp.plugins.FeaturesWindow.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);

        var themes = Ext.apply(this.themes.local, this.themes.external);
        var layers = {};
        function browseThemes(node) {
            for (var i = 0, len = node.length; i < len; i++) {
                var child = node[i];
                if (child.children) {
                    browseThemes(child.children);
                } else {
                    layers[child.name] = child;
                }
            }
        }
        browseThemes(themes);
        this.layers = layers;
    },

    viewerReady: function() {
        var map = this.target.mapPanel.map;

        this.events.addEvents({
            'querystarts': true,
            'queryresults': true
        });


        // a ResultsPanel object has its own vector layer, which
        // is added to the map once for good
        this.vectorLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("c2cgeoportal"), {
                displayInLayerSwitcher: false,
                alwaysInRange: true,
                styleMap: new OpenLayers.StyleMap({
                    'default': this.highlightStyle
                })
            }
        );

        this.events.on('queryopen', function() {
        }, this);
     
        this.events.on('queryclose', function() {
        }, this);
       
        this.events.on('querystarts', function() {
            this.featuresWindow && this.featuresWindow.removeAll();
        }, this);

        this.events.on('queryresults', function(features) {
            this.showWindow(features);
        }, this);

        map.addLayer(this.vectorLayer);
    },

    /** private: method[extendFeaturesAttributes]
     *
     * Store the `type` and `id` properties into attributes, because
     * `FeatureStore` don't keep the type and id attribute.
     * Also create a table for the feature `detail` to be shown on over in
     * a tooltip.
     */
    extendFeaturesAttributes: function(features) {
        Ext.each(features, function(feature) {
            var detail = [],
                attributes = feature.attributes;
            detail.push('<table class="detail">');
            for (var k in attributes) {
                if (attributes.hasOwnProperty(k)) {
                    if (attributes[k]) {
                        detail = detail.concat([
                            '<tr>',
                            '<th>',
                            OpenLayers.i18n(k),
                            '</th>',
                            '<td>',
                            attributes[k],
                            '</td>',
                            '</tr>'
                        ]);
                    }
                }
            }
            detail.push('</table>');
            feature.attributes.detail = detail.join('');
            // FIXME: find a better alternative (GeoExt.FeatureReader) 
            feature.attributes.type = OpenLayers.i18n(feature.type); 

            // use the identifierAttribute field if set
            var identifier = this.layers[feature.type].identifierAttribute;
            feature.attributes.id = identifier ? feature.attributes[identifier] : feature.id;
        }, this);
    },

    /** private: method[showWindow]
     * Shows the window
     */
    showWindow: function(features) {
        this.extendFeaturesAttributes(features);

        var FeatureGroupingStore = Ext.extend(
            Ext.data.GroupingStore,
            GeoExt.data.FeatureStoreMixin()
        );
        var store = new FeatureGroupingStore({
            features: features,
            groupField: 'type',
            fields: [
                'id',
                'type', // the layer 
                'detail'
            ]
        });
        var rowexpander = new Ext.ux.grid.RowExpander({
            tpl: new Ext.Template('{detail}')
        });

        var groupTextTpl = [
            '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "',
            this.itemsText,
            '" : "',
            this.itemText,
            '"]})'
        ].join('');
        var grid = new Ext.grid.GridPanel({
            border: false,
            store: store,
            columns: [
                rowexpander,
            {
                dataIndex: 'type',
                hidden: true
            }, {
                dataIndex: 'id'
            }],
            view: new Ext.grid.GroupingView({
                forceFit: true,
                showGroupName: false,
                groupTextTpl: groupTextTpl
            }),
            listeners: {
                rowmouseenter: function(grid, row) {
                    var feature = grid.getStore().getAt(row).getFeature();
                    this.vectorLayer.addFeatures(feature);
                },
                rowmouseleave: function(grid, row) {
                    var feature = grid.getStore().getAt(row).getFeature();
                    this.vectorLayer.removeFeatures(feature);
                },
                scope: this
            },
            plugins: [
                Ext.ux.grid.GridMouseEvents,
                rowexpander
            ],
            disableSelection: true,
            hideHeaders: true
        });
        var first = false;
        if (!this.featuresWindow) {
            first = true;
            this.featuresWindow = new Ext.Window({
                layout: 'fit',
                width: 300,
                height: 280,
                title: this.windowTitleText,
                closeAction: 'hide',
                items: [grid],
                listeners : {
                    hide: function(win) {
                        win.removeAll();
                    },
                    scope: this
                }
            });
        } else {
            this.featuresWindow.removeAll();
            this.featuresWindow.add(grid);
            this.featuresWindow.doLayout();
        }
        this.featuresWindow.show();

        if (first) {
            this.featuresWindow.alignTo(
                this.target.mapPanel.body,
                "tr-tr",
                [-5, 5],
                true
            );
        }
    }
});
Ext.preg(cgxp.plugins.FeaturesWindow.prototype.ptype, cgxp.plugins.FeaturesWindow);
