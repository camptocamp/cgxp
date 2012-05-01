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

    // used for the permalink
    stateId: 'baselayer',

    /**
     * Method: createMapBar
     * Creates the map toolbar.
     *
     * Returns:
     * {Ext.Toolbar} The toolbar.
     */
    createMapBar: function(layers) {
        var mapbar = new Ext.Toolbar({
            cls: 'opacityToolbar'
        })
        this.opacitySlider = this.createOpacitySlider();
        var items = [
            this.createOrthoLabel(),
            this.opacitySlider,
            this.createBaselayerCombo(layers)
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
    createOpacitySlider: function() {
        var map = this.target.mapPanel.map;
        var orthoLayer = map.getLayersBy('ref', this.orthoRef)[0]
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
        map.events.register("changebaselayer", this, function(e) { 
            slider.complementaryLayer = e.layer; 
            slider.complementaryLayer.setVisibility(!(orthoLayer.opacity == 1));
            this.saveState();
        });
        slider.on('changecomplete', function() {
            this.saveState();
        }, this);
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
    createBaselayerCombo: function(layers) {
        var map = this.target.mapPanel.map;

        if (layers.length == 1) {
            return new Ext.BoxComponent({
                html: '<span class="tools-baselayer-label">' + layers[0].name + '</span>'
            });
        }

        // base layer store
        var store = new GeoExt.data.LayerStore({
           layers: layers
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
                    this.updateBaseLayer(record.getLayer());
                },
                scope: this
            }
        });

        map.events.on({
            "changebaselayer": function(e) {
                combo.setValue(e.layer.name);
            }
        });

        return combo;
    },

    updateBaseLayer: function(newBaseLayer) {
        var map = this.target.mapPanel.map;
        if (map.allOverlays) {
            map.layers[0].setVisibility(false);
            map.setLayerIndex(newBaseLayer, 0);
            map.layers[0].setVisibility(true);
        } else {
            map.setBaseLayer(newBaseLayer);
        }
    },

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        this.target.addListener('ready', function() {
            var mapPanel = this.target.mapPanel;
            var map = mapPanel.map;
            // we should get the layers list for to combobox before 
            // changeing the base layer to have the right order. 
            var layers = map.getLayersBy('group', 'background');
            Ext.each(layers,
                function(layer) {
                    layer.setVisibility(false);
                }
            );
            var state = Ext.state.Manager.get(this.stateId);
            if (state) {
                this.applyState(state);
            }
            else {
                var baseLayer = map.getLayersBy('ref', this.defaultBaseLayerRef)[0];
                if (baseLayer) {
                    this.updateBaseLayer(baseLayer);
                }
            }
            var mapbar = this.createMapBar(layers);
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
    },

    /** private: method[saveState]
     */
    saveState: function() {
        var baselayer = this.target.mapPanel.map.baseLayer;
        var state = {
            opacity: this.opacitySlider.getValue(),
            ref: this.target.mapPanel.map.baseLayer.ref
        };
        Ext.state.Manager.set(this.stateId, state);
    },

    /** private: method[applyState]
     */
    applyState: function(state) {
        var map = this.target.mapPanel.map;
        var baselayer = map.getLayersBy('ref', state.ref)[0];
        this.updateBaseLayer(baselayer);
        var orthoLayer = map.getLayersBy('ref', this.orthoRef)[0]
        if (state.opacity != 100) {
            orthoLayer.setVisibility(true);
        }
        orthoLayer.setOpacity(1 - parseInt(state.opacity) / 100);
    }
});

Ext.preg(cgxp.plugins.MapOpacitySlider.prototype.ptype, cgxp.plugins.MapOpacitySlider);

