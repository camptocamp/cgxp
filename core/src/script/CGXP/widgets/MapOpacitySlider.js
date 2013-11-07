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

    /** private: property[enabledLinkedLayers]
     *  `Array(String)``
     *  List of enabled linked layers. These layers are not directly listed in
     *  the base layers dropdown but are secondary layers enabled/disabled
     *  depending of the related base layer.
     */
    enabledLinkedLayers: [],

    /** private: property[enabledLinkedSliderLayers]
     *  `Array(String)``
     *  List of enabled linked layers to the slider. These layers are not directly listed in
     *  the base layers dropdown but are secondary layers enabled/disabled
     *  depending of the related base layer.
     */
    enabledLinkedSliderLayers: [],

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

        if (this.orthoRef) {
            this.opacitySlider = this.createOpacitySlider();
            this.add([
                this.createOrthoLabel(),
                this.opacitySlider,
                this.createBaselayerCombo()
            ]);
        } else {
            this.add(this.createBaselayerCombo());
        }

        this.map.events.register("changebaselayer", this, function(e) {
            this.fireEvent('changebaselayer');
        });

        this.on('beforerender', this.setInitialBaseLayer, this);
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
    },

    /**
     * Method: createOpacitySlider
     * Create the slider for the Orthophoto
     *
     * Returns:
     * {Ext.BoxComponent} The opacity slider
     */
    createOpacitySlider: function() {
        var orthoLayer = this.map.getLayersBy('ref', this.orthoRef)[0];
        var maxvalue = 100;
        var slider = new GeoExt.LayerOpacitySlider({
            width: 100,
            layer: orthoLayer,
            inverse: true,
            aggressive: true,
            changeVisibility: true,
            complementaryLayer: this.map.baseLayer,
            maxvalue: maxvalue,
            style: "margin-right: 10px;"
        });
        this.map.events.register("changebaselayer", this, function(e) {
            slider.complementaryLayer = e.layer;
            slider.complementaryLayer.setVisibility(!(orthoLayer.opacity == 1));
        });
        var updateLinkedLayers = function(scope) {
            var sliderValue = slider.getValue();
            if ((slider.inverse && sliderValue == maxvalue) || 
                   (!slider.inverse && sliderValue == 0)) {
                scope.hideLinkedLayers(scope.enabledLinkedSliderLayers);
            } else {
                if (slider.inverse) {
                    sliderValue = maxvalue-sliderValue;
                }
                scope.showLinkedLayers(orthoLayer.linkedLayers, 
                  scope.enabledLinkedSliderLayers, sliderValue/maxvalue);
            }
        }
        slider.on('changecomplete', function() {
            this.fireEvent('opacitychange');
            if (orthoLayer.linkedLayers) {
                updateLinkedLayers(this);
            }
        }, this);
        slider.on('change', function() {
            if (orthoLayer.linkedLayers) {
                updateLinkedLayers(this);
            }
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

    /** private: method[showLinkedLayers]
     *  Show linked layers (if any)
     *
     *  :arg linkedLayers: ``Array(String)`` List of linked layers names
     *  :arg opacity: ``Number`` (optional, default: 1)
     */
    showLinkedLayers: function(linkedLayers, targetStorage, opacity) {
        opacity = opacity || 1;
        for (var i=0, l=linkedLayers.length; i<l; i++) {
            var layer = this.map.getLayersBy('ref', linkedLayers[i])[0];
            layer.setOpacity(opacity);
            layer.setVisibility(true);
            targetStorage.push(linkedLayers[i]);
        }
    },

    /** private: method[hideLinkedLayers]
     *  Hide linked layers (if any)
     */
    hideLinkedLayers: function(targetStorage) {
        for (var i=0, l=targetStorage.length; i<l; i++) {
            var layer = this.map.getLayersBy('ref', targetStorage[i])[0];
            layer.setVisibility(false);
        }
        targetStorage = [];
    },

    /** private: method[updateBaseLayer]
     *  Updates the base layer.
     *
     *  :arg newBaseLayer: ``OpenLayers.Layer`` The new base layer
     */
    updateBaseLayer: function(newBaseLayer) {
        if (this.map.allOverlays) {
            Ext.invoke(this.layers, "setVisibility", false);
            this.hideLinkedLayers(this.enabledLinkedLayers);
            this.map.setLayerIndex(newBaseLayer, 0);
            if (!this.orthoRef ||
                this.map.getLayersBy('ref', this.orthoRef)[0].opacity != 1) {
                // show new base layer only if ortho layer is not fully opaque
                newBaseLayer.setVisibility(true);
                if (newBaseLayer.linkedLayers && newBaseLayer.linkedLayers.length > 0) {
                    this.showLinkedLayers(newBaseLayer.linkedLayers, 
                      this.enabledLinkedLayers);
                }
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
            var orthoLayer = this.map.getLayersBy('ref', this.orthoRef)[0];
            if (state.opacity != 100) {
                orthoLayer.setVisibility(true);
            }
            orthoLayer.setOpacity(1 - parseInt(state.opacity) / 100);
        }
    }
});

/** api: xtype = cgxp_mapopacityslider */
Ext.reg("cgxp_mapopacityslider", cgxp.MapOpacitySlider);
