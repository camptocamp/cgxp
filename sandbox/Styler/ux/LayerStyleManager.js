/**
 * Copyright (c) 2010 The Open Source Geospatial Foundation
 *
 * This is based on The Open Planning Project Styler:
 *   http://svn.opengeo.org/suite/trunk/styler/
 */
Ext.namespace("GeoExt.ux");

/**
 * Constructor: LayerStyleManager
 * Create a new styler application.
 *
 * Extends: Ext.util.Observable
 */
GeoExt.ux.LayerStyleManager = Ext.extend(Ext.util.Observable, {

    currentLayer: null,

    currentFeature: null,

    originalFeatureStyle: null,

    styler: null,
    
    constructor: function(styler, config) {
        config = config || {};

        this.styler = styler;

        this.addEvents(
            /**
             * Event: layerchanged
             * Fires when the active layer is changed.
             *
             * Listener arguments:
             * layer - {OpenLayers.Layer} The newly active layer.
             */
            "layerchanged",

            /**
             * Event: featurechanged
             * Fires when the active feature is changed.
             *
             * Listener arguments:
             * feature - {OpenLayers.Feature} The newly active feature.
             */
            "featurechanged",

            /**
             * Event: ruleupdated
             * Fires when a rule is modified.
             *
             * Listener arguments:
             * rule - {OpenLayers.Rule} The rule modified.
             */
            "styleupdated"

        );
        
        this.initialConfig = Ext.apply({}, config);
        Ext.apply(this, config);
        
        GeoExt.ux.LayerStyleManager.superclass.constructor.call(this);

    },

    /**
     * Method: createLayout
     * Create the layout of this object.
     * Redefine this function when extending the class
     */
    createLayout: function(config) {
        var layout = null;
        if(this.styler) {
            layout = this.styler.createLayout(config);
            this.styler.on('change', function(style) {
                if(this.currentFeature && style && this.currentFeature.style != style) {
                    this.currentFeature.style = style;
                    this.currentLayer.redraw();
                    this.fireEvent("styleupdated", this.currentFeature);
                }
                else if(!this.currentFeature && this.currentLayer && 
                        this.currentLayer.style != style) {
                    // TODO
                    // Need to support StyleMap as well
                }
            }, this);
        }

        return layout;
    },
    
    /**
     * Method: setCurrentLayer
     */
    setCurrentLayer: function(layer) {
        if(layer && layer != this.currentLayer)
        {
            this.currentLayer = layer;
            this.fireEvent("layerchanged", this.currentLayer);
        }

        return this.currentLayer;
    },

    /**
     * Method: setCurrentFeature
     */
    setCurrentFeature: function(feature) {
        if(feature && feature != this.currentFeature)
        {
            this.currentFeature = feature;
            this.originalFeatureStyle = feature.style;
            this.fireEvent("featurechanged", this.currentFeature);

            this.setCurrentLayer(feature.layer);
        }

        return this.currentFeature;
    },

    /**
     * Method: resetStyle
     */
    resetStyle: function() {
        if(this.currentFeature)
        {
            this.currentFeature.style = this.originalFeatureStyle;
            this.currentLayer.redraw();
        }

        return;
    },

    /**
     * Method: setOriginalStyle
     */
    setOriginalStyle: function(style, useCurrentStyle) {
        if(useCurrentStyle) {
            this.originalFeatureStyle = this.currentFeature.style;
        }
        else {
            this.originalFeatureStyle = style;
        }

        return;
    }

    
});
