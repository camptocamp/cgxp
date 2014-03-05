/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/widgets/LayerOpacitySlider.js
 */

/** api: (define)
 *  module = cgxp
 *  class = MapOpacitySlider
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: MapOpacitySlider(config)
 *
 *  Control of the opacity of an ortho layer on some baselayers (in a drop-down list)
 *
 *  Used state:
 *
 *  ``baselayer_opacity``: 
 *   - Opacity of the base layer on the ortho layer. Number between 0 and 100, 
 *     where a 0 value is a totally transparent base layer. 
 *   - Example: ``&baselayer_opacity=25`` 
 * 
 *  ``baselayer_ref``: 
 *   - Name (reference) of the layer used as baselayer. 
 *   - Example: ``&baselayer_ref=my_color_base_layer``
 */
cgxp.MapOpacitySlider = Ext.extend(Ext.Toolbar, {

    /** api: config[orthoRef]
     *  ``String``
     *  Reference of the ortho layer.
     */
    orthoRef: 'ortho',

    /** api: config[defaultBaseLayerRef]
     *  ``String``
     *  Reference of the default base layer.
     */
    defaultBaseLayerRef: 'plan',

    /* i18n */
    orthoText: 'Orthophoto',

    /** api: config[stateId]
     * ``String``
     * Used for the permalink.
     */
    stateId: 'baselayer',

    /** api: config[map]
     * ``OpenLayers.Map``
     * The map.
     */
    map: null,

    /** private: property[stateEvents]
     * ``Array(String)``
     * Array of state events
     */
    stateEvents: ['opacitychange', 'changebaselayer'],

    /** private: property[layers]
     *  ``Array(OpenLayers.Layer)``
     *  The list of background layers.
     */
    layers: null,

    /** private: property[stateBaseLayerRef]
     *  ``String``
     *  Reference of the base layer provided by the state.
     */
    stateBaseLayerRef: null,

    /**
     * private: method[initComponent]
     * Creates the map toolbar.
     *
     * Returns:
     * {Ext.Toolbar} The toolbar.
     */
    initComponent: function() {
        cgxp.MapOpacitySlider.superclass.initComponent.call(this);
        this.addEvents(
            /** private: event[opacitychange]
             * Throws when the opacity change.
             */
            'opacitychange',

            /** private: event[changebaselayer]
             * Throws when the opacity change.
             */
            'changebaselayer'
        );

        // we should get the layers list for combobox before
        // changing the base layer to have the right order.
        this.layers = this.map.getLayersBy('group', 'background');
        Ext.each(this.layers, function(layer) {
            this.linkLinkedLayers(layer);
        }, this);
        if (this.orthoRef) {
            var orthoLayers = this.map.getLayersBy('ref', this.orthoRef);
            if (orthoLayers.length > 0) {
                this.orthoLayer = orthoLayers[0];
                this.linkLinkedLayers(this.orthoLayer);
            }
            else if (console) {
                this.orthoRef = undefined;
                console.log("No ortho layer found with ref '" + this.orthoRef + "'.");
            }
        }

        if (this.orthoLayer) {
            this.opacitySlider = this.createOpacitySlider();
            this.add([
                this.createOrthoLabel(),
                this.opacitySlider,
                this.createBaselayerCombo()
            ]);
        } else if (this.layers.length > 1) {
            this.add(this.createBaselayerCombo());
        }

        this.map.events.register("changebaselayer", this, function(e) {
            this.fireEvent('changebaselayer');
        });

        this.map.events.register("changelayer", this, function(event) {
            if (event.layer.linkedLayers && event.property == 'opacity') {
                Ext.each(event.layer.linkedLayers, function(linkedLayer) {
                    linkedLayer.setOpacity(event.layer.opacity);
                });
            }
        });

        this.on('beforerender', this.setInitialBaseLayer, this);
    },

    linkLinkedLayers: function(layer) {
        if (layer.linkedLayers) {
            // replace ref with layer
            var i, ii;
            var linkedLayers = [];
            for (i = 0, ii = layer.linkedLayers.length ; i < ii ; i++) {
                var layers = this.map.getLayersBy('ref', layer.linkedLayers[i]);
                if (layers.length > 0) {
                    linkedLayers.push(layers[0]);
                }
                else if (console) {
                    console.warn("No linked layer found with ref '" + layer.linkedLayers[i] + "'.");
                }
            }
            layer.linkedLayers = linkedLayers;

            layer.events.register('visibilitychanged', this, function() {
                Ext.each(layer.linkedLayers, function(linkedLayer) {
                    linkedLayer.setVisibility(layer.visibility);
                });
            })
        }
    },

    setInitialBaseLayer: function() {
        var baseLayer = null;
        if (this.stateBaseLayerRef) {
            baseLayer = this.map.getLayersBy('ref', this.stateBaseLayerRef)[0];
        }
        if (!baseLayer) {
            baseLayer = this.map.getLayersBy('ref', this.defaultBaseLayerRef)[0];
        }
        if (baseLayer) {
            this.updateBaseLayer(baseLayer);
        }
        else if (this.layers.length > 0) {
            this.updateBaseLayer(this.layers[0]);
        }
        // if only one ortho layer (needed for API)
        else if (this.orthoRef) {
            var layer = this.map.getLayersBy('ref', this.orthoRef)[0];
            layer.setOpacity(1);
            if (this.map.allOverlays) {
                layer.setVisibility(true);
            }
            else {
                this.map.setBaseLayer(layer);
            }
        }
    },

    /**
     * Method: createOpacitySlider
     * Create the slider for the Orthophoto
     *
     * Returns:
     * {Ext.BoxComponent} The opacity slider
     */
    createOpacitySlider: function() {
        var maxvalue = 100;
        var slider = new GeoExt.LayerOpacitySlider({
            width: 100,
            layer: this.orthoLayer,
            inverse: true,
            aggressive: true,
            changeVisibility: true,
            complementaryLayer: this.map.baseLayer,
            maxvalue: maxvalue,
            style: "margin-right: 10px;"
        });
        this.map.events.register("changebaselayer", this, function(e) {
            slider.complementaryLayer = e.layer;
            slider.complementaryLayer.setVisibility(this.orthoLayer.opacity != 1);
        });
        slider.on('changecomplete', function() {
            this.fireEvent('opacitychange');
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
    createBaselayerCombo: function() {
        if (this.layers.length == 1) {
            return new Ext.BoxComponent({
                html: '<span class="tools-baselayer-label">' + this.layers[0].name + '</span>'
            });
        }

        // base layer store
        var store = new GeoExt.data.LayerStore({
           layers: this.layers
        });

        var combo = new Ext.form.ComboBox({
            editable: false,
            hideLabel: true,
            width: 140,
            store: store,
            displayField: 'title',
            valueField: 'title',
            value: this.map.baseLayer.name,
            triggerAction: 'all',
            mode: 'local',
            listeners: {
                'select': function(combo, record, index) {
                    this.updateBaseLayer(record.getLayer());
                },
                scope: this
            }
        });

        this.map.events.on({
            "changebaselayer": function(e) {
                combo.setValue(e.layer.name);
            }
        });

        return combo;
    },

    /** private: method[updateBaseLayer]
     *  Updates the base layer.
     *
     *  :arg newBaseLayer: ``OpenLayers.Layer`` The new base layer
     */
    updateBaseLayer: function(newBaseLayer) {
        if (this.map.allOverlays) {
            Ext.invoke(this.layers, "setVisibility", false);
            this.map.setLayerIndex(newBaseLayer, 0);
            if (!this.orthoRef ||
                this.map.getLayersBy('ref', this.orthoRef)[0].opacity != 1) {
                // show new base layer only if ortho layer is not fully opaque
                newBaseLayer.setVisibility(true);
            }
        } else {
            this.map.setBaseLayer(newBaseLayer);
        }
    },

    /** private: method[saveState]
     */
    getState: function() {
        if (this.orthoRef) {
            return {
                opacity: this.opacitySlider.getValue(),
                ref: this.map.baseLayer.ref
            }
        }
        return { ref: this.map.baseLayer.ref };
    },

    /** private: method[applyState]
     */
    applyState: function(state) {
        if (state.ref) {
            this.stateBaseLayerRef = state.ref;
        }
        if (this.orthoRef) {
            if (state.opacity != 100) {
                this.orthoLayer.setVisibility(true);
            }
            this.orthoLayer.setOpacity(1 - parseInt(state.opacity, 10) / 100);
        }
    }
});

/** api: xtype = cgxp_mapopacityslider */
Ext.reg("cgxp_mapopacityslider", cgxp.MapOpacitySlider);
