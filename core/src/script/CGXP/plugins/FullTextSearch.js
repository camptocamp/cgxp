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
 * @include OpenLayers/Format/GeoJSON.js
 * @include GeoExt/data/FeatureStore.js
 * @include Ext/ux/form/TwinTriggerComboBox.js
 * @include CGXP/data/FeatureReader.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FullTextSearch
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing on to add a FullTextSearch plugin to a
 *  Viewer:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_fulltextsearch",
 *              url: "$${request.route_url('fulltextsearch', path='')}",
 *              actionTarget: "center.tbar"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: FullTextSearch(config)
 *
 *  Plugin to add a text search field.
 */
cgxp.plugins.FullTextSearch = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_fulltextsearch */
    ptype: "cgxp_fulltextsearch",

    /** api: config[tooltipTitle]
     *  ``String`` Text for the tooltip title (i18n). Only applies if
     *  :attr:`tooltip` is ``true``.
     */
    tooltipTitle: "Search",
    /** api: config[emptyText]
     *  ``String`` Text to use when the field is empty (i18n).
     */
    emptyText: "Search...",
    /** api: config[loadingText]
     *  ``String`` Text to display while loading results (i18n).
     */
    loadingText: "Searching...",

    /** api: config[tooltip]
     *  ``Boolean`` Whether to display a tooltip above the search box.
     *  Default is ``true``.
     */
    tooltip: true,

    /** api: config[url]
     *  ``String`` URL of the text search service. Typically set to
     *  ``"${request.route_url('fulltextsearch', path='')}"``.
     */
    url: null,

    /** api: config[pointRecenterZoom]
     *  ``Number`` Zoom level to use when recentering on point items (optional).
     */
    pointRecenterZoom: null,

    /** api: config[coordsRecenterZoom]
     *  ``Number`` Zoom level to use when recentering on coordinates (optional).
     */
    coordsRecenterZoom: null,

    /** api: config[projectionCodes]
     *  ``Array``
     *  List of EPSG codes of projections that should be used when trying to 
     *  recenter on coordinates. Leftmost projections are used preferably.
     *  Default is current map projection.
     */
    projectionCodes: null,

    /** api: config[showCenter]
     *  ``Boolean``
     * If true, center point is materialized when centering on coordinates
     * (default is false).
     */
    showCenter: false,

    /** api: config[coordsRecenteringStyle]
     *  ``Object``
     *  Style configuration used when recentering on coordinates.
     */
    coordsRecenteringStyle: null,

    /** api: config[comboWidth]
     *  ``Integer``
     *  Width in pixels of the search combobox.
     */
    comboWidth: 200,

    /** api: config[comboConfig]
     *  ``Object``
     *  Optional configuration of the ComboBox.
     */
    comboConfig: null,

    /** api: config[layerTreeId]
     *  ``String``
     *  Id of the layertree tool.
     *  If set, automaticaly load the corresponding layerGroup in the layer tree.
     */
    layerTreeId: null,

    projections: null,

    init: function() {
        cgxp.plugins.FullTextSearch.superclass.init.apply(this, arguments);
        
        // style used when recentering on coordinates
        this.coordsRecenteringStyle = this.coordsRecenteringStyle || {
            pointRadius: "10",
            externalGraphic: OpenLayers.Util.getImagesLocation() + "crosshair.png"
        };

        // a Search object has its own vector layer, which is added
        // to the map once for good
        this.vectorLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("cgxp"), {
            displayInLayerSwitcher: false,
            alwaysInRange: true
        });
        
        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        this.target.mapPanel.map.addLayer(this.vectorLayer);

        // define projections that may be used for coordinates recentering
        this.projections = {};
        if (!this.projectionCodes) {
            this.projectionCodes = [this.target.mapPanel.map.getProjection()];
        }
        for (var i = 0, len = this.projectionCodes.length, code; i < len; i++) {
            code = String(this.projectionCodes[i]).toUpperCase();
            if (code.substr(0, 5) != "EPSG:") {
                code = "EPSG:" + code;
            }
            this.projections[code] = new OpenLayers.Projection(code);
        }
    },

    /** private: method[addActions]
     */
    addActions: function() {
        var combo = this.createCombo();
        return cgxp.plugins.FullTextSearch.superclass.addActions.apply(this, [combo]);
    },

    createStore: function() {
        var store = new GeoExt.data.FeatureStore({
            proxy: new Ext.data.ScriptTagProxy({
                url: this.url,
                callbackParam: 'callback'
            }),
            baseParams: {
                "limit": 20
            },
            reader: new cgxp.data.FeatureReader({
                format: new OpenLayers.Format.GeoJSON()
            }, ['label', 'layer_name'])
        });

        store.on('beforeload', function(store, options) {
            var coords = store.baseParams.query.match(
                /([\d\.']+)[\s,]+([\d\.']+)/
            );
            this.position = null;
            this.closeLoading.cancel();
            this.applyPosition.cancel();
            if (coords) {
                var map = this.target.mapPanel.map;
                var left = parseFloat(coords[1].replace("'", ""));
                var right = parseFloat(coords[2].replace("'", ""));
                
                var tryProjection = function(lon, lat, projection) {
                    var position = new OpenLayers.LonLat(lon, lat);
                    position.transform(projection, map.getProjectionObject());
                    if (map.maxExtent.containsLonLat(position)) {
                        this.position = position;
                        return true;
                    }
                    return false;
                }.createDelegate(this);

                for (var projection in this.projections) {
                    if (tryProjection(left, right, projection) ||
                        tryProjection(right, left, projection)) {
                        break;
                    }
                }
                
                if (this.position) {
                    // close the loading twin box.
                    this.closeLoading.delay(10);
                    // apply the position
                    this.applyPosition.delay(1000);
                    return false;
                }
            }
            return true;
        }, this);
        return store;
    },

    /**
     * Method: createCombo
     *
     * Returns:
     * {Ext.form.ComboBox} The search combo.
     */
    createCombo: function() {
        var map = this.target.mapPanel.map;
        var tpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-combo-list-item">',
            '{label}',
            '</div></tpl>'
        );
        var combo = new Ext.ux.form.TwinTriggerComboBox(Ext.apply({
            store: this.createStore(),
            tpl: tpl,
            minChars: 1,
            queryDelay: 50,
            emptyText: this.emptyText,
            loadingText: this.loadingText,
            displayField: 'label',
            triggerAction: 'all',
            trigger2Class: 'x-form-trigger-no-width x-hidden',
            trigger3Class: 'x-form-trigger-no-width x-hidden',
            width: this.comboWidth,
            selectOnFocus: true
        }, this.comboConfig));
        // used to close the loading panel
        this.closeLoading = new Ext.util.DelayedTask(function () {
            combo.list.hide();
        }, this);
        // used to apply the position
        this.applyPosition = new Ext.util.DelayedTask(function () {
            map.setCenter(this.position, this.coordsRecenterZoom);

            if (this.showCenter) {
                // show a point feature to materialize the center
                var feature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(this.position.lon,
                                                  this.position.lat)
                );
                if (this.coordsRecenteringStyle) {
                    feature.style = this.coordsRecenteringStyle;
                }
                this.vectorLayer.removeFeatures(this.vectorLayer.features);
                this.vectorLayer.addFeatures([feature]);
            }
        }, this);
        combo.on({
            'select': function(combo, record, index) {
                // add feature to vector layer
                var feature = record.getFeature();
                this.vectorLayer.removeFeatures(this.vectorLayer.features);
                this.vectorLayer.addFeatures([feature]);
                
                // zoom onto the feature
                if (this.pointRecenterZoom &&
                    feature.geometry instanceof OpenLayers.Geometry.Point) {
                    map.setCenter(new OpenLayers.LonLat(feature.geometry.x,
                                                        feature.geometry.y),
                                  this.pointRecenterZoom);
                } else {
                    map.zoomToExtent(feature.bounds);
                }

                // load related group or layer
                if (this.layerTreeId) {
                    var tree = this.target.tools[this.layerTreeId].tree;
                    var layer = tree.findGroupByLayerName(record.get('layer_name'));
                    if (layer) {
                        tree.loadGroup(layer, [record.get('layer_name')], null, null, true);
                    }
                } else {
                    // try to load layer directly
                    var layer = map.getLayersBy('ref', record.get('layer_name'));
                    if (layer && layer.length > 0) {
                        layer[0].setVisibility(true);
                    }
                }
            },
            'clear': function(combo) {
                this.vectorLayer.removeFeatures(this.vectorLayer.features);
            },
            'render': function(component) {
                if (this.tooltip) {
                    new Ext.ToolTip({
                        target: combo.getEl(),
                        title: this.tooltipTitle,
                        width: 500,
                        contentEl: 'search-tip',
                        trackMouse: true,
                        dismissDelay: 15000
                    });
                }
                function stop(e) {
                    var event = e || window.event;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        event.cancelBubble = true;
                    }
                }
                component.getEl().dom.onkeydown = stop;
            },
            'specialkey': function(field, event) {
                if (this.position && event.getKey() == event.ENTER) {
                    map.setCenter(this.position);
                    this.applyPosition.cancel();
                }
            },
            scope: this
        });
        return combo;
    }
});

Ext.preg(cgxp.plugins.FullTextSearch.prototype.ptype, cgxp.plugins.FullTextSearch);
