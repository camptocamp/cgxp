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

/*
 * @requires plugins/Tool.js
 * @include GeoExt/data/FeatureStore.js
 * @include GeoExt.ux/Ext.ux.grid.GridMouseEvents.js
 * @include Ext/examples/ux/RowExpander.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FeaturesWindow
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a FeaturesWindow plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *
 *      var obs = new Ext.util.Observable();
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_featureswindow",
 *              themes: themes,
 *              events: obs
 *          }, {
 *              ptype: "cgxp_wmsgetfeatureinfo",
 *              actionTarget: "center.tbar",
 *              toggleGroup: "maptools",
 *              events: obs
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: FeaturesWindow(config)
 *
 *      This plugin shows query results in a window (popup) using a
 *      grouping grid.
 *
 *      This plugin should receive the list of themes in its config.
 *      This is to read the "identifier attribute" from the layer
 *      spec.
 *
 */   
cgxp.plugins.FeaturesWindow = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_featureswindow*/
    ptype: "cgxp_featureswindow",

    /** api: config[events]
     *  ``Ext.util.Observable``  An ``Ext.util.Observable`` instance used
     *  to receive events from other plugins.
     *
     *  * ``queryopen``: sent on open query tool.
     *  * ``queryclose``: sent on closequery tool.
     *  * ``querystarts``: sent when the query button is pressed
     *  * ``queryresults(features)``: sent when the result is received
     */
    events: null,

    /** api: config[themes]
     *  ``Object`` List of internal and external themes and layers. (The
     *  same object as that passed to the :class:`cgxp.plugins.LayerTree`).
     */
    themes: null,

    /** private: attibute[vectorLayer]
     *  ``OpenLayers.Layer.Vector``
     *  The vector layer used to display the features.
     */
    vectorLayer: null,

    /** private: attribute[featuresWindow]
     *  ``Ext.Window``
     *  The window (popup) in which the results are shown.
     */
    featuresWindow: null,

    /** private: attribute[layers]
     *  ``Array``
     *  The list of layers.
     */
    layers: null,

    /** api: config[highlightStyle]
     *  ``Object``  A style properties object to be used to show features
     *  on the map when hovering the row in the grid (optional).
     */
    highlightStyle: null,

    /** api: config[windowTitleText]
     *  ``String`` Text for the window title (i18n).
     */
    windowTitleText: "Results",
    /** api: config[itemsText]
     *  ``String`` Text for the "number of items" label (plural) (i18n).
     */
    itemsText: "Items",
    /** api: config[itemText]
     *  ``String`` Text for the "number of items" label (singular) (i18n).
     */
    itemText: "Item",

    /** private: attribute[store]
     *  ``Ext.data.Store``
     */
    store: null,

    /** private: attribute[grid]
     *  ``Ext.grid.GridPanel``
     */
    grid: null,

    /** private: attribute[formatedAttributes]
     *  ``String`` Name of the attribte added to the features with a custom
     *  Ext.Template for better rendering of the attributes in the tooltip
     */
    formatedAttributesId: 'detail',

    /** private: attribute[originalIdRef]
     *  ``String`` backup of the original feature id before is is replaced by
     *  a grouped id
     */
    originalIdRef: 'originalId',

    init: function(target) {
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
            for (var i=0, len=node.length; i<len; i++) {
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

        // a FeaturesWindow instance has its own vector layer, which
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

        this.events.on('querystarts', function() {
            if (this.featuresWindow) {
                this.store.removeAll();
                this.vectorLayer.destroyFeatures();
            }
        }, this);

        this.events.on('queryresults', function(features) {
            this.showWindow(features);
        }, this);

        map.addLayer(this.vectorLayer);
    },

    /** private: method[extendFeaturesAttributes]
     *
     *  Store the `type` and `id` properties into attributes, because
     *  `FeatureStore` don't keep the type and id attribute.
     *  Also create a table for the feature `detail` to be shown on over in
     *  a tooltip.
     */
    extendFeaturesAttributes: function(features) {
        var i, previousLayer;
        Ext.each(features, function(feature) {
            var detail = [],
                attributes = feature.attributes;
            detail.push('<table class="detail">');
            for (var k in attributes) {
                if (attributes.hasOwnProperty(k) && attributes[k]) {
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
            detail.push('</table>');
            feature.attributes[this.formatedAttributesId] = detail.join('');
            feature.attributes.type = OpenLayers.i18n(feature.type); 

            if (feature.type != previousLayer) {
                previousLayer = feature.type;
                i = 0;
            }

            // store original id in backup attribute
            if (feature.attributes.id) {
                feature.attributes[this.originalIdRef] = feature.attributes.id;
            }
            if (this.layers[feature.type] &&
                this.layers[feature.type].identifierAttribute) {
                // use the identifierAttribute field if set
                var identifier = this.layers[feature.type].identifierAttribute;
                feature.attributes.id = feature.attributes[identifier];
            } else {
                feature.attributes.id = feature.attributes.type + ' ' + (++i);
            }
        }, this);
    },

    /** private: method[showWindow]
     *  Shows the window
     */
    showWindow: function(features) {
        this.extendFeaturesAttributes(features);

        if (!this.grid) {
            this.createGrid();
        }
        this.store.loadData(features);

        var first = false;
        if (!this.featuresWindow) {
            first = true;
            this.featuresWindow = new Ext.Window({
                layout: 'fit',
                width: 300,
                height: 280,
                title: this.windowTitleText,
                closeAction: 'hide',
                items: [this.grid],
                listeners: {
                    hide: function() {
                        this.store.removeAll();
                    },
                    scope: this
                }
            });
        } else {
            this.featuresWindow.add(this.grid);
            this.featuresWindow.doLayout();
        }
        this.featuresWindow.show();

        // position the attributes window the first time
        // then it should appear at the last position the user chose
        if (first) {
            this.featuresWindow.alignTo(
                this.target.mapPanel.body,
                "tr-tr",
                [-5, 5],
                true
            );
        }
    },

    /** private: method[createGrid]
     *  Creates the grid and associated store.
     *  :returns: ``Ext.data.Store``
     */
    createGrid: function() {
        var featureGroupingStoreClass = Ext.extend(
            Ext.data.GroupingStore,
            GeoExt.data.FeatureStoreMixin()
        );
        this.store = new featureGroupingStoreClass({
            groupField: 'type',
            fields: [
                'id',
                'type', // the layer 
                this.formatedAttributesId
            ]
        });
        var rowexpander = new Ext.ux.grid.RowExpander({
            tpl: new Ext.Template('{' + this.formatedAttributesId + '}')
        });

        var groupTextTpl = [
            '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "',
            this.itemsText,
            '" : "',
            this.itemText,
            '"]})'
        ].join('');
        this.grid = new Ext.grid.GridPanel({
            border: false,
            store: this.store,
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
    },

    /** private: method[printExport]
     *  Export for print.
     *  Columns titles will be stored on 'col1', 'col2', ... of the page.
     *  The dataset name is 'table '.
     *  The columns names will be 'col1', 'col2', ....
     */
    printExport: function() {

        var groupedRecords = [];

        if (!this.grid || !this.grid.getStore()) {
            return groupedRecords;
        }
        var records = this.grid.getStore().getRange();
        if (records.length === 0) {
            return groupedRecords;
        }

        Ext.each(records, function(r) {        
            var attributes = r.getFeature().attributes;
            
            var raw = {};
            var index = 0;
            // group records by type (layer)
            if (!groupedRecords[attributes.type]) {
                var results = {
                    table: {
                        data: [], 
                        columns: []
                    },
                    _newGroup: true
                }
                groupedRecords[attributes.type] = results;
            }
            for (prop in attributes) {
                if (attributes.hasOwnProperty(prop) && 
                    prop != this.formatedAttributesId &&
                    prop != this.originalIdRef) {

                    // replace id value by original id value, if it exists
                    if (prop == 'id') {
                        if (attributes[this.originalIdRef]) {
                            prop = this.originalIdRef;
                        } else {
                            continue;
                        }
                    }

                    var id = 'col' + index;
                    raw[id] = attributes[prop];
                    index++;
                    if (index > 9) {
                        break;
                    }
                    if (groupedRecords[attributes.type]._newGroup) {
                        if (prop == this.originalIdRef) {
                            prop = 'id';
                        }
                        groupedRecords[attributes.type][id] = OpenLayers.i18n(prop);
                        groupedRecords[attributes.type].table.columns.push(id);
                    }
                }
            }
            groupedRecords[attributes.type].table.data.push(raw);
            groupedRecords[attributes.type]._newGroup = false;
        }, this);
        return groupedRecords;
    }
});
Ext.preg(cgxp.plugins.FeaturesWindow.prototype.ptype, cgxp.plugins.FeaturesWindow);
