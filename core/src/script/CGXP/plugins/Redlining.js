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

    /** api[config]: actionConfig
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

    redliningPanel: null,

    redliningWindow: null,

    redliningText: "Redlining",

    init: function() {
        cgxp.plugins.Redlining.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        /* instanciating the RedLiningPanel at the 'ready' stage because the 
           actions depends of the existence of the layer, which can only be
           added now to be correctly placed above the background layers */
        this.redliningPanel = new GeoExt.ux.form.RedLiningPanel({
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
            width: 200, 
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
