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
 * @requires FeatureEditing/ux/widgets/FeatureEditingControler.js
 * @include FeatureEditing/ux/widgets/form/RedLiningPanel.js
 * @include FeatureEditing/ux/data/FeatureEditingDefaultStyleStore.js
 * @include Styler/ux/LayerStyleManager.js
 * @include Styler/ux/widgets/StyleSelectorComboBox.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Redlining
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Redlining(config)
 *
 *    Provides an action that opens a redlining tools panel.
 */
cgxp.plugins.Redlining = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_redlining */
    ptype: "cgxp_redlining",

    /** api: config[toggleGroup]
     *  The group this toggle button is member of.
     */
    toggleGroup: null,

    /** api: method[addActions]
     */
    addActions: function() {
        /**
         * Method: deactivateRedlining
         * Deactivates all redlining controls
         */
        // See monkey patch (end of this file)
        var deactivateRedlining = function() {
            var actions = redliningPanel.controler.actions;
            for (var i=0; i < actions.length; i++) {
                if (actions[i].control) {
                    actions[i].control.deactivate();
                }
            }
        };

        var redliningPanel = new GeoExt.ux.form.RedLiningPanel({
            map: this.target.mapPanel.map,
            popupOptions: {
                unpinnable: false,
                draggable: true
            },  
            selectControlOptions: {
                toggle: false,
                clickout: false
            },  
            'export': false,
            'import': false,
            bodyStyle: 'display: none',
            border: false
        }); 

        /** 
         * Prorperty: redliningWindow
         */
        var redliningWindow = new cgxp.tool.Window({
            width: 200, 
            items: [redliningPanel]
        }); 

        var button = new cgxp.tool.Button(
            new Ext.Action({
                text: OpenLayers.i18n('Tools.redlining'),
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                window: redliningWindow
            })  
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

GeoExt.ux.form.FeaturePanel.prototype.getActions = function() {
    if (!this.closeAction) {
        this.closeAction = new Ext.Action({
            handler: function() {
                this.controler.triggerAutoSave();
                if(this.controler.popup) {
                    this.controler.popup.close();
                }
                this.controler.reactivateDrawControl();
            },
            scope: this,
            text: OpenLayers.i18n('Close')
        });
    }

    return [this.deleteAction, '->', this.closeAction];
};
