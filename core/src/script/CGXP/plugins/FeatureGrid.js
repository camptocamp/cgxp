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
 * @include GeoExt/widgets/tree/LayerContainer.js
 * @include GeoExt/widgets/tree/LayerLoader.js
 * @include GeoExt/plugins/TreeNodeComponent.js
 * @include GeoExt/widgets/LayerOpacitySlider.js
 * @include GeoExt/widgets/tips/LayerOpacitySliderTip.js
 * @include GeoExt/widgets/grid/FeatureSelectionModel.js
 * @include GeoExt/data/FeatureStore.js
 * @include OpenLayers/Filter/Comparison.js
 * @include OpenLayers/StyleMap.js
 * @include OpenLayers/Rule.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Control/SelectFeature.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FeatureGrid
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a FeatureGrid plugin to a
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
 *              ptype: "cgxp_featuregrid",
 *              id: "featureGrid",
 *              csvURL: "$${request.route_url('csvecho')}",
 *              maxFeatures: 200,
 *              outputTarget: "featuregrid-container",
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
 *  .. class:: FeatureGrid(config)
 *
 *      A plugin that adds a grid panel for displaying feature information (one
 *      feature per row).
 *
 *      This plugin is used to display results from query plugins such as
 *      :class:`cgxp.plugins.WMSGetFeatureInfo`, and
 *      :class:`cgxp.plugins.QueryBuilder`.
 *
 */   
cgxp.plugins.FeatureGrid = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_featuregrid */
    ptype: "cgxp_featuregrid",

    /** private: attibute[this.tabpan]
     *  ``Object``
     */
    tabpan: null,

    /** private: attibute[currentGrid]
     *  ``Object``
     *  The visible grid.
     */
    currentGrid: null,

    /** private: attibute[vectorLayer]
     *  ``OpenLayers.Layer.Vector``
     *  The layer used to display the features.
     */
    vectorLayer: null,

    /** private: attibute[gridByType]
     *  ``Object``
     *  Stores grid by type.
     */
    gridByType: {},

    /** private: attibute[textItem]
     *  ``Object``
     *  Component used as a status bar.
     */
    textItem: null,

    /** private: attibute[control]
     *  ``OpenLayers.Control.SelectFeature``
     *  The OpenLayers control used to select the features.
     */
    control: null,

    /** api: config[csvSeparator]
     *  ``String`` Specifies the separator character for the exported
     *  CSV docs. Default is ',' (comma).
     */
    csvSeparator: ',',

    /** api: config[quote]
     *  ``String`` Specifies the character to delimit strings in the
     *  exported CSV docs. Default is '"' (double quote).
     */
    quote: '"',

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

    /** private: private[dummy_form]
     *  ``Object`` Fake form used for csv export.
     */
    dummy_form: Ext.DomHelper.append(document.body, {tag : 'form'}),

    /** api: config[clearAllText]
     *  ``String`` Text for the "clear all results" button (i18n).
     */
    clearAllText: "Clear all",
    /** api: config[selectText]
     *  ``String`` Text for the "select results" button (i18n).
     */
    selectText: "Select",
    /** api: config[selectAllText]
     *  ``String`` Text for the "select all results" menu item (i18n).
     */
    selectAllText: "All",
    /** api: config[selectNoneText]
     *  ``String`` Text for the "select none" menu item (i18n).
     */
    selectNoneText: "None",
    /** api: config[selectToggleText]
     *  ``String`` Text for the "toggle selection" menu item (i18n).
     */
    selectToggleText: "Toggle",
    /** api: config[actionsText]
     *  ``String`` Text for the "actions on selected results" button (i18n).
     */
    actionsText: "Actions on selected results",
    /** api: config[zoomToSelectionText]
     *  ``String`` Text for the "zoom to selection" menu item (i18n).
     */
    zoomToSelectionText: "Zoom on selection",
    /** api: config[csvSelectionExportText]
     *  ``String`` Text for the "export as csv" menu item (i18n).
     */
    csvSelectionExportText: "Export as CSV",
    /** api: config[maxFeaturesText]
     *  ``String`` Text for the "reached max number of features" label (i18n).
     */
    maxFeaturesText: "Maximum of results",
    /** api: config[resultText]
     *  ``String`` Text for the "number of result" label (singular) (i18n).
     */
    resultText: "Result",
    /** api: config[resultsText]
     *  ``String`` Text for the "number of result" label (plural) (i18n).
     */
    resultsText: "Results",

    init: function() {
        cgxp.plugins.FeatureGrid.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        this.target.mapPanel.map.addLayer(this.vectorLayer);
    },

    /** private: method[csvExport]
     *  Export as a SCV by default using the rfc4180 recomantation.
     *  http://tools.ietf.org/html/rfc4180
     */
    csvExport: function() {
        if (this.tabpan.activeTab) {
            var csv = [];
            var records = this.currentGrid.getSelectionModel().getSelections();

            if (records.length === 0) {
                records = this.currentGrid.getStore().getRange();
            }
            if (records.length === 0) {
                return;
            }
            Ext.each(records, function(r) {
                var attributes = r.getFeature().attributes;
                var properties = [];
                for (prop in attributes) {
                    if (attributes.hasOwnProperty(prop)) {
                        // special IE as it doesnt handle null element as string
                        if (attributes[prop] != null) {
                            properties.push(this.quote + attributes[prop].replace(this.quote, this.quote+this.quote) + this.quote);
                        } else {
                            properties.push(this.quote + this.quote);
                        }
                    }
                }
                csv.push(properties.join(this.csvSeparator));
            }, this);

            Ext.Ajax.request({
                url: this.csvURL,
                method: 'POST',
                params: {
                    name: this.currentGrid.title,
                    csv: csv.join('\n')
                },
                form: this.dummy_form,
                isUpload: true
            });
        }
    },

    /** private: method[printExport]
     *  Export for print.
     *  Columns titles will be stored on 'col1', 'col2', ... of the page.
     *  The dataset name is 'table '.
     *  The columns names will be 'col1', 'col2', ....
     */
    printExport: function() {
        var results = {col0: '', table:{data:[{col0: ''}], columns:['col0']}};
        if (this.tabpan.activeTab && this.currentGrid) {
            var records = this.currentGrid.getSelectionModel().getSelections();
            if (records.length === 0) {
                records = this.currentGrid.getStore().getRange();
            }
            if (records.length === 0) {
                return results;
            }
            var firstRow = true;
            Ext.each(records, function(r) {
                var attributes = r.getFeature().attributes;
                var index = 0;
                var raw = {};
                if (firstRow) {
                    results.table.columns = [];
                    results.table.data = [];
                }
                for (prop in attributes) {
                    if (attributes.hasOwnProperty(prop)) {
                        var id = 'col' + index;
                        raw[id] = attributes[prop];
                        index++;
                        if (index > 9) {
                            break;
                        }
                        if (firstRow) {
                            results[id] = OpenLayers.i18n(prop);
                            results.table.columns.push(id);
                        }
                    }
                }
                firstRow = false;
                results.table.data.push(raw);
            });
        }
        return results;
    },
    
    /** private: method[getCount]
     *  Gets the result count.
     */
    getCount: function() {
        if (!this.currentGrid) {
            return '';
        }
        var count = this.currentGrid.getStore().getCount();
        var resultText = (count>1) ? this.resultsText : this.resultText;
        return (count == this.maxFeatures) ?
                this.maxFeaturesText + '(' + this.maxFeatures + ')' :
                count + " " + resultText;
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var map = this.target.mapPanel.map;

        this.events.addEvents({
            'queryopen': true,
            'queryclose': true,
            'querystarts': true,
            'queryresults': true
        });


        // a ResultsPanel object has its own vector layer, which
        // is added to the map once for good
        this.vectorLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("c2cgeoportal"), {
                displayInLayerSwitcher: false,
                alwaysInRange: true
        });

        this.events.on('queryopen', function() {
        }, this);
     
        this.events.on('queryclose', function() {
            this.control && this.control.deactivate();
        }, this);
       
        this.events.on('querystarts', function() {
            if (this.currentGrid !== null) {
                this.currentGrid.getSelectionModel().clearSelections();
            }
            this.currentGrid = null;
            this.vectorLayer.destroyFeatures();
            if (this.tabpan !== null) {
                this.tabpan.items.each(function (item) {
                    this.tabpan.hideTabStripItem(item);
                }.createDelegate(this));
                this.tabpan.doLayout();
            }
        }, this);

        this.events.on('queryresults', function(features, selectAll) {

            // if no feature do nothing
            if (!features || features.length == 0) {
                return;
            }

            var currentType = {}, feature;
            for (var i = 0, len = features.length ; i < len ; i++) {
                feature = features[i];
                var hasAttributes = false;
                for (var attribute in feature.attributes) {
                    hasAttributes = true;
                    break;
                }
                // don't use feature without attributes
                if (!hasAttributes) {
                    continue;
                }

                if (!feature.geometry && feature.bounds) {
                    feature.geometry = feature.bounds.toGeometry();
                }

                feature.style = {display: 'none'};
                currentType[feature.type] = true;

                if (!this.control) {
                    this.control = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
                        toggle: true,
                        multiple: true,
                        multipleKey: (Ext.isMac ? "metaKey" : "ctrlKey")
                    });
                    map.addControl(this.control);
                    this.control.handlers.feature.stopDown = false;
                } else {
                    this.control.activate();
                }

                if (this.gridByType[feature.type] === undefined) {
                    var fields = [];
                    var columns = [];
                    for (var attribute in feature.attributes) {
                        fields.push({name: attribute, type: 'string'});
                        columns.push({header: OpenLayers.i18n(attribute), dataIndex: attribute});
                    }

                    var store = new GeoExt.data.FeatureStore({
                        layer: this.vectorLayer,
                        fields: fields
                    });
                
                    var grid = new Ext.grid.GridPanel({
                        store: store,
                        viewConfig: {
                            // we add an horizontal scroll bar in case 
                            // there are too many attributes to display:
                            forceFit: (columns.length < 9)
                        },
                        colModel: new Ext.grid.ColumnModel({
                            defaults: {
                                sortable: true
                            },
                            columns: columns
                        }),
                        sm: new GeoExt.grid.FeatureSelectionModel({
                            selectControl: this.control,
                            singleSelect: false
                        }),
                        title: OpenLayers.i18n(feature.type)
                    });
                    grid.getSelectionModel().on('rowdeselect', function (model, index, record) {
                        record.getFeature().style = {display: 'none'};
                    });
                    grid.getSelectionModel().on('rowselect', function (model, index, record) {
                        record.getFeature().style = OpenLayers.Feature.Vector.style['default'];
                        record.getFeature().style.strokeWidth = 4;
                    });
                    grid.on('rowdblclick', function(gclickGrid, index) {
                        var feature = store.getAt(index).getFeature();
                        if (feature.bounds) {
                            var center = feature.bounds.getCenterLonLat();
                        } else if (feature.geometry) {
                            var centroid = feature.geometry.getCentroid();
                            center = new  OpenLayers.LonLat(centroid.x, centroid.y);
                        }
                        feature.layer.map.setCenter(center);
                    }, this);
                    // task to fix an ext bug ...
                    var task = new Ext.util.DelayedTask(function() {
                        var sm = this.currentGrid.getSelectionModel();
                        sm.clearSelections();
                        if (selectAll) {
                            sm.selectAll();
                        } else {
                            sm.selectFirstRow();
                        }
                    }, this);
                    grid.on('render', function(renderGrid) {
                        if (this.currentGrid != null) {
                            this.currentGrid.getSelectionModel().clearSelections();
                        }
                        this.currentGrid = renderGrid
                        task.delay(200);
                    }, this);
                    this.gridByType[feature.type] = grid;
                    this.tabpan.add(grid);
                } else {
                    var grid = this.gridByType[feature.type];
                    this.tabpan.unhideTabStripItem(grid);
                }
                this.vectorLayer.addFeatures(feature);
            }
            for (type in currentType) {
                this.gridByType[type].getStore().filterBy(function(record) {
                    return record.getFeature().type === type && record.getFeature().layer;
                });
            }
            for (type in this.gridByType) {
                if (currentType[type]) {
                    var firstType = type;
                    continue;
                }
            }
            this.tabpan.setActiveTab(this.gridByType[firstType].id);
            this.textItem.setText(this.getCount());
            this.currentGrid = this.tabpan.getActiveTab();
            this.tabpan.ownerCt.setVisible(true);
            this.currentGrid.getSelectionModel().selectFirstRow();
            this.tabpan.ownerCt.expand();
            this.tabpan.ownerCt.ownerCt.doLayout();
        }, this);
        

        this.textItem = new Ext.Toolbar.TextItem({
            text: ''
        }); 

        config = {
            xtype: 'tabpanel',
            plain: true,
            enableTabScroll: true,
            listeners: {
                'tabchange': function(tabpanel, tab) {
                    if (this.currentGrid != null) {
                        this.currentGrid.getSelectionModel().clearSelections();
                    }
                    this.currentGrid = tab;
                    if (this.currentGrid != null) {
                        this.currentGrid.getSelectionModel().selectFirstRow();
                        this.textItem.setText(this.getCount());
                    }
                },
                scope: this
            },
            bbar: [
                new Ext.SplitButton({
                    text: this.selectText,
                    handler: function() {
                        var sm = this.currentGrid.getSelectionModel();
                        sm.selectAll();
                    }, // handle a click on the button itself
                    menu: new Ext.menu.Menu({
                        items: [
                            {text: this.selectAllText, handler: function() {
                                var sm = this.currentGrid.getSelectionModel();
                                sm.selectAll();
                            },
                            scope: this},
                            {text: this.selectNoneText, handler: function() {
                                var sm = this.currentGrid.getSelectionModel();
                                sm.clearSelections();
                            },
                            scope: this},
                            {text: this.selectToggleText, handler: function() {
                                var sm = this.currentGrid.getSelectionModel();
                                var recordsToSelect = [];
                                this.currentGrid.getStore().each(function(record) {
                                    if (!sm.isSelected(record)) {
                                        recordsToSelect.push(record);
                                    }
                                    return true;
                                });
                                sm.clearSelections();
                                sm.selectRecords(recordsToSelect);
                            }, 
                            scope: this}
                        ]
                    }), 
                    scope: this
                }),
                {
                    text: this.actionsText,
                    //iconCls: 'user',
                    menu: {
                        xtype: 'menu',
                        plain: true,
                        items: [{
                            text: this.zoomToSelectionText, 
                            handler: function() {
                                var sm = this.currentGrid.getSelectionModel();
                                var bbox = new OpenLayers.Bounds();
                                Ext.each(sm.getSelections(), function(r){
                                    bbox.extend(r.getFeature().geometry.getBounds());
                                });
                                if (bbox.getWidth() + bbox.getHeight() > 0) {
                                    map.zoomToExtent(bbox.scale(1.05));
                                }
                            },
                            scope: this
                        }, {
                            text: this.csvSelectionExportText, 
                            handler: this.csvExport,
                            target: this,
                            scope: this
                        }]
                    }
                } ,'->', this.textItem, '-', {
                    text: this.clearAllText,
                    handler: function() {
                        this.vectorLayer.destroyFeatures();
                        this.textItem.setText('');
                        this.tabpan.ownerCt.setVisible(false);
                        this.tabpan.ownerCt.ownerCt.doLayout();
                    },
                    scope: this
                }
            ]
        };

        this.tabpan = cgxp.plugins.FeatureGrid.superclass.addOutput.call(this, config);
        this.tabpan.ownerCt.on("expand", function() {
            this.vectorLayer.setVisibility(true);
        }, this);
        this.tabpan.ownerCt.on("collapse", function() {
            this.vectorLayer.setVisibility(false);
        }, this);
        return this.tabpan;
    }
});

Ext.preg(cgxp.plugins.FeatureGrid.prototype.ptype, cgxp.plugins.FeatureGrid);

