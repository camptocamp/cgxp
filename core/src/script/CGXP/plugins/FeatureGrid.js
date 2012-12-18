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
 * @include OpenLayers/Filter.js
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
 *              csvURL: "${request.route_url('csvecho')}",
 *              maxFeatures: 200,
 *              outputTarget: "featuregrid-container",
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
     *  ``Ext.util.Observable`` An ``Ext.util.Observable`` instance used
     *  to receive events from other plugins.
     *
     *  * ``queryopen``: sent on open query tool.
     *  * ``queryclose``: sent on closequery tool.
     *  * ``querystarts``: sent when the query button is pressed
     *  * ``queryresults(features)``: sent when the result is received
     */
    events: null,

    /** api: config[globalSelection]
     *  ``Boolean`` If true, selection state are remembered across all result
     *  tabs when switching tab.
     *  Also the "select all", "select none" and "toggle" buttons act on all tabs
     *  and not only the active tab.
     *  This also enable global result in export pdf. Default is false.
     */
    globalSelection: false,

    /** api: config[autoSelectFirst]
     *  ``Boolean`` If true, the first row of every result grid is automatically
     *  selected. Default is true.
     */
    autoSelectFirst: true,

    /** private: private[dummyForm]
     *  ``Object`` Fake form used for csv export.
     */
    dummyForm: null,

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
    /** api: config[suggestionText]
     *  ``String`` Text for the shortened notice message (i18n).
     */
    suggestionText: "Suggestion",

    /** api: config[messageStyle]
     *  ``String`` CSS style used for the queryResult message.
     */
    messageStyle: 'queryResultMessage',

    /** api: config[showUnqueriedLayers]
     *  ``Bool`` show or hide the unqueried layers in the tabpanel, default is true.
     */
    showUnqueriedLayers: true,

    /** private: property[selectAll]
     */

    /** private: method[init]
     */
    init: function() {
        this.dummyForm = Ext.DomHelper.append(document.body, {tag : 'form'});
        cgxp.plugins.FeatureGrid.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },

    /** private: method[viewerReady]
     */
    viewerReady: function() {
        this.target.mapPanel.map.addLayer(this.vectorLayer);
    },

    /** private: method[csvExport]
     *  Export as a CSV by default using the rfc4180 recommendation.
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
                for (var prop in attributes) {
                    if (attributes.hasOwnProperty(prop)) {
                        // special IE as it doesn't handle null element as string
                        if (attributes[prop] !== null) {
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
                form: this.dummyForm,
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
        var groupedRecords = [];

        var grids = [];

        if (this.tabpan.activeTab && this.currentGrid) {
            // list the grids to use
            if (!this.globalSelection &&
                this.currentGrid.getSelectionModel().getSelections().length > 0) {
                grids.push(this.currentGrid);
            } else {
                if (this.globalSelection) {
                    for (var grid in this.gridByType) {
                        if (this.gridByType.hasOwnProperty(grid)) {
                            grids.push(this.gridByType[grid]);
                        }
                    }
                } else {
                    grids.push(this.currentGrid);
                }
            }
            // get data from grids
            Ext.each(grids, function(grid) {
                var records = [];
                if (grids.length == 1) {
                    records = grid.getSelectionModel().getSelections();
                } else {
                    if (!this.globalSelection) {
                        records = grid.getStore().getRange();
                    } else if (grid.selection) {
                        records = grid.selection;
                    }
                }
                if (records.length === 0) {
                    return groupedRecords;
                }

                Ext.each(records, function(r) {
                    var attributes = r.getFeature().attributes;

                    var raw = {};
                    var index = 0;
                    // group records by type (layer)
                    if (!groupedRecords[grid.title]) {
                        var results = {
                            table: {
                                data: [],
                                columns: []
                            },
                            _newGroup: true
                        };
                        groupedRecords[grid.title] = results;
                    }
                    for (var prop in attributes) {
                        if (attributes.hasOwnProperty(prop)) {

                            var id = 'col' + index;
                            raw[id] = attributes[prop];
                            index++;
                            if (index > 9) {
                                break;
                            }
                            if (groupedRecords[grid.title]._newGroup) {
                                groupedRecords[grid.title][id] = OpenLayers.i18n(prop);
                                groupedRecords[grid.title].table.columns.push(id);
                            }
                        }
                    }
                    groupedRecords[grid.title].table.data.push(raw);
                    groupedRecords[grid.title]._newGroup = false;
                }, this);
            }, this);
        }
        return groupedRecords;
    },

    /** private: method[setMessage]
     *  Set the queryResult message, check if there is enough space to display it all
     */
    setMessage: function(msg) {
        var msg = msg;
        // tests the space required by the TextItem
        this.messageItem.setText(msg);
        
        if ((this.tabpan.getInnerWidth() - 370) < this.messageItem.getWidth()) {
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

    /** private: method[getCount]
     *  Gets the result count.
     */
    getCount: function() {
        if (!this.currentGrid) {
            return "0 " + this.resultText;
        }
        var count = this.currentGrid.getStore().getCount();
        var resultText = (count>1) ? this.resultsText : this.resultText;
        return (count == this.maxFeatures) ?
                this.maxFeaturesText + '(' + this.maxFeatures + ')' :
                count + " " + resultText;
    },

    /** private: method[showFeature]
     *  ``Ext.data.Record``
     */
    showFeature: function(record) {
        record.getFeature().style = OpenLayers.Feature.Vector.style['default'];
        record.getFeature().style.strokeWidth = 4;
        this.vectorLayer.drawFeature(record.getFeature());
    },

    /** private: method[showFeatures]
     *  ``Array`` Array of Ext.data.Record
     */
    showFeatures: function(records) {
        Ext.each(records, this.showFeature, this);
    },

    /** private: method[hideFeature]
     *  ``Ext.data.Record``
     */
    hideFeature: function(record) {
        record.getFeature().style = {display: 'none'};
        this.vectorLayer.eraseFeatures(record.getFeature());
    },

    /** private: method[hideFeatures]
     *  ``Array`` Array of Ext.data.Record
     */
    hideFeatures: function(records) {
        Ext.each(records, function(record) {
            this.hideFeature(record);
        }, this);
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

        this.events.on('querystarts', function() {
            if (this.currentGrid && this.currentGrid.getSelectionModel &&
                this.currentGrid.getStore()) {
                this.currentGrid.getSelectionModel().clearSelections();
            }
            this.currentGrid = null;
            this.vectorLayer.destroyFeatures();

            /* this is important, if the grid are not cleared and created a new,
               the event viewready is not triggered and we fall on an ext bug
               when we try to act on the grid before it is ready to be modified */
            for (var gridName in this.gridByType) {
                if (this.gridByType.hasOwnProperty(gridName)) {
                    var grid = this.gridByType[gridName];
                    grid.getSelectionModel().unbind();
                    grid.destroy();
                }
            }
            this.gridByType = {};

            if (this.tabpan) {
                /* since it is possible to have non-grid tabs and we want these
                non-grid tabs to always be at the end of the tab list, we need to
                remove them all and create them anew */
                this.tabpan.removeAll();
                this.tabpan.doLayout();
            }

            this.textItem.setText(this.getCount());
            this.messageItem.setText('');
        }, this);

        this.events.on('queryclose', function() {
            this.control && this.control.deactivate();
        }, this);

        this.events.on('queryresults', function(queryResult, selectAll) {
            features = queryResult.features;
            this.selectAll = selectAll;

            var previouslyNoFeature = this.vectorLayer.features.length === 0;

            // if no feature do nothing
            if ((!features || features.length === 0) &&
                    (!queryResult.unqueriedLayers || 
                    queryResult.unqueriedLayers.length === 0)) {
                // if really no feature close panel)
                if (previouslyNoFeature) {
                    this.tabpan.ownerCt.setVisible(false);
                    this.tabpan.ownerCt.ownerCt.doLayout();
                }
                return;
            }

            var currentType = {};
            for (var i = 0, len = features.length ; i < len ; i++) {
                var feature = features[i];
                var hasAttributes = false;
                var grid;
                var attribute;
                for (attribute in feature.attributes) {
                    if (feature.attributes.hasOwnProperty(attribute)) {
                        hasAttributes = true;
                        break;
                    }
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
                    for (attribute in feature.attributes) {
                        if (feature.attributes.hasOwnProperty(attribute)) {
                            fields.push({name: attribute, type: 'string'});
                            columns.push({header: OpenLayers.i18n(attribute), dataIndex: attribute});
                        }
                    }

                    var store = new GeoExt.data.FeatureStore({
                        layer: this.vectorLayer,
                        fields: fields,
                        featureFilter: new OpenLayers.Filter({
                            evaluate: function(f) {
                                return f.type == feature.type;
                            }
                        })
                    });

                    grid = new Ext.grid.GridPanel({
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
                        title: OpenLayers.i18n(feature.type),
                        ready: false
                    });
                    grid.getSelectionModel().on({
                        'rowdeselect': this.onRowDeselect,
                        'rowselect': this.onRowSelect,
                        scope: this
                    });
                    grid.on({
                        'rowdblclick': this.onRowDblClick,
                        'render': this.onRender,
                        'viewready': this.onViewReady,
                        scope: this
                    });
                    this.gridByType[feature.type] = grid;
                    // add the grid tab before the unqueried layer tabs, if any
                    var nbitems = this.tabpan.items.getCount();
                    if (nbitems > 0) {
                        var idx = 0;
                        for (var j=0, itemslen=nbitems; j<itemslen; j++)  {
                            if (this.tabpan.items.itemAt(j).getXType() != 'grid') {
                                idx = j;
                                break;
                            }
                        }
                        this.tabpan.insert(idx, grid);
                    } else {
                        this.tabpan.add(grid);
                    }
                } else {
                    grid = this.gridByType[feature.type];
                    // reset grid selection
                    grid.selection = null;
                    this.tabpan.unhideTabStripItem(grid);
                }
                this.vectorLayer.addFeatures(feature);
            }
            var type;
            for (type in currentType) {
                if (currentType.hasOwnProperty(type)) {
                    this.gridByType[type].getStore().filterBy(function(record) {
                        return record.getFeature().type === type && record.getFeature().layer;
                    });
                }
            }

            var hasFeature = this.vectorLayer.features.length !== 0;

            // select new tab only if it's the first receive
            if (hasFeature && previouslyNoFeature) {
                this.tabpan.setActiveTab(0);
                this.tabpan.ownerCt.setVisible(true);
                this.tabpan.ownerCt.expand();
                this.tabpan.ownerCt.ownerCt.doLayout();
            }
            else if (!hasFeature) {
                // if we get only features without attribute
                this.tabpan.ownerCt.setVisible(false);
                this.tabpan.ownerCt.ownerCt.doLayout();
            }

            if (queryResult.message) {
                this.setMessage(queryResult.message);
            }
            // add extra tab for special empty layers, if set
            if (queryResult.unqueriedLayers && this.showUnqueriedLayers) {
                for (var i=0, len=queryResult.unqueriedLayers.length; i<len; i++) {
                    // check if tab already exists
                    var tab = this.tabpan.find('title', queryResult.unqueriedLayers[i].unqueriedLayerId);
                    if (tab.length == 1) {
                        this.tabpan.unhideTabStripItem(tab[0]);
                    } else {
                        // create tab
                        var p = {
                            title: OpenLayers.i18n(queryResult.unqueriedLayers[i].unqueriedLayerId),
                            html: [queryResult.unqueriedLayers[i].unqueriedLayerTitle,
                              queryResult.unqueriedLayers[i].unqueriedLayerText].join('<br />')
                        };
                        this.tabpan.add(p);
                    }
                };
            }
            this.textItem.setText(this.getCount());
        }, this);

        this.textItem = new Ext.Toolbar.TextItem({
            text: ''
        });
        this.messageItem = new Ext.Toolbar.TextItem({
            text: '',
            cls: this.messageStyle
        });

        this.selectionButton = new Ext.SplitButton({
            text: this.selectText,
            handler: function() {
                if (this.globalSelection) {
                    // update selection list for all grids
                    for (var gridName in this.gridByType) {
                        if (this.gridByType.hasOwnProperty(gridName)) {
                            var grid = this.gridByType[gridName];
                            grid.selection = grid.getStore().getRange();
                            this.showFeatures(grid.selection);
                        }
                    }
                }
                var sm = this.currentGrid.getSelectionModel();
                sm.selectAll();
            }, // handle a click on the button itself
            menu: new Ext.menu.Menu({
                items: [
                    {text: this.selectAllText, handler: function() {
                        if (this.globalSelection) {
                            // update selection list for all grids
                            for (var gridName in this.gridByType) {
                                if (this.gridByType.hasOwnProperty(gridName)) {
                                    var grid = this.gridByType[gridName];
                                    grid.selection = grid.getStore().getRange();
                                    this.showFeatures(grid.selection);
                                }
                            }
                        }
                        var sm = this.currentGrid.getSelectionModel();
                        sm.selectAll();
                    },
                    scope: this},
                    {text: this.selectNoneText, handler: function() {
                        if (this.globalSelection) {
                            // update selection list for all grids
                            for (var gridName in this.gridByType) {
                                if (this.gridByType.hasOwnProperty(gridName)) {
                                    var grid = this.gridByType[gridName];
                                    this.hideFeatures(grid.selection);
                                    grid.selection = [];
                                }
                            }
                        }
                        var sm = this.currentGrid.getSelectionModel();
                        sm.clearSelections();
                    },
                    scope: this},
                    {text: this.selectToggleText, handler: function() {
                        if (this.globalSelection) {
                            // update selection list for all grids
                            var onEach = function(record) {
                                var found = false;
                                Ext.each(grid.selection, function(refrecord) {
                                    if (refrecord.get('id') == record.get('id')) {
                                        found = true;
                                    }
                                });
                                if (!found) {
                                    newSelection.push(record);
                                }
                            };
                            for (var gridName in this.gridByType) {
                                if (this.gridByType.hasOwnProperty(gridName)) {
                                    var newSelection = [];
                                    var grid = this.gridByType[gridName];
                                    grid.getStore().each(onEach);
                                    grid.selection = newSelection;
                                }
                            }
                        }
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
        });

        this.selectionActionButton = {
            text: this.actionsText,
            menu: new Ext.menu.Menu ({
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
            })
        };

        config = {
            xtype: 'tabpanel',
            plain: true,
            enableTabScroll: true,
            listeners: {
                'tabchange': function(tabpanel, tab) {
                    if (!tab) {
                        /* if the tabpanel has been rendered once and hidden (user 
                        clicked the remove all button), a tabchange event is triggered 
                        when the tabpanel is displayed again on next query, but
                        the tab is not ready and is yet undefined */
                        return;
                    }
                    if (tab.getXType() == 'grid') {
                        this.currentGrid = tab;
                        if (this.currentGrid && this.currentGrid.ready) {
                            /* this must be done here because the grid has already been
                               initialized and the event "viewready" is not triggered
                               anymore.
                               this is not done the first time the grid is initialized,
                               condition set by the custom ready property, see the
                               code of the "viewready" stage */
                            if (this.globalSelection && this.currentGrid.selection) {
                                // restore selection
                                this.currentGrid.getSelectionModel().selectRecords(
                                    this.currentGrid.selection);
                            } else if (this.autoSelectFirst) {
                                this.currentGrid.getSelectionModel().selectFirstRow();
                            } else {
                                var sm = this.currentGrid.getSelectionModel();
                                sm.clearSelections();
                            }
                        }
                        if (this.currentGrid) {
                            this.textItem.setText(this.getCount());
                        }
                        // re-enable grid related buttons
                        this.selectionButton.enable(); 
                        Ext.each(this.selectionActionButton.menu.items.items, function(item) {
                            item.enable();
                        });
                    } else {
                        // selected tab is not a grid, emptying the count
                        this.currentGrid = null;
                        this.textItem.setText(this.getCount());
                        // disable grid related buttons
                        this.selectionButton.disable(); 
                        Ext.each(this.selectionActionButton.menu.items.items, function(item) {
                            item.disable();
                        });
                    }
                },
                beforetabchange: function(p, n, o) {
                    if (o && o.getSelectionModel) {
                        if (this.globalSelection) {
                          // save selection
                          o.selection = o.getSelectionModel().getSelections();
                        } else {
                            // hide all feature of unselected tab
                            this.hideFeatures(o.getSelectionModel().getSelections());
                        }
                    }
                },
                scope: this
            },
            bbar: [
                this.selectionButton, this.selectionActionButton ,'->', 
                this.messageItem, '-', this.textItem, '-', {
                    text: this.clearAllText,
                    handler: function() {
                        this.vectorLayer.destroyFeatures();
                        this.textItem.setText(this.getCount());
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
    },

    /** private: method[onRowDeselect]
     */
    onRowDeselect: function (model, index, record) {
        this.hideFeature(record);
        if (this.globalSelection) {
            // store change
            model.grid.selection = model.getSelections();
        }
    },

    /** private: method[onRowSelect]
     */
    onRowSelect: function (model, index, record) {
        this.showFeature(record);
        if (this.globalSelection) {
            // store change
            model.grid.selection = model.getSelections();
        }
    },

    /** private: method[onRowDblClick]
     */
    onRowDblClick: function(gclickGrid, index) {
        var store = gclickGrid.getStore();
        var feature = store.getAt(index).getFeature();
        var center;
        if (feature.bounds) {
            center = feature.bounds.getCenterLonLat();
        } else if (feature.geometry) {
            var centroid = feature.geometry.getCentroid();
            center = new  OpenLayers.LonLat(centroid.x, centroid.y);
        }
        feature.layer.map.setCenter(center);
    },

    /** private: method[onRender]
     */
    onRender: function(renderGrid) {
        this.currentGrid = renderGrid;
    },

    /** private: method[onViewReady]
     */
    onViewReady: function(renderGrid) {
        var sm = this.currentGrid.getSelectionModel();

        // set grid as ready
        sm.grid.ready = true;

        if (!this.globalSelection) {
            sm.clearSelections();
        }
        if (this.selectAll) {
            sm.selectAll();
        } else if (this.globalSelection && sm.grid.selection) {
            sm.selectRecords(sm.grid.selection);
        } else if (this.autoSelectFirst) {
            sm.selectFirstRow();
        }

        /* the first time a tab is selected, the grid is rendered, but it happens
        after the tabchange event, so some actions are possible only now */
        this.textItem.setText(this.getCount());
    }
});

Ext.preg(cgxp.plugins.FeatureGrid.prototype.ptype, cgxp.plugins.FeatureGrid);
