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

/** api: (define)
 *  module = cgxp
 *  class = FullTextSearch
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: FullTextSearch(config)
 */
cgxp.FullTextSearch = Ext.extend(Ext.Panel, {

    /* api: xtype = cgxp_fulltextsearch */
    xtype: 'cgxp_fulltextsearch',

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
     *  ``Number``
     *  Width in pixels of the search combobox.
     */
    comboWidth: 200,

    /** api: config[actionConfig]
     *  ``Object``
     *  Optional configuration of the ComboBox.
     */
    actionConfig: null,

    /** api: config[layerTreeId]
     *  ``String``
     *  Id of the layertree tool.
     *  If set, automaticaly load the corresponding layerGroup in the layer tree.
     */
    layerTreeId: null,

    projections: null,

    /** api: config[vectorLayerConfig]
     *  ``Object``
     *  Optional configuration of the vector layer.
     */
    vectorLayerConfig: {},

    /** api: config[grouping]
     *  ``Boolean``
     *  Tells whether to group the results by ``layer_name``. If set to ``true``,
     *  the data returned by the service is intended to include such a field.
     *  If set to ``true``, ``GroupComboBox.js`` needs to be included as part
     *  of the built file if any.
     *  Defaults to ``false``.
     */
    grouping: false,

    /** api: config[limits]
     *  ``Object`` Option object to configure search
     *  limit parameters sent to the text search
     *  service. The possible properties are:
     *
     *  * ``limit`` - ``Number`` The maximum number of
     *    results in the response.
     *  * ``partitionlimit`` - ``Number`` The maximum number
     *    of results per layer/group in the response.
     *
     *  ``partitionlimit`` is typically used when the ``grouping``
     *  option is to ``true``, to limit the number of
     *  results in each group.
     *
     *  If the ``limits`` option is unspecified the limit
     *  parameters sent in search requests depend whether
     *  ``grouping`` is ``true`` or ``false``:
     *
     *  * If ``grouping`` is ``false`` then ``limit`` is set to ``20``,
     *    and ``partitionlimit`` is not set.
     *  * If ``grouping`` is ``true`` then ``limit`` is set to ``40``,
     *    and ``partitionlimit`` is set to ``10``.
     *
     *  Any provided ``limits`` object is *applied* to the
     *  default values. For example, if ``grouping`` is
     *  ``true`` and if the ``limits`` option is set to
     *  ``{limit: 50}`` then ``limit`` will be set to ``50`` and
     *  ``partitionlimit`` will be set to ``10`` in search requests.
     */
    limits: {},

    /** private: method[initComponent]
     */
    initComponent: function() {

        // style used when recentering on coordinates
        this.coordsRecenteringStyle = this.coordsRecenteringStyle || {
            pointRadius: "10",
            externalGraphic: OpenLayers.Util.getImagesLocation() + "crosshair.png"
        };

        // a Search object has its own vector layer, which is added
        // to the map once for good
        this.vectorLayer = new OpenLayers.Layer.Vector(
            OpenLayers.Util.createUniqueID("cgxp"), Ext.apply({
            displayInLayerSwitcher: false,
            alwaysInRange: true
        }, this.vectorLayerConfig));

        this.target.on('ready', this.viewerReady, this);

        var combo = this.createCombo();
        Ext.apply(this, {items: [combo]});
        cgxp.FullTextSearch.superclass.initComponent.call(this);
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

    createStore: function() {
        var baseParams = Ext.apply(this.grouping ?
                { limit: 40, partitionlimit: 10 } :
                { limit: 20 }, this.limits);
        var store = new GeoExt.data.FeatureStore({
            proxy: new Ext.data.ScriptTagProxy({
                url: this.url,
                callbackParam: 'callback'
            }),
            baseParams: baseParams,
            reader: new cgxp.data.FeatureReader({
                format: new OpenLayers.Format.GeoJSON()
            }, ['label', 'layer_name']),
            sortInfo: this.grouping ? {field: 'layer_name', direction: 'ASC'} : null
        });

        store.on('beforeload', function(store, options) {
            var coords = store.baseParams.query.match(
                /([\d\.']+)[\s,]+([\d\.']+)/
            );
            this.position = null;
            this.closeLoading.cancel();
            this.applyPositionTask.cancel();
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
                    this.applyPositionTask.delay(1000);
                    return false;
                }
            }
            return true;
        }, this);
        return store;
    },

    /** private: method[createCombo]
     *
     *  :returns ``Ext.form.ComboBox`` The search combo.
     */
    createCombo: function() {
        var tpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-combo-list-item">',
            '{label}',
            '</div></tpl>'
        );
        var comboClass = this.grouping ?
            Ext.ux.form.GroupComboBox : Ext.ux.form.TwinTriggerComboBox;
        var combo = new comboClass(Ext.apply({
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
        }, this.actionConfig));
        // used to close the loading panel
        this.closeLoading = new Ext.util.DelayedTask(function () {
            combo.list.hide();
        }, this);
        // used to apply the position
        this.applyPositionTask = new Ext.util.DelayedTask(function () {
            this.applyPosition();
        }, this);
        combo.on({
            'select': function(combo, record, index) {
                // add feature to vector layer
                var map = this.target.mapPanel.map;
                var feature = record.getFeature();
                this.vectorLayer.removeFeatures(this.vectorLayer.features);
                this.vectorLayer.addFeatures([feature]);
                this.target.mapPanel.setParams(feature.attributes.params);

                // center the map on the feature (and eventually zoom to it)
                if (feature.geometry instanceof OpenLayers.Geometry.Point) {
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
                        tree.loadGroup(layer, [record.get('layer_name')], undefined, undefined, true);
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
                    this.applyPosition();
                    this.applyPositionTask.cancel();
                }
            },
            scope: this
        });
        return combo;
    },

    /** private: method[applyPosition]
     */
    applyPosition: function() {
        this.target.mapPanel.map.setCenter(
            this.position, this.coordsRecenterZoom);

        if (this.showCenter) {
            // show a point feature to materialize the center
            var feature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(this.position.lon,
                                              this.position.lat),
                this.coordsRecenteringStyle || {}
            );
            this.vectorLayer.removeAllFeatures();
            this.vectorLayer.addFeatures([feature]);
        }
    }

});

/** api: xtype = cgxp_fulltextsearch */
Ext.reg(cgxp.FullTextSearch.prototype.xtype, cgxp.FullTextSearch);
