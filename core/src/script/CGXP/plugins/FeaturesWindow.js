/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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
 * @requires CGXP/plugins/FeaturesResult.js
 * @include CGXP/tools/tools.js
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
 *              themes: THEMES,
 *              events: EVENTS
 *          }, {
 *              ptype: "cgxp_wmsgetfeatureinfo",
 *              actionTarget: "center.tbar",
 *              toggleGroup: "maptools",
 *              events: EVENTS
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
 *      For the queryable Base layer the ``identifierAttribute`` can be
 *      provide by the ``queryLayers`` option in a layer config:
 *
 *      .. code-block:: javascript
 *
 *          ...
 *          queryLayers: [{
 *              name: "buildings",
 *              identifierAttribute: "name"
 *          }, {
 *              name: "parcels",
 *              identifierAttribute: "number"
 *          }]
 *          ...
 */
cgxp.plugins.FeaturesWindow = Ext.extend(cgxp.plugins.FeaturesResult, {

    /** api: ptype = cgxp_featureswindow */
    ptype: "cgxp_featureswindow",

    /** api: config[events]
     *  ``Ext.util.Observable``  An ``Ext.util.Observable`` instance used
     *  to receive events from other plugins.
     *
     *  * ``queryopen``: sent on open query tool.
     *  * ``queryclose``: sent on closequery tool.
     *  * ``querystarts``: sent when the query button is pressed
     *  * ``nolayer``: sent when no layer to query.
     *  * ``queryresults(queryresult)``: sent when the result is received
     */
    events: null,

    /** api: config[themes]
     *  ``Object`` List of internal and external themes and layers. (The
     *  same object as passed to the :class:`cgxp.plugins.LayerTree`).
     */
    themes: null,

    /** api: config[windowOptions]
     * ``Object`` Additional options given to the window constructor.
     */
    windowOptions: {},

    /** private: attribute[featuresWindow]
     *  ``Ext.Window``
     *  The window (popup) in which the results are shown.
     */
    featuresWindow: null,

    /** api: config[defaultStyle]
     *  ``Object``  A style properties object to be used to show all features
     *  on the map (optional).
     *
     *  Set `label` to `null` to hide labels.
     *
     *  Defaults to ``{ fillColor: 'red', strokeColor: 'red' }``.
     */
    defaultStyle: null,

    /** api: config[highlightStyle]
     *  ``Object``  A style properties object to be used to show features
     *  on the map when hovering the row in the grid (optional).
     *
     *  Set `label` to `null` to hide labels.
     *
     *  Defaults to ``{ fillColor: 'red', strokeColor: 'red', fillOpacity: 0.6,
     *  strokeOpacity: 1, strokeWidth: 2 }``.
     */
    highlightStyle: null,

    /** api: config[windowTitleText]
     *  ``String`` Text for the window title (i18n).
     */
    windowTitleText: "Results",
    /** api: config[itemsText]
     *  ``String`` Text for the "number of items" label (plural) (i18n).
     */
    itemsText: "items",
    /** api: config[itemText]
     *  ``String`` Text for the "number of items" label (singular) (i18n).
     */
    itemText: "item",
    /** api: config[suggestionText]
     *  ``String`` Text for the shortened notice message (i18n).
     */
    suggestionText: "Suggestion",
    /** api: config[noFeatureFound]
     *  ``String`` No feature found notice message (i18n).
     */
    noFeatureFound: "No feature found",
    /** api: config[loadingResults]
     *  ``String`` Loading results message (i18n).
     */
    loadingResults: "Loading results...",
    /** api: config[noLayerSelectedMessage]
     *  ``String`` No layer selected message (i18n).
     */
    noLayerSelectedMessage: "No layer selected",

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

    /** api: config[messageStyle]
     *  ``String`` CSS style used for the queryResult message.
     */
    messageStyle: 'queryResultMessage',

    /** private: config[contentOverride]
     *  ``String`` Id if the attribute used for unqueried layers fake features.
     */
    contentOverride: 'contentOverride',

    /** api: config[showUnqueriedLayers]
     *  ``Bool`` show or hide the unqueried layers in the tabpanel, default is true.
     */
    showUnqueriedLayers: true,

    /** api: config[openFeatures]
     *  ``Number`` number of query results that will be expand in the grid
     *  when loaded, default is 1.
     */
    openFeatures: 1,

    init: function(target) {
        // Set default
        this.defaultStyle = OpenLayers.Util.applyDefaults(
            this.defaultStyle || {
                fillColor: 'red',
                strokeColor: 'red'
            }, OpenLayers.Feature.Vector.style['default']
        );
        this.highlightStyle = OpenLayers.Util.applyDefaults(
            this.highlightStyle || {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.6,
                strokeOpacity: 1,
                strokeWidth: 2
            }, OpenLayers.Feature.Vector.style['default']
        );
        cgxp.plugins.FeaturesWindow.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        var map = this.target.mapPanel.map;

        // a FeaturesWindow instance has its own vector layer, which
        // is added to the map once for good
        this.createVectorLayer({
            styleMap: new OpenLayers.StyleMap({
                'default': this.defaultStyle,
                'highlight': this.highlightStyle
            })
        });

        this.events.on('querystarts', function() {
            if (this.featuresWindow) {
                this.store.removeAll();
                this.vectorLayer.destroyFeatures();
                if (this.featuresWindow.bbar) {
                    this.featuresWindow.bbar.hide();
                    this.featuresWindow.syncSize();
                }
            }
            this.showNotification(this.loadingResults);
        }, this);

        this.events.on('nolayer', function() {
            this.showNotification(this.noLayerSelectedMessage, 5000);
        }, this);

        this.events.on('queryresults', function(queryResult) {
            this.showWindow(queryResult);
        }, this);

        this.events.on('queryclose', function(queryResult) {
            cgxp.tools.notification.close();
            if (this.featuresWindow) {
                this.featuresWindow.hide();
            }
        }, this);

        map.addLayer(this.vectorLayer);
    },

    /** public: method[getDetail]
     *  Create the details view of a feature,
     *  Override this to change the details view
     */
    getDetail: function(feature) {
        var detail = ['<table class="detail">'],
            attributes = feature.attributes;
        for (var k in attributes) {
            if (attributes.hasOwnProperty(k) && attributes[k]) {
                if (k == this.contentOverride) {
                    detail.push(attributes[k].text);
                    break; // exit for loop
                } else {
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
        return detail.join('');
    },

    /** private: method[extendFeaturesAttributes]
     *
     *  Store the `type` and `id` properties into attributes, because
     *  `FeatureStore` don't keep the type and id attribute.
     *  Also create a table for the feature `detail` to be shown on over in
     *  a tooltip.
     */
    extendFeaturesAttributes: function(features) {
        var featuresWithAttributes = [];
        var i, previousLayer;
        Ext.each(features, function(feature) {
            var hasAttributes = false;
            for (var k in feature.attributes) {
                if (feature.attributes.hasOwnProperty(k) && feature.attributes[k]) {
                    hasAttributes = true;
                }
            }
            // don't use feature without attributes
            if (!hasAttributes) {
                return;
            }

            if (!feature.geometry && feature.bounds) {
                feature.geometry = feature.bounds.toGeometry();
            }

            featuresWithAttributes.push(feature);
            feature.attributes[this.formatedAttributesId] = this.getDetail(feature);
            feature.attributes.type = OpenLayers.i18n(feature.type);

            if (feature.type != previousLayer) {
                previousLayer = feature.type;
                i = 0;
            }

            // store original id in backup attribute
            if (feature.attributes.id) {
                feature.attributes[this.originalIdRef] = feature.attributes.id;
            }
            if (feature.attributes[this.contentOverride]) {
                feature.attributes.id = feature.attributes[this.contentOverride].title;
            } else if (this.layers[feature.type] &&
                this.layers[feature.type].identifierAttribute) {
                // use the identifierAttribute field if set
                var identifier = this.layers[feature.type].identifierAttribute;
                feature.attributes.id = feature.attributes[identifier];
            } else {
                feature.attributes.id = feature.attributes.type + ' ' + (++i);
            }
        }, this);
        return featuresWithAttributes;
    },

    /** private: method[showNotification]
     *  Shows the notification window
     */
    showNotification: function(message, timeout) {
        if (this.featuresWindow) {
            this.featuresWindow.hide();
        }
        cgxp.tools.notification.show(message, timeout)
    },

    /** private: method[showWindow]
     *  Shows the window
     */
    showWindow: function(queryResult) {

        var features = queryResult.features;

        // if exist, insert the unqueried layers as fake features
        if (queryResult.unqueriedLayers && this.showUnqueriedLayers) {
            Ext.each(queryResult.unqueriedLayers, function(unqueriedLayer) {
                var f = {
                    id: unqueriedLayer.unqueriedLayerId,
                    type: unqueriedLayer.unqueriedLayerId,
                    attributes: {
                        contentOverride: {
                            title: unqueriedLayer.unqueriedLayerTitle,
                            text: unqueriedLayer.unqueriedLayerText
                        }
                    }
                };
                this.push(f);
            }, features);
        }

        features = this.extendFeaturesAttributes(features);
        if (features.length == 0) {
            this.showNotification(this.noFeatureFound, 5000);
            return;
        }

        this.vectorLayer.addFeatures(features);

        if (this.notificationTimeout) {
            window.clearTimeout(this.notificationTimeout);
            this.notificationTimeout = undefined;
        }
        if (this.notificationElement) {
            this.notificationElement.hide();
        }

        if (!this.grid) {
            this.createGrid();
        }
        // reorder features to put unqueried layers at the end
        if (this.showUnqueriedLayers) {
            this.store.data.each(function(record) {
                if (record.get('feature').attributes.contentOverride) {
                    this.store.remove(record, true);
                    this.store.insert(this.store.getTotalCount(), record);
                }
            }, this);
        }

        var first = false;
        if (!this.featuresWindow) {
            first = true;

            this.messageItem = new Ext.Toolbar.TextItem({
                text: '',
                cls: this.messageStyle
            });
            var bbar = new Ext.Toolbar({items: [this.messageItem]});
            if (queryResult.message) {
                /* we need the windows width to write the message, but we cant
                 get the windows width before it has been rendered, so we just
                 write some placeholder text to get the bbar sizing correct */
                this.messageItem.setText('&nbsp;');
            }

            this.featuresWindow = new Ext.Window(Ext.apply({
                layout: 'fit',
                width: 300,
                height: 280,
                title: this.windowTitleText,
                closeAction: 'hide',
                items: [this.grid],
                listeners: {
                    hide: function() {
                        this.store.removeAll();
                        this.vectorLayer.removeAllFeatures();
                    },
                    scope: this
                },
                bbar: bbar
            }, this.windowOptions));

        } else {
            this.featuresWindow.add(this.grid);
            if (queryResult.message) {
                /* we need the windows width to write the message, but we cant
                 get the windows width before it has been rendered, so we just
                 write some placeholder text to get the bbar sizing correct */
                this.messageItem.setText('&nbsp;');
                this.featuresWindow.bbar.show();
                this.featuresWindow.syncSize();
            }
            this.featuresWindow.doLayout();
        }

        this.featuresWindow.show();
        cgxp.tools.notification.close();

        // append new features to existing features in the store
        this.store.loadData(features, true);

        // position the attributes window the first time
        // then it should appear at the last position the user chose
        // also hide the toolbar if it is empty on first load
        if (first) {
            this.featuresWindow.alignTo(
                this.target.mapPanel.body,
                "tr-tr",
                [-5, 5],
                true
            );
            // needed to fully hide the toolbar and its container
            this.featuresWindow.bbar.setVisibilityMode(Ext.Element.DISPLAY);
            if (!queryResult.message) {
                this.featuresWindow.bbar.hide();
                this.featuresWindow.syncSize();
                this.featuresWindow.doLayout();
            }

        }
         // space calculation can only be performed once the window has been rendered
        if (queryResult.message) {
            this.setMessage(queryResult.message);
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
                    this.vectorLayer.drawFeature(feature, 'highlight');
                },
                rowmouseleave: function(grid, row) {
                    var feature = grid.getStore().getAt(row).getFeature();
                    this.vectorLayer.drawFeature(feature, 'default');
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
        this.grid.view.on('rowsinserted', function(view, firstRow, lastRow) {
            for (var row = firstRow ; row <= lastRow ; row++) {
                if (row < this.openFeatures) {
                    rowexpander.expandRow(row);
                }
                else {
                    break;
                }
            }
        }, this);
    },

    /** private: method[setMessage]
     *  Set the queryResult message, check if there is enough space to display it all
     */
    setMessage: function(msg) {
        // tests the space required by the TextItem
        this.messageItem.setText(msg);

        if ((this.featuresWindow.getInnerWidth() - 40) < this.messageItem.getWidth()) {
            msg = [
                '<abbr title="',
                msg,
                '">',
                this.suggestionText,
                '</abbr>'
            ].join('');
            this.messageItem.setText(msg);
        }
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
                };
                groupedRecords[attributes.type] = results;
            }
            for (var prop in attributes) {
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
