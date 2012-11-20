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

    /**
     * private: method[initComponent]
     * Creates the map toolbar.
     *
     * Returns:
     * {Ext.Toolbar} The toolbar.
     */
    initComponent: function() {
        GeoExt.MapPanel.superclass.initComponent.call(this);
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
        var baseLayer = this.map.getLayersBy('ref', this.defaultBaseLayerRef)[0];
        if (baseLayer) {
            this.updateBaseLayer(baseLayer);
        }

        this.opacitySlider = this.createOpacitySlider();
        this.add([
            this.createOrthoLabel(),
            this.opacitySlider,
            this.createBaselayerCombo()
        ]);
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
        var slider = new GeoExt.LayerOpacitySlider({
            width: 100,
            layer: orthoLayer,
            inverse: true,
            aggressive: true,
            changeVisibility: true,
            complementaryLayer: this.map.baseLayer,
            maxvalue: 100,
            style: "margin-right: 10px;"
        });
        this.map.events.register("changebaselayer", this, function(e) {
            slider.complementaryLayer = e.layer;
            slider.complementaryLayer.setVisibility(!(orthoLayer.opacity == 1));
            this.fireEvent('changebaselayer');
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
            newBaseLayer.setVisibility(true);
        } else {
            this.map.setBaseLayer(newBaseLayer);
        }
    },

    /** private: method[saveState]
     */
    getState: function() {
        var baselayer = this.map.baseLayer;
        return {
            opacity: this.opacitySlider.getValue(),
            ref: this.map.baseLayer.ref
        }
    },

    /** private: method[applyState]
     */
    applyState: function(state) {
        var baselayer = this.map.getLayersBy('ref', state.ref)[0];
        this.updateBaseLayer(baselayer);
        var orthoLayer = this.map.getLayersBy('ref', this.orthoRef)[0]
        if (state.opacity != 100) {
            orthoLayer.setVisibility(true);
        }
        orthoLayer.setOpacity(1 - parseInt(state.opacity) / 100);
    }
});

/** api: xtype = cgxp_mapopacityslider */
Ext.reg("cgxp_mapopacityslider", cgxp.MapOpacitySlider);
