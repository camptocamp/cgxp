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
 * @include Styler/widgets/FilterBuilder.js
 * @include GeoExt/data/AttributeStore.js
 * @include OpenLayers/Protocol/WFS/v1_1_0.js
 * @include OpenLayers/Format/WFSDescribeFeatureType.js
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

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

if(!window.App) App = {};
// Maximum number of features returned by query
App.MAX_FEATURES = App.MAX_FEATURES || 100;

/** api: constructor
 *  .. class:: QueryBuilder(config)
 *
 */   
cgxp.plugins.QueryBuilder = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = cgxp_print */
    ptype: "cgxp_querier",

    /** 
     *  Property: options
     *  json object
     */
    options: null,

    /** 
     *  Property: events
     *  {Ext.util.Observable}
     */
    events: null,

    /**
     * Property: panel
     * {Ext.Panel} The panel included in accordion panel with a card layout
     */
    panel: null,
    
    /**
     * Property: querierPanel
     * {Ext.Panel} The querier panel (child of panel)
     */
    querierPanel: null,
    
    /**
     * Property: store
     * {GeoExt.data.AttributeStore} The store containing the properties of the queried layer
     */
    store: null,
    
    /**
     * Property: geometryName
     * {String} The name of the geom field
     */
    geometryName: null,
    
    /**
     * Property: protocol
     * {OpenLayers.Protocol.WFS}
     */
    protocol: null,
    
    /**
     * Property: featureType
     * {String} The name of the mapserver layer
     */
    featureType: App["queryBuilderLayer"],
    
    /**
     * Property: drawingLayer
     * {OpenLayers.Layer.Vector}
     */
    drawingLayer: null,
    
    /**
     * Property: mask
     * {Ext.LoadMask}
     */
    mask: null,

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        
        /**
         * Method: checkFilter
         * Checks that a filter is not missing items.
         *
         * Parameters:
         * filter - {OpenLayers.Filter} the filter
         *
         * Returns:
         * {Boolean} Filter is correct ?
         */
        var checkFilter = function(filter) {
            var filters = filter.filters || [filter];
            for (var i=0, l=filters.length; i<l; i++) {
                var f = filters[i];
                if (f.CLASS_NAME == 'OpenLayers.Filter.Logical') {
                    if (!checkFilter(f)) {
                        return false;
                    }
                } else if (!(f.value && f.type && 
                    (f.property || f.CLASS_NAME == "OpenLayers.Filter.Spatial"))) {
                    alert(OpenLayers.i18n("QueryBuilder.incomplete_form"));
                    return false;
                } else if (f.CLASS_NAME == "OpenLayers.Filter.Comparison") {
                    f.matchCase = false;
                }
            }
            return true;
        };

        /**
         * Method: search
         * Gets the Filter Encoding string and sends the getFeature request
         */
        var search = function(btn) {
            
            // we quickly check if nothing lacks in filter
            var filter = this.panel.get(1).getFilter();
            if (!checkFilter(filter)) {
                return;
            }
            btn.setIconClass('loading');
            this.events.fireEvent("querystarts");
            
            // we deactivate draw controls before the request is done.
            this.panel.get(1).deactivateControls();
            
            this.protocol.read({
                // don't work with actual version of mapserver, the proxy will limit to 200
                // features to protect the browser.
                // maxFeatures: App.MAX_FEATURES || 100,
                filter: filter,
                callback: function(response) {
                    btn.setIconClass(btn.initialConfig.iconCls);
                    if (!response.success()) {
                        alert(OpenLayers.i18n('QueryBuilder.getfeature_exception'));
                        return;
                    }
                    if (response.features && response.features.length) {
                        var fs = response.features, l = fs.length;
                        // required by ResultsPanel:
                        while(l--) {
                            fs[l].type = this.featureType;
                        }
                        this.events.fireEvent("queryresults", fs);
                    } else {
                        alert(OpenLayers.i18n('QueryBuilder.no_result'));
                    }
                },
                scope: this
            });
        }.createDelegate(this);

        /**
         * Method: createQuerierPanel
         * Create the query builder form interface
         */
        var createQuerierPanel = function() {
            
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
            
            this.querierPanel = this.panel.add({
                xtype: 'gx_filterbuilder',
                preComboText: OpenLayers.i18n("QueryBuilder.match"),
                postComboText: OpenLayers.i18n("QueryBuilder.of"),
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
                        storeUriProperty: 'url',
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
                    text: OpenLayers.i18n('QueryBuilder.query_btn_text'),
                    iconCls: 'query',
                    handler: function(b, e) {
                        search(b);
                    },
                    scope: this
                }],
                map: this.target.mapPanel.map, 
                attributes: this.store,
                allowSpatial: true,
                vectorLayer: this.drawingLayer
            });
            this.panel.layout.setActiveItem(1);
        }.createDelegate(this);

        var createProtocol = function() {
            var idx = this.store.find('type', 
                /^gml:(Multi)?(Point|LineString|Polygon|Curve|Surface|Geometry)PropertyType$/);
            if (idx > -1) { 
                // we have a geometry
                var r = this.store.getAt(idx);
                this.geometryName = r.get('name');
                this.store.remove(r);
            } else {
                alert(OpenLayers.i18n("QueryBuilder.alert_no_geom_field"));
                return;
            }
            
            this.protocol = new OpenLayers.Protocol.WFS({
                url: App.mapserverproxyURL,
                featureType: this.featureType,
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                srsName: "EPSG:21781", // FIXME ?
                version: "1.1.0",
                geometryName: this.geometryName
            });
        }.createDelegate(this);

        var onPanelExpanded = function() {
            if (this.drawingLayer) {
                this.drawingLayer.setVisibility(true);
            }
            if (this.querierPanel) {
                // child panel already created => exit
                return;
            }
            if (!this.mask) {
                window.setTimeout(function() {
                    this.mask = new Ext.LoadMask(this.panel.body.dom, {
                        msg: OpenLayers.i18n('QueryBuilder.loading')
                    });
                    this.mask.show();
                }.createDelegate(this), 10);
            }
            if (!this.store) {
                this.store = new GeoExt.data.AttributeStore({
                    url: App.mapserverproxyURL,
                    fields: ["name", "type", "displayName"],
                    baseParams: {
                        "TYPENAME": this.featureType,
                        "REQUEST": "DescribeFeatureType",
                        "SERVICE": "WFS",
                        "VERSION": "1.0.0"
                    },
                    listeners: {
                        "load": function() {
                            // one shot listener:
                            this.store.purgeListeners();
                            // attributes translation:
                            this.store.each(function(r) {
                                r.set("displayName", OpenLayers.i18n(r.get("name")));
                                if (App.filters && App.filters[r.get('name')]) {
                                    r.set('type', r.get('type').replace(/xsd:/, ''));
                                    r.set('url', App.filters[r.get('name')]);
                                }
                            });
                            createProtocol();                        
                            createQuerierPanel();
                            if (this.mask) {
                                this.mask.hide();
                            }
                        },
                        "loadexception": function() {
                            if (this.mask) {
                                this.mask.hide();
                            }
                            alert(OpenLayers.i18n("QueryBuilder.describefeaturetype_exception"));
                        },
                        scope: this
                    },
                    scope: this
                });
            }
            this.store.load();
        }.createDelegate(this);

        this.panel = new Ext.Panel(Ext.apply({
            title: OpenLayers.i18n("querier"),
            layout: 'card',
            activeItem: 0,
            defaults: {
                border: false
            },
            items: [{
                html: " "
            }],
            listeners: {
                "expand": onPanelExpanded,
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

        this.queryBuilderPanel = cgxp.plugins.QueryBuilder.superclass.addOutput.call(this, this.panel);

        return this.queryBuilderPanel;
    }

});

Ext.preg(cgxp.plugins.QueryBuilder.prototype.ptype, cgxp.plugins.QueryBuilder);