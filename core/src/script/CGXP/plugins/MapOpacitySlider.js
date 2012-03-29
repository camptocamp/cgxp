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
 * @requires plugins/Tool.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/widgets/LayerOpacitySlider.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = MapOpacitySlider
 */

Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: MapOpacitySlider(config)
 *
 */   
cgxp.plugins.MapOpacitySlider = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_mapopacityslider */
    ptype: "cgxp_mapopacityslider",

    /** api: config[orthoRef]
     *  ``String``
     *  Referance of the ortho layer.
     */
    orthoRef: 'ortho',

    /** api: config[defaultBaseLayerRef]
     *  ``String``
     *  Referance of the default base layer.
     */
    defaultBaseLayerRef: 'plan',

    orthoText: "Orthophoto",

    /**
     * Method: createMapBar
     * Creates the map toolbar.
     *
     * Returns:
     * {Ext.Toolbar} The toolbar.
     */
    createMapBar: function(map) {
        var mapbar = new Ext.Toolbar({
            cls: 'opacityToolbar'
        })
        var items = [
            this.createOrthoLabel(),
            this.createOpacitySlider(
                    map.getLayersBy('ref', this.orthoRef)[0], map),
            this.createBaselayerCombo(map)
        ];
        // baselayer selection
        mapbar.add(items);
        return mapbar;
    },

    /**
     * Method: createOpacitySlider
     * Create the slider for the Orthophoto
     *
     * Returns:
     * {Ext.BoxComponent} The opacity slider
     */
    createOpacitySlider: function(orthoLayer, map) {
        var slider = new GeoExt.LayerOpacitySlider({
            width: 100,
            layer: orthoLayer,
            inverse: true,
            aggressive: true,
            changeVisibility: true,
            complementaryLayer: map.baseLayer,
            maxvalue: 100,
            style: "margin-right: 10px;"
        });
        map.events.register("changebaselayer", slider, function(e) { 
            slider.complementaryLayer = e.layer; 
            slider.complementaryLayer.setVisibility(!(orthoLayer.opacity == 1));
        });
        return slider;
    },

    /**
     * Method: createOrthoLabel
     * Create the label for the ortho opacity clider.
     *
     * Returns:
     * {Ext.BoxComponent} The box containing the label.
     */
    createOrthoLabel: function() {
        return new Ext.BoxComponent({
            html: '<span class="tools-baselayer-label">' + this.orthoText + '</span>'
        });
    },

    /**
     * Method: createBaselayerCombo
     * Create a combobox for the baselayer selection.
     *
     * Returns:
     * {Ext.form.ComboBox} The combobox.
     */
    createBaselayerCombo: function(map) {

        // base layer store
        var store = new GeoExt.data.LayerStore({
        //    layers: map.getLayersBy("isBaseLayer", true)
           layers: map.getLayersBy('group', 'background')
        });

        var combo = new Ext.form.ComboBox({
            editable: false,
            hideLabel: true,
            width: 140,
            store: store,
            displayField: 'title',
            valueField: 'title',
            value: map.baseLayer.name,
            triggerAction: 'all',
            mode: 'local',
            listeners: {
                'select': function(combo, record, index) {
                    if (map.baseLayer) {
                        map.baseLayer.setVisibility(false);
                    }
                    map.setBaseLayer(record.getLayer());
                }
            }
        });

        map.events.on({
            "changebaselayer": function(e) {
                combo.setValue(e.layer.name);
            }
        });

        return combo;
    },

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        var task = new Ext.util.DelayedTask(function() {
            var mapPanel = this.target.mapPanel;
            var map = mapPanel.map;
            Ext.each(map.getLayersBy('group', 'background'),
                function(layer) {
                    layer.setVisibility(false);
                }
            );
            var baseLayer = map.getLayersBy('ref', this.defaultBaseLayerRef)[0];
            if (baseLayer) {
                baseLayer.setVisibility(true);
                map.setBaseLayer(baseLayer);
            }
            var mapbar = this.createMapBar(map);
            var container = Ext.DomHelper.append(mapPanel.bwrap, {
                tag: 'div',
                cls: 'baseLayersOpacitySlider'
            }, true /* returnElement */);
            mapbar.render(container);
            mapbar.doLayout();
            var totalWidth = 0;
            mapbar.items.each(function(item) {
                totalWidth += item.getWidth() + 5;
            });
            container.setWidth(totalWidth);
            container.setStyle({'marginLeft': (-totalWidth / 2) + 'px'});
        }, this);
        task.delay(2000);
    }
});

Ext.preg(cgxp.plugins.MapOpacitySlider.prototype.ptype, cgxp.plugins.MapOpacitySlider);

