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

/*
 * @requires CGXP/plugins/FeaturesResult.js
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
 *  class = FeaturesGrid
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a FeaturesGrid plugin to a
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
 *              ptype: "cgxp_featuresgrid",
 *              id: "featuresProvider",
 *              csvURL: "${request.route_url('csvecho')}",
 *              outputTarget: "featuresgrid-container",
 *              themes: THEMES,
 *              events: EVENTS
 *          }, {
 *              ptype: "cgxp_getfeature",
 *              actionTarget: "center.tbar",
 *              toggleGroup: "maptools",
 *              events: EVENTS,
 *              themes: THEMES,
 *              mapserverURL: "${request.route_url('mapserverproxy', path='')}",
 *              WFSTypes: ${WFSTypes | n},
 *              externalWFSTypes: ${externalWFSTypes | n},
 *              enableWMTSLayers: true
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: FeaturesGrid(config)
 *
 *      A plugin that adds a grid panel for displaying feature information (one
 *      feature per row).
 *
 *      This plugin is used to display results from query plugins such as
 *      :class:`cgxp.plugins.GetFeature` and :class:`cgxp.plugins.QueryBuilder`.
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
cgxp.plugins.FeaturesGrid = Ext.extend(cgxp.plugins.FeaturesResult, {

    /** api: ptype = cgxp_featuresgrid */
    ptype: "cgxp_featuresgrid",

    /** private: attribute[tabpan]
     *  ``Object``
     */
    tabpan: null,

    /** private: attribute[currentGrid]
     *  ``Object``
     *  The visible grid.
     */
    currentGrid: null,

    /** private: attribute[gridByType]
     *  ``Object``
     *  Stores grid by type.
     */
    gridByType: {},

    /** private: attribute[textItem]
     *  ``Object``
     *  Component used as a status bar.
     */
    textItem: null,

    /** private: attribute[control]
     *  ``OpenLayers.Control.SelectFeature``
     *  The OpenLayers control used to select the features.
     */
    control: null,

    /** api: config[csvSeparator]
     *  ``String`` Specifies the separator character for the exported
     *  CSV docs. Default is ',' (comma).
     */
    csvSeparator: ',',

    /** api: config[csvIncludeHeader]
     *  ``Boolean`` Specifies if the header row has to be included in the
     *  CSV. Default is 'False'.
     */
    csvIncludeHeader: false,

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
     *  * ``querystarts``: sent when the query button is pressed.
     *  * ``nolayer``: sent when no layer to query.
     *  * ``queryresults(features)``: sent when the result is received.
     *  * ``queryinfos``: sent when additional infos about the query are available.
     */
    events: null,

    /** api: config[themes]
     *  ``Object`` List of internal and external themes and layers. (The
     *  same object as passed to the :class:`cgxp.plugins.LayerTree`).
     */
    themes: null,

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

    /** private: attribute[dummyForm]
     *  ``Object`` Fake form used for csv export.
     */
    dummyForm: null,

    /** api: config[pointRecenterZoom]
     *  ``Integer`` Zoom level to use when recentering on point items (optional).
     */
    pointRecenterZoom: null,

    /** api: config[maxFeatures]
     *  ``Integer`` Maximum total number of features listed in all grids.
     *  Default is 200. If this plugin is combined to plugins that provide a
     *  ``maxFeatures`` parameter, such as ``cgxp.plugins.QueryBuilder`` or
     *  ``cgxp.plugins.GetFeature``, this value will be superseded by the
     *  value of the provided ``maxFeatures`` parameter.
     */
    maxFeatures: 200,

    /* i18n */
    clearAllText: "Clear all",
    selectText: "Select",
    selectAllText: "All",
    selectNoneText: "None",
    selectToggleText: "Toggle",
    actionsText: "Actions on selected results",
    zoomToSelectionText: "Zoom on selection",
    csvSelectionExportText: "Export as CSV",
    maxFeaturesText: "The maximum number of results is reached",
    resultText: "Total number of features: ",
    totalSurfaceText: "Total surface: ",
    totalLengthText: "Total length: ",
    totalResultText: "result",
    totalResultsText: "results",
    suggestionText: "Suggestion",
    noLayerSelectedMessage: "No layer selected",
    noLayerSelectedMessageTitle: "Info",    
    totalNbOfFeaturesText: "Total number of features: ",
    countingText: "(counting...)",
    
    /** api: config[statusTemplateText]
     *  ``String`` Template for the size and number of result label. Leave it empties ("") to
     *  get only the number of results and not the "size" part.
     */ 
    statusTemplateText: '{totalSizeText} {[values.geomSize.toFixed(2)]}{geomUnit} - {totalResult} {totalResultText}',
    
    /** api: config[messageStyle]
     *  ``String`` CSS style used for the queryResult message.
     */
    messageStyle: 'queryResultMessage',

    /** api: config[showUnqueriedLayers]
     *  ``Bool`` show or hide the unqueried layers in the tabpanel, default is true.
     */
    showUnqueriedLayers: true,

    /** api: config[concatenateTabs]
     *  ``Object`` Merge each layer in one tab for each given array.
     *  All layers from one array must have only identical attributes.
     *
     *  Exemple:
     *  concatenateTabs: {'tab_title': [layer1, ..., layerN]}
     */
    concatenateTabs: {},

    /** api: config[defaultStyle]
     *  ``Object``  A style properties object to be used to show all features
     *  on the map (optional).
     *
     *  Defaults to ``{ fillColor: 'red', strokeColor: 'red' }``.
     */
    defaultStyle: null,

    /** api: config[highlightStyle]
     *  ``Object``  A style properties object to be used to show features
     *  on the map when clicking on the rows in the grid (optional).
     *
     *  Defaults to ``{ fillColor: 'red', strokeColor: 'red', fillOpacity: 0.6,
     *  strokeOpacity: 1, strokeWidth: 2 }``.
     */
    highlightStyle: null,

    /** api: config[csvExtension]
     *  ``String``  The extension to use for the exported csv file.
     *  Default is 'csv'.
     */
    csvExtension: 'csv',

    /** api: config[csvEncoding]
     *  ``String``  The encoding to use for the exported csv file.
     *  Default is 'UTF-8'.
     */
    csvEncoding: 'UTF-8',

    /** private: attribute[selectAll]
     */

    /** private: attribute[numberOfFeatures]
     *  ``Integer`` Counter of features.
     */
    numberOfFeatures: 0,

    /** private: attribute[numberOfReturnedFeatures]
     *  ``Integer`` Counter of features actually returned by the query.
     */
    numberOfReturnedFeatures: 0,

    /** private: attribute[enableTotalHits]
     *  ``Boolean`` Tells if an additional WFS request is done to get the total
     *  number of hits when maxFeatures limit is reached.
     */
    enableTotalHits: false,

    /** private: method[init]
     */
    init: function() {
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
        this.dummyForm = Ext.DomHelper.append(document.body, {tag : 'form'});
        cgxp.plugins.FeaturesGrid.superclass.init.apply(this, arguments);
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
            Ext.each(records, function(r, index) {
                var attributes = r.getFeature().attributes;
                var properties = [];
                var q = this.quote;
                // Include header row
                if (this.csvIncludeHeader && index === 0) {
                    var header = [];
                    Ext.iterate(attributes, function iter(key, attr) {
                        header.push(q + OpenLayers.i18n(key).replace(q, q+q) + q);
                    }, this);
                    csv.push(header.join(this.csvSeparator));
                }
                for (var prop in attributes) {
                    if (attributes.hasOwnProperty(prop)) {
                        // special IE as it doesn't handle null element as string
                        if (attributes[prop] !== null) {
                            properties.push(q + attributes[prop].replace(q, q+q) + q);
                        } else {
                            properties.push(q + q);
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
                    csv: csv.join('\n'),
                    csv_extension: this.csvExtension,
                    csv_encoding: this.csvEncoding
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
        var groupedRecords = {};

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
                if (grids.length === 1) {
                    records = grid.getSelectionModel().getSelections();
                } else {
                    if (!this.globalSelection) {
                        records = grid.getStore().getRange();
                    } else if (grid.selection) {
                        records = grid.selection;
                    }
                }
                if (records.length === 0) {
                    return;
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
        if (!this.currentGrid || !this.currentGrid.getStore()||
                !this.currentGrid.getStore().totalLength ||
                !this.currentGrid.getStore().getAt(0)) {
            return '';
        }

        var feature = this.currentGrid.getStore().getAt(0).getFeature();
        var count = this.currentGrid.getStore().getCount();
        var resultText = (count>1) ? this.totalResultsText : this.totalResultText;

        if (!this.statusTemplateText || !feature || !feature.geometry ||
                feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point"){
            return count + " " +  resultText;
        }

        var tpl = new Ext.XTemplate(this.statusTemplateText);
        var geomSize = 0;
        var isPolygon = false;
        var i = 0;
        if (feature && feature.geometry) {
            if (feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
                isPolygon = true;
                for (i; i<count; i++ ) {
                    feature = this.currentGrid.getStore().getAt(i).getFeature();
                    geomSize += feature.geometry.getArea();
                }
            }
            else if (feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
                for (i; i<count; i++) {
                    feature = this.currentGrid.getStore().getAt(i).getFeature();
                    geomSize += feature.geometry.getLength();
                }
            }
        }
        
        return tpl.apply({
            totalSizeText: isPolygon ? this.totalSurfaceText : this.totalLengthText,
            geomSize: geomSize,
            geomUnit: this.target.mapPanel.map.getUnits() + (isPolygon ? '²' : ''),
            totalResult: count,
            totalResultText: resultText
        });
    },

    /** private: method[showFeature]
     *  ``Ext.data.Record``
     */
    showFeature: function(record) {
        this.vectorLayer.drawFeature(record.getFeature(), 'select');
    },

    /** private: method[showFeatures]
     *  ``Array(Ext.data.Record)``
     */
    showFeatures: function(records) {
        Ext.each(records, this.showFeature, this);
    },

    /** private: method[hideFeature]
     *  ``Ext.data.Record``
     */
    hideFeature: function(record) {
        this.vectorLayer.drawFeature(record.getFeature(), 'default');
    },

    /** private: method[hideFeatures]
     *  ``Array(Ext.data.Record)``
     */
    hideFeatures: function(records) {
        Ext.each(records, function(record) {
            this.hideFeature(record);
        }, this);
    },

    /** private: method[getTabName]
     * Returns the name of the tab that contains the given featureType
     * or the featureType.
     */
    getTabName: function(featureType) {
        var typeKey;
        for (typeKey in this.concatenateTabs) {
            if (this.concatenateTabs[typeKey] instanceof Array) {
                if (this.concatenateTabs[typeKey].indexOf(featureType) > 0) {
                    return typeKey;
                }
            }
        }
        return featureType; 
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
            'nolayer': true,
            'queryresults': true,
            'queryinfos': true
        });

        // a ResultsPanel object has its own vector layer, which
        // is added to the map once for good
        this.createVectorLayer({
            styleMap: new OpenLayers.StyleMap({
                'default': this.defaultStyle,
                'select': this.highlightStyle
            })
        });

        this.events.on('querystarts', function() {
            if (this.currentGrid && this.currentGrid.getSelectionModel &&
                this.currentGrid.getStore()) {
                this.currentGrid.getSelectionModel().clearSelections();
            }
            this.currentGrid = null;
            this.vectorLayer.destroyFeatures();

            // reset counter when new query is triggered
            this.numberOfFeatures = 0;
            this.numberOfReturnedFeatures = 0;
            this.enableTotalHits = false;

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

        this.events.on('nolayer', function() {
            Ext.MessageBox.alert(this.noLayerSelectedMessageTitle, 
                                 this.noLayerSelectedMessage);
        }, this);

        this.events.on('queryclose', function() {
            if (this.control) {
                this.control.deactivate();
            }
        }, this);
        
        this.events.on('queryinfos', function(infos) {
            if ('numberOfFeatures' in infos) {
                this.numberOfFeatures += infos.numberOfFeatures;
                var msg = '';
                if (this.numberOfReturnedFeatures == this.maxFeatures) {
                    msg += this.maxFeaturesText + ' (' + this.maxFeatures + ') - '; 
                }
                msg += this.totalNbOfFeaturesText + this.numberOfFeatures;
                this.setMessage(msg);
            }
        }, this);

        this.events.on('queryresults', function(queryResult, selectAll) {
            features = queryResult.features;
            this.numberOfReturnedFeatures = features.length;
            if ('maxFeatures' in queryResult) {
                this.maxFeatures = queryResult.maxFeatures;
            }
            if ('enableTotalHits' in queryResult) {
                this.enableTotalHits = queryResult.enableTotalHits;
            }
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
                var tabName;
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

                this.vectorLayer.addFeatures(feature);

                tabName = this.getTabName(feature.type);
                currentType[tabName] = true;

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

                if (this.gridByType[tabName] === undefined) {
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
                            forceFit: (columns.length < 9),
                            templates: {
                                // The cell template is overridden to enable selecting cell's content.
                                cell: new Ext.Template(
                                    '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} x-selectable {css}" style="{style}" tabIndex="0" {cellAttr}>',
                                    '<div class="x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
                                    '</td>'
                                )
                            }
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
                        title: OpenLayers.i18n(tabName),
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
                    this.gridByType[tabName] = grid;
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
                    grid = this.gridByType[tabName];
                    // reset grid selection
                    grid.selection = null;
                    this.tabpan.unhideTabStripItem(grid);
                }
            }
            var type;
            for (type in currentType) {
                if (currentType.hasOwnProperty(type)) {
                    this.gridByType[type].getStore().filterBy(function(record) {
                        var recordFeature = record.getFeature();
                        var tabName = this.getTabName(recordFeature.type);
                        return tabName === type && recordFeature.layer;
                    }, this);
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

            if (queryResult.message && this.vectorLayer.features.length > 0) {
                this.setMessage(queryResult.message);
            } else if (this.numberOfReturnedFeatures == this.maxFeatures) {
                if (this.enableTotalHits) {
                    this.setMessage(this.totalNbOfFeaturesText + this.countingText);
                } else {
                    this.setMessage(this.maxFeaturesText + ' (' + this.maxFeatures + ')');
                }
            }

            // add extra tab for special empty layers, if set
            if (queryResult.unqueriedLayers && this.showUnqueriedLayers) {
                for (var k=0, lenk=queryResult.unqueriedLayers.length; k<lenk; k++) {
                    // check if tab already exists
                    var tab = this.tabpan.find('title', queryResult.unqueriedLayers[k].unqueriedLayerId);
                    if (tab.length === 1) {
                        this.tabpan.unhideTabStripItem(tab[0]);
                    } else {
                        // create tab
                        var p = {
                            title: OpenLayers.i18n(queryResult.unqueriedLayers[k].unqueriedLayerId),
                            html: [queryResult.unqueriedLayers[k].unqueriedLayerTitle,
                              queryResult.unqueriedLayers[k].unqueriedLayerText].join('<br />')
                        };
                        this.tabpan.add(p);
                    }
                }
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
                                    if (refrecord.get('id') === record.get('id')) {
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
                        // has selection
                        if (bbox.left !== null) {
                            // is a point
                            if (bbox.getWidth() + bbox.getHeight() === 0) {
                                map.setCenter(bbox.getCenterLonLat(),
                                    this.pointRecenterZoom);
                            }
                            else {
                                map.zoomToExtent(bbox.scale(1.05));
                            }
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
                this.selectionButton, this.selectionActionButton, '->',
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

        this.tabpan = cgxp.plugins.FeaturesGrid.superclass.addOutput.call(this, config);
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

Ext.preg(cgxp.plugins.FeaturesGrid.prototype.ptype, cgxp.plugins.FeaturesGrid);
