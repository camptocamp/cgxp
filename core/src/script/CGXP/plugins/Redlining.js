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
 * @requires CGXP/plugins/Panel.js
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
 *  CGXP/plugins/Panel.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Redlining(config)
 *
 *    Provides an action that opens a redlining tools panel.
 */
cgxp.plugins.Redlining = Ext.extend(cgxp.plugins.Panel, {

    /** api: ptype = cgxp_redlining */
    ptype: "cgxp_redlining",

    buttonText: "Redlining",
    buttonTooltipText: undefined,
    titleText: undefined,

    /** api: method[addOutput]
     */
    addOutput: function() {
        /* instanciating the RedLiningPanel at the 'ready' stage because the 
           actions depends of the existence of the layer, which can only be
           added now to be correctly placed above the background layers */
        var panel = new GeoExt.ux.form.RedLiningPanel({
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
            ctCls: 'no-background',
            width: 170,
            border: false
        });

        return cgxp.plugins.Redlining.superclass.addOutput.call(this, panel);
    }
});

Ext.preg(cgxp.plugins.Redlining.prototype.ptype, cgxp.plugins.Redlining);

// monkey patch
GeoExt.ux.FeatureEditingControler.prototype.reactivateDrawControl = Ext.emptyFn;

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
