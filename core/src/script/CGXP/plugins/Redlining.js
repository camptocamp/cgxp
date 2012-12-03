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
 * @include CGXP/widgets/tool/Button.js
 * @include CGXP/widgets/tool/Window.js
 * @include CGXP/widgets/RedLiningPanel.js
 * @requires FeatureEditing/ux/widgets/FeatureEditingControler.js
 * @include FeatureEditing/ux/data/FeatureEditingDefaultStyleStore.js
 * @include Styler/ux/LayerStyleManager.js
 * @include Styler/ux/widgets/StyleSelectorComboBox.js
 * @include LayerManager/ux/widgets/LayerManagerExportWindow.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Redlining
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Redlining plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_redligning',
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools',
 *              stateId: 'rl', // to save the drawing in the permalink
 *              layerManagerUrl: "${request.static_url('<package>:static/lib/cgxp/sandbox/LayerManager/ux/')}"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Redlining(config)
 *
 *    Provides an action that opens a redlining tools panel.
 */
cgxp.plugins.Redlining = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_redlining */
    ptype: "cgxp_redlining",

    /** api: config[stateId]
     *  Used to generate the permalink.
     */
    stateId: null,

    /** api: config[toggleGroup]
     *  The group this toggle button is member of.
     */
    toggleGroup: null,

    /** api: config[actionConfig]
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

    /** api: config[layerManagerUrl]
     *  ``String``
     *  set base url of resources in GeoExt.ux.LayerManagerExportWindow widget
     */
    layerManagerUrl: null,

    redliningPanel: null,

    redliningWindow: null,

    /* i18n*/
    redliningText: "Redlining",
    attributesText: 'Attributes',

    init: function() {
        cgxp.plugins.Redlining.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);

        GeoExt.ux.LayerManagerExportWindow.prototype.baseUrl = this.layerManagerUrl;
    },

    viewerReady: function() {
        /* instanciating the RedLiningPanel at the 'ready' stage because the 
           actions depends of the existence of the layer, which can only be
           added now to be correctly placed above the background layers */
        this.redliningPanel = new cgxp.RedLiningPanel({
            stateId: this.stateId,
            map: this.target.mapPanel.map,
            popupOptions: {
                unpinnable: false,
                draggable: true
            },  
            selectControlOptions: {
                toggle: false,
                clickout: false
            },  
            'import': false,
            bodyStyle: 'display: none',
            border: false
        });
        /* pushing the RedLiningPanel with all the actions into the existing but 
           empty redliningWindow */
        this.redliningWindow.add(this.redliningPanel);
    },

    /** api: method[addActions]
     */
    addActions: function() {

        /**
         * Method: deactivateRedlining
         * Deactivates all redlining controls
         */
        // See monkey patch (end of this file)
        var deactivateRedlining = function() {
            var actions = this.redliningPanel.controler.actions;
            for (var i=0; i < actions.length; i++) {
                if (actions[i].control) {
                    actions[i].control.deactivate();
                }
            }
        }.createDelegate(this);

        /** 
         * Property: redliningWindow
         */
        this.redliningWindow = new cgxp.tool.Window({
            width: 240,
            items: []
        }); 

        var button = new cgxp.tool.Button(
            new Ext.Action(Ext.apply({
                text: this.redliningText,
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                window: this.redliningWindow
            }, this.actionConfig))
        );  
        button.on({
            'toggle': function(button) {
                if (!button.pressed) {
                    deactivateRedlining();
                }   
            }   
        });
        return cgxp.plugins.Redlining.superclass.addActions.apply(this, [button]);
    }

});

Ext.preg(cgxp.plugins.Redlining.prototype.ptype, cgxp.plugins.Redlining);

// monkey patch
GeoExt.ux.FeatureEditingControler.prototype.reactivateDrawControl = Ext.emptyFn;

/**
 * @requires FeatureEditing/ux/widgets/form/FeaturePanel.js
 * @include CGXP/plugins/Redlining.js
 * @include CGXP/widgets/Ext.ux.ColorField.js
 * @include Ext/examples/ux/Spinner.js
 * @include Ext/examples/ux/SpinnerField.js
 */
GeoExt.ux.form.FeaturePanel.prototype.pointRadiusFieldText = "Size";
GeoExt.ux.form.FeaturePanel.prototype.labelFieldText = "Label";
GeoExt.ux.form.FeaturePanel.prototype.colorFieldText = "Color";
GeoExt.ux.form.FeaturePanel.prototype.strokeWidthFieldText = "Stroke width";
GeoExt.ux.form.FeaturePanel.prototype.fontSizeFieldText = "Size";

// some more redlining patch
GeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {
    var oItems, oGroup, feature, field, oGroupItems;

    // todo : for multiple features selection support, remove this...
    if (this.features.length != 1) {
        return;
    } else {
        feature = this.features[0];
    }
    oItems = [];
    oGroupItems = [];
    oGroup = {
        id: this.attributeFieldSetId,
        xtype: 'fieldset',
        title: this.attributesText,
        layout: 'form',
        collapsible: true,
        autoHeight: this.autoHeight,
        autoWidth: this.autoWidth,
        defaults: this.defaults,
        defaultType: this.defaultType
    };

    if (feature.geometry.CLASS_NAME === "OpenLayers.Geometry.Point" ) {
        if (!feature.isLabel) {
            // point size
            oGroupItems.push({
                xtype: 'spinnerfield',
                name: 'pointRadius',
                fieldLabel: this.pointRadiusFieldText,
                value: feature.style.pointRadius || 10,
                width: 40,
                minValue: 6,
                maxValue: 20,
                listeners: {
                    spin: function(spinner) {
                        feature.style = OpenLayers.Util.extend(feature.style,  {
                            pointRadius: spinner.field.getValue()
                        });
                        feature.layer.drawFeature(feature);
                    },
                    scope: this
                }
            });
        }
    }

    if (feature.isLabel) {
        oGroupItems.push({
            name: 'name',
            fieldLabel: this.labelFieldText,
            id: 'name',
            value: feature.attributes['name']
        });
    }

    // color or font color
    var colorpicker = new Ext.ux.ColorField({
        value: feature.style[(feature.isLabel ? 'fontColor' : 'fillColor')] ||
            '#ff0000',
        fieldLabel: this.colorFieldText,
        width: 100
    });
    colorpicker.on('select', function(cm, color) {
        if (feature.isLabel) {
            feature.style.fontColor = color;
        } else {
            feature.style.fillColor = color;
            feature.style.strokeColor = color;
        }
        feature.layer.drawFeature(feature);
    }, this);

    oGroupItems.push(colorpicker);

    if (feature.geometry.CLASS_NAME !== "OpenLayers.Geometry.Point" ||
        feature.isLabel) {
        // font size or stroke width
        var attribute = feature.isLabel ? 'fontSize' : 'strokeWidth';
        oGroupItems.push({
            xtype: 'spinnerfield',
            name: 'stroke',
            fieldLabel: this[attribute + 'FieldText'],
            value: feature.style[attribute] || ((feature.isLabel) ? 12 : 1),
            width: 40,
            minValue: feature.isLabel ? 10 : 1,
            maxValue: feature.isLabel ? 20 : 10,
            listeners: {
                spin: function(spinner) {
                    var f = feature;
                    var style = {};
                    style[attribute] = spinner.field.getValue() +
                        (f.isLabel ? 'px' : '');
                    f.style = OpenLayers.Util.extend(f.style, style);
                    f.layer.drawFeature(f);
                },
                scope: this
            }
        });
    }

    oGroup.items = oGroupItems;

    oItems.push(oGroup);

    Ext.apply(this, {items: oItems});
};
