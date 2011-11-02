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

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: FullTextSearch(config)
 *
 *  Used to add a full text search tool.
 */
cgxp.plugins.FullTextSearch = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_fulltextsearch */
    ptype: "cgxp_fulltextsearch",

    /** api: config[url]
     *  URL of the search service.
     */
    url: null,

    init: function() {
        cgxp.plugins.FullTextSearch.superclass.init.apply(this, arguments);
        
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
    },

    /** api: method[addActions]
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
            if (coords) {
                var map = this.target.mapPanel.map;
                var left = parseFloat(coords[1].replace("'", ""));
                var right = parseFloat(coords[2].replace("'", ""));
                // for switzerland:
                // EPSG:21781: lon > lat
                // EPSG:4326 : lat > lon
                var position = new OpenLayers.LonLat(
                    left > right ? left : right,
                    right < left ? right : left);
                var valid = false;
                if (map.maxExtent.containsLonLat(position)) {
                    // try with EPSG:21781
                    valid = true;
                } else {
                    // try with EPSG:4326
                    position = new OpenLayers.LonLat(
                        left < right ? left : right,
                        right > left ? right : left);
                    position.transform(
                        new OpenLayers.Projection("EPSG:4326"),
                        map.getProjectionObject());
                    if (map.maxExtent.containsLonLat(position)) {
                        valid = true;
                    }
                }
                if (valid) {
                    map.setCenter(position, 8);
                }
            }
            return !coords;
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
        var combo = new Ext.ux.form.TwinTriggerComboBox({
            store: this.createStore(),
            tpl: tpl,
            minChars: 1,
            queryDelay: 50,
            emptyText: OpenLayers.i18n('Search.emptytext'),
            loadingText: OpenLayers.i18n('Search.loadingtext'),
            displayField: 'label',
            triggerAction: 'all',
            trigger2Class: 'x-form-trigger-no-width x-hidden',
            trigger3Class: 'x-form-trigger-no-width x-hidden',
            width: 200,
            selectOnFocus: true
        });
        combo.on({
            'select': function(combo, record, index) {
                // add feature to vector layer
                var feature = record.getFeature();
                this.vectorLayer.removeFeatures(this.vectorLayer.features);
                this.vectorLayer.addFeatures([feature]);
                // make sure the layer this feature belongs to is displayed
                var layer = map.getLayersBy('ref', record.get('layer_name'));
                if (layer && layer.length > 0) {
                    layer[0].setVisibility(true);
                }
                // zoom onto the feature
                map.zoomToExtent(feature.bounds);
            },
            'clear': function(combo) {
                this.vectorLayer.removeFeatures(this.vectorLayer.features);
            },
            'render': function() {
                new Ext.ToolTip({
                    target: combo.getEl(),
                    title: OpenLayers.i18n('Search.Search'),
                    width: 500,
                    contentEl: 'search-tip',
                    trackMouse: true,
                    dismissDelay: 15000
                });
            },
            scope: this
        });
        return combo;
    }
});

Ext.preg(cgxp.plugins.FullTextSearch.prototype.ptype, cgxp.plugins.FullTextSearch);
