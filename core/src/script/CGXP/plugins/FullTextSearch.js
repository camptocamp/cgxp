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
 * @include CGXP/widgets/FullTextSearch.js
 * @include OpenLayers/Format/GeoJSON.js
 * @include GeoExt/data/FeatureStore.js
 * @include Ext/ux/form/TwinTriggerComboBox.js
 * @include CGXP/data/FeatureReader.js
 * @include CGXP/widgets/FullTextSearch.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FullTextSearch
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a FullTextSearch plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_fulltextsearch",
 *              url: "${request.route_url('fulltextsearch', path='')}",
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

    /** api: config[widgetOptions]
     *  ``Object``
     *  Additional FullTextSearch widget options.
     *  See `CGXP.FullTextSearch <../widgets/FullTextSearch.html>`_.
     */
    widgetOptions: {},

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

    /** api: config[vectorLayerConfig]
     *  ``Object``
     *  Optional configuration of the vector layer.
     */
    vectorLayerConfig: {},

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
            OpenLayers.Util.createUniqueID("cgxp"), Ext.apply({
            displayInLayerSwitcher: false,
            alwaysInRange: true
        }, this.vectorLayerConfig));

        if (!this.vectorLayer.style) {
            this.vectorLayer.style = this.vectorLayer.styleMap.styles.default.defaultStyle;
        }

        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        this.target.mapPanel.map.addLayer(this.vectorLayer);
    },

    /** private: method[addActions]
     */
    addActions: function() {
        this.fullTextSearch = this.createCombo();
        return cgxp.plugins.FullTextSearch.superclass.addActions.apply(this, [this.fullTextSearch]);
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
                {}, this.coordsRecenteringStyle || {}
            );
            this.vectorLayer.removeAllFeatures();
            this.vectorLayer.addFeatures([feature]);
        }
    },

    /** private: method[createCombo]
     *
     *  :returns ``cgxp.FullTextSearch`` The search widget.
     */
    createCombo: function() {
        var map = this.target.mapPanel.map;
        var combo = new cgxp.FullTextSearch(Ext.apply({
            url: this.url,
            map: map
        }, this.widgetOptions));

        colorpickerWidth = 35
        combo.items.insert(0, this.createColorpicker(colorpickerWidth));
        combo.width = combo.width + colorpickerWidth

        // used to apply the position
        this.applyPositionTask = new Ext.util.DelayedTask(function () {
            this.applyPosition();
        }, this);

        combo.on({
            'applyposition': function(position) {
                this.position = position;
                this.applyPositionTask.cancel();
                // apply the position
                this.applyPositionTask.delay(1000);
            },
            'select': function(combo, record, index) {
                // add feature to vector layer
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
                combo.blur();

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

     /** private: method[createColorpicker]
     * Returns ``Ext-ux.ColorFields``
     */
    createColorpicker: function(width) {
        var layer = this.vectorLayer;
        var colorpicker = new Ext.ux.ColorField({
            editable: false,
            value: layer.style.fillColor || '#ff0000',
            width: width
        });
        colorpicker.on('select', function(cm, color) {
            var i = 0;
            var features = layer.features;
            layer.style.fillColor = color
            layer.style.strokeColor = color
            for (i; i < features.length ; i++){
                features[i].style.fillColor = color;
                features[i].style.strokeColor = color;
            }
            layer.redraw();
        }, this);
        return colorpicker;
    }
});

Ext.preg(cgxp.plugins.FullTextSearch.prototype.ptype, cgxp.plugins.FullTextSearch);
