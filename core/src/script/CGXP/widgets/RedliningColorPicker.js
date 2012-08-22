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
 */

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

    if (feature.isLabel) {
        oGroupItems.push({
            name: 'name',
            fieldLabel: OpenLayers.i18n('name'),
            id: 'name',
            value: feature.attributes['name']
        });
    } else {
        var colorpicker = new Ext.ux.ColorField({
            value: feature.style.fillColor || '#ff0000',
            fieldLabel: OpenLayers.i18n('color'),
            width: 100
        });
        colorpicker.on('select', function(cm, color) {
            feature.style.fillColor = color;
            feature.style.strokeColor = color;
            feature.layer.drawFeature(feature);
        }, this);

        oGroupItems.push(colorpicker);
    }

    oGroup.items = oGroupItems;

    oItems.push(oGroup);

    Ext.apply(this, {items: oItems});
};
