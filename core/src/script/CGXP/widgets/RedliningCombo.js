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
        var styleStore = new Ext.data.SimpleStore(
            GeoExt.ux.data.getFeatureEditingDefaultStyleStoreOptions());
        styleStore.sort('name');
        var styler = new GeoExt.ux.LayerStyleManager(
            new GeoExt.ux.StyleSelectorComboBox({
                store: styleStore,
                comboBoxOptions: {
                    emptyText: OpenLayers.i18n("select a color..."),
                    fieldLabel: OpenLayers.i18n('color'),
                    editable: false,
                    typeAhead: true,
                    selectOnFocus: true
                }
        }), {});
        styler.setCurrentFeature(this.features[0]);

        oGroupItems.push(styler.createLayout().comboBox);
    }

    oGroup.items = oGroupItems;

    oItems.push(oGroup);

    Ext.apply(this, {items: oItems});
};
