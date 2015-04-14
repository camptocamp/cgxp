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
 * @include Styler/widgets/FilterBuilder.js
 * @include GeoExt/data/AttributeStore.js
 * @include OpenLayers/Protocol/WFS/v1_1_0.js
 * @include OpenLayers/Format/WFSDescribeFeatureType.js
 * @include OpenLayers/Format/GML/v3.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Util.js
 * @include OpenLayers/StyleMap.js
 * @include OpenLayers/Style.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = QueryBuilder
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a QueryBuilder plugin to a
 *  `gxp.Viewer`, only for logged users:
 *
 *  .. code-block:: javascript
 *
 *      ...
 *      Ext.namespace("cgxp");
 *      // WFS namespace, depends of the backend used, default is for Mapserver
 *      cgxp.WFS_FEATURE_NS = "http://mapserver.gis.umn.edu/mapserver";
 *
 *      ...
 *      new gxp.Viewer({
 *          ...
 *          tools: [
 *      % if user:
 *          {
 *              ptype: 'cgxp_querier',
 *              outputTarget: "left-panel",
 *              events: EVENTS,
 *              mapserverproxyURL: "${request.route_url('mapserverproxy', path='')}",
 *              // don't work with actual version of mapserver, the proxy will limit to 200
 *              // it is intended to be reactivated this once mapserver is fixed
 *              srsName: 'EPSG:21781',
 *              featureTypes: ['layer1', 'layer2'],
 *              attributeURLs: { 'layer1': { 'fieldA': 'http://path/to/json' }},
 *              describeFeatureTypeParams: ${dumps(url_role_params) | n}
 *          }
 *      % endif
 *          ]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: QueryBuilder(config)
 *
 */
cgxp.plugins.QueryBuilder = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_querier */
    ptype: "cgxp_querier",

    /** api: config[options]
     *  ``Json Object``
     *  parameters for the panel
     */
    options: null,

    /** api: config[maxFeatures]
     *  ``Integer``
     *  Limit of features returned by mapserver. Default is 200.
     */
    maxFeatures: 200,

    /** api: config[mapserverproxyURL]
     *  ``String``
     *  url of the mapserver proxy
     */
    mapserverproxyURL: null,

    /** api: config[srid]
     *  ``String``
     *  projection EPSG code, for example EPSG:21781
     */
    srsName: null,

    /** api: config[events]
     *  ``Ext.util.Observable``
     */
    events: null,

    /** api: config[featureTypes]
     *  ``Array(String)``
     *  The name of the mapserver layers
     */
    featureTypes: null,

    /** api: config[matchCase]
     *  ``Boolean`` the matchCase WFS/GetFeature query argument.
     */
    matchCase: false,

    /** api: config[layerText]
     *  ``String`` Label for the layer chooser (i18n)
     */
    layerText: "Layer",

    /** api: config[querierText]
     *  ``String`` Title for the panel (i18n)
     */
    querierText: "Querier",

    /** api: config[attributeURLs]
     *  ``Object`` Optional list of URL to feed combos for given fields
     *  for given layer.
     */
    attributeURLs: {},

    /** api: config[describeFeatureTypeParams]
     *  ``Object`` Optional additional params given to DescribeFeatureType request
     */
    describeFeatureTypeParams: {},

    /* i18n */
    incompleteFormText: 'Incomplete form.',
    errorText: "An error occurred with the query builder.",
    noResultText: 'No result found',
    queryButtonText: 'Query',
    noGeomFieldError: 'No geometry field found.',
    loadingText: 'Loading...',

    /** private: property[panel]
     *  ``Ext.Panel`` The panel included in accordion panel with a card layout
     */
    panel: null,

    /** private: property[store]
     *  ``GeoExt.data.AttributeStore`` The store containing the properties of the queried layer
     */
    store: null,

    /** private: property[geometryName]
     *  ``String`` The name of the geom field
     */
    geometryName: null,

    /** private: property[protocol]
     *  ``OpenLayers.Protocol.WFS``
     */
    protocol: null,

    /** private: property[drawingLayer]
     *  ``OpenLayers.Layer.Vector``
     */
    drawingLayer: null,

    /** private: property[mask]
     *  ``Ext.LoadMask``
     */
    mask: null,

    /** private: property[storeUriProperty]
     *  ``String``
     */
    storeUriProperty: "url",

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var layers = [];
        for (var i=0; i < this.featureTypes.length; i++) {
            var ft = this.featureTypes[i];
            layers.push([ft, OpenLayers.i18n(ft)]);
        }
        var store = new Ext.data.ArrayStore({
            fields: ['layer', 'name'],
            data: layers
        });
        this.panel = new Ext.Panel(Ext.apply({
            title: this.querierText,
            layout: 'vbox',
            layoutConfig: {
                align: 'stretch',
                padding: '4px;'
            },
            defaults: {
                border: false
            },
            items: [{
                xtype: 'panel',
                tbar: {
                    cls: 'invisible-toolbar',
                    items: [{
                        xtype: 'tbtext',
                        text: this.layerText + Ext.layout.FormLayout.
                                prototype.labelSeparator
                    }, {
                        xtype: "combo",
                        store: store,
                        displayField: 'name',
                        valueField: 'layer',
                        value: store.getAt(0).get('layer'),
                        mode: 'local',
                        editable: false,
                        triggerAction: 'all',
                        listeners: {
                            select: function(combo, record, index) {
                                this.loadCapabilities(record);
                            },
                            scope: this
                        }
                    }]
                }
            }],
            listeners: {
                "collapse": function() {
                    if (this.drawingLayer) {
                        this.drawingLayer.setVisibility(false);
                    }
                    this.events.fireEvent("queryclose");
                },
                scope: this
            },
            scope: this
        }, this.options));

        this.loadCapabilities(store.getAt(0));

        return cgxp.plugins.QueryBuilder.superclass.addOutput.call(this, this.panel);
    },

    /** private: method[checkFilter]
     *  Checks that a filter is not missing items.
     *
     *  :arg filter: ``OpenLayers.Filter`` the filter
     *
     *  :returns: ``Boolean`` Filter is correct ?
     */
    checkFilter: function(filter) {
        var filters = filter.filters || [filter];
        for (var i=0, l=filters.length; i<l; i++) {
            var f = filters[i];
            if (f.CLASS_NAME == 'OpenLayers.Filter.Logical') {
                if (!this.checkFilter(f)) {
                    return false;
                }
            } else if (!(f.value !== '' && f.type &&
                (f.property || f.CLASS_NAME == "OpenLayers.Filter.Spatial"))) {
                alert(this.incompleteFormText);
                return false;
            } else if (f.CLASS_NAME == "OpenLayers.Filter.Comparison") {
                f.matchCase = this.matchCase;
            }
        }
        return true;
    },

    /** private: method[search]
     *  Gets the Filter Encoding string and sends the getFeature request
     */
    search: function(btn) {
        // we quickly check if nothing lacks in filter
        var filter = this.panel.get(1).getFilter();
        if (!this.checkFilter(filter)) {
            return;
        }
        btn.setIconClass('loading');
        this.events.fireEvent("querystarts");

        // we deactivate draw controls before the request is done.
        this.panel.get(1).deactivateControls();

        this.protocol.read({
            filter: filter,
            params: this.target.mapPanel.params,
            callback: function(response) {
                btn.setIconClass(btn.initialConfig.iconCls);
                if (!response.success()) {
                    alert(this.errorText);
                    return;
                }
                if (response.features && response.features.length) {
                    var fs = response, l = fs.features.length;
                    fs.maxFeatures = this.maxFeatures;
                    // required by ResultsPanel:
                    while (l--) {
                        fs.features[l].type = this.protocol.featureType;
                    }
                    if (fs.features.length == this.maxFeatures) {
                        // if the max number of allowed features is hit,
                        // send an additional request to get the total number
                        // of features matching the filter.
                        this.protocol.read({
                            filter: filter,
                            readOptions: {output: "object"},
                            resultType: "hits",
                            maxFeatures: null,
                            callback: function(response) {
                                var infos = {
                                    numberOfFeatures: response.numberOfFeatures
                                };
                                this.events.fireEvent("queryinfos", infos);
                            },
                            scope: this
                        });
                    }
                    this.events.fireEvent("queryresults", fs);
                } else {
                    alert(this.noResultText);
                }
            },
            scope: this
        });
    },

    /** private: method[createFilterBuilder]
     *  Create the query builder form interface
     *
     *  Remove any existing filter builder and create a new one.
     *
     *  :arg store: ``GeoExt.data.AttributeStore`` the attribute store
     */
    createFilterBuilder: function(store) {
        var owner = this.filterBuilder && this.filterBuilder.ownerCt;
        if (owner) {
            owner.remove(this.filterBuilder, true);
        }

        var style = OpenLayers.Util.extend({},
            OpenLayers.Feature.Vector.style['default']);

        var styleMap = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(
                OpenLayers.Util.extend(style, {
                    strokeWidth: 2,
                    strokeColor: "#ee5400",
                    fillOpacity: 0
                })
            )
        });

        this.drawingLayer = new OpenLayers.Layer.Vector('filter_builder', {
            displayInLayerSwitcher: false,
            styleMap: styleMap
        });

        this.filterBuilder = new Styler.FilterBuilder({
            flex: 1,
            border: true,
            cls: 'filter-builder',
            comboConfig: {
                width: 80
            },
            defaultBuilderType: Styler.FilterBuilder.ALL_OF,
            filterPanelOptions: {
                attributesComboConfig: {
                    displayField: "displayName",
                    listWidth: 200
                },
                values: {
                    storeUriProperty: this.storeUriProperty,
                    storeOptions: {
                        root: 'items',
                        fields: ['label', 'value']
                    },
                    comboOptions: {
                        displayField: 'label',
                        valueField: 'value'
                    }
                }
            },
            allowGroups: false,
            noConditionOnInit: false,
            deactivable: true,
            autoScroll: true,
            buttons: [{
                text: this.queryButtonText,
                iconCls: 'query',
                handler: function(b, e) {
                    this.search(b);
                },
                scope: this
            }],
            map: this.target.mapPanel.map,
            attributes: store,
            allowSpatial: true,
            vectorLayer: this.drawingLayer,
            listeners: {
                destroy: function() {
                    this.drawingLayer.destroy();
                },
                scope: this
            }
        });

        if (!owner) {
            owner = this.panel;
        }
        owner.add(this.filterBuilder);
        owner.doLayout();
    },

    /** private: method[createProtocol]
     *
     *  :arg store: ``GeoExt.data.AttributeStore`` the attribute store
     *  :arg featureType: ``String`` the featureType
     */
    createProtocol: function(store, featureType) {
        var idx = store.find('type',
            /^gml:(Multi)?(Point|LineString|Polygon|Curve|Surface|Geometry)PropertyType$/);
        if (idx > -1) {
            // we have a geometry
            var r = store.getAt(idx);
            this.geometryName = r.get('name');
            store.remove(r);
        } else {
            alert(this.noGeomFieldError);
            return;
        }

        this.protocol = new OpenLayers.Protocol.WFS({
            url: this.mapserverproxyURL,
            featureType: featureType,
            featureNS: cgxp.WFS_FEATURE_NS,
            srsName: this.srsName,
            version: "1.1.0",
            geometryName: this.geometryName
        });
    },

    /** private: method[loadCapabilities]
     */
    loadCapabilities: function(record) {
        var featureType = record.get('layer');
        if (this.drawingLayer) {
            this.drawingLayer.setVisibility(true);
        }
        if (!this.mask) {
            window.setTimeout(function() {
                this.mask = new Ext.LoadMask(this.panel.body.dom, {
                    msg: this.loadingText
                });
                this.mask.show();
            }.createDelegate(this), 10);
        } else {
            this.mask.show();
        }
        var store = new GeoExt.data.AttributeStore({
            url: this.mapserverproxyURL,
            fields: ["name", "type", "displayName"],
            baseParams: Ext.apply({
                "TYPENAME": featureType,
                "REQUEST": "DescribeFeatureType",
                "SERVICE": "WFS",
                "VERSION": "1.1.0"
            }, this.describeFeatureTypeParams),
            listeners: {
                "load": function() {
                    // one shot listener:
                    store.purgeListeners();
                    // attributes translation:
                    store.each(function(r) {
                        r.set("displayName", OpenLayers.i18n(r.get("name")));
                        if (featureType in this.attributeURLs &&
                            r.get("name") in this.attributeURLs[featureType]) {
                            r.set(this.storeUriProperty,
                                  this.attributeURLs[featureType][r.get("name")]);
                        }
                    }, this);
                    this.createProtocol(store, featureType);
                    this.createFilterBuilder(store);
                    if (this.mask) {
                        this.mask.hide();
                    }
                },
                "loadexception": function() {
                    if (this.mask) {
                        this.mask.hide();
                    }
                    alert(this.errorText);
                },
                scope: this
            },
            scope: this
        });
        store.load();
    }
});

Ext.preg(cgxp.plugins.QueryBuilder.prototype.ptype, cgxp.plugins.QueryBuilder);
