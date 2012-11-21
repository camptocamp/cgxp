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
 * @requires FeatureEditing/ux/widgets/form/FeaturePanel.js
 * @include CGXP/plugins/Redlining.js
 * @include CGXP/widgets/Ext.ux.ColorField.js
 * @include Ext/examples/ux/Spinner.js
 * @include Ext/examples/ux/SpinnerField.js
 */
GeoExt.ux.form.FeaturePanel.prototype.pointRadiusFieldText = "Point size";
GeoExt.ux.form.FeaturePanel.prototype.labelFieldText = "Label";
GeoExt.ux.form.FeaturePanel.prototype.colorFieldText = "Color";
GeoExt.ux.form.FeaturePanel.prototype.strokeWidthFieldText = "Stroke width";
GeoExt.ux.form.FeaturePanel.prototype.fontSizeFieldText = "Font size";

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
        title: OpenLayers.i18n('Attributes'),
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
