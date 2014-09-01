/**
 * Copyright (c) 2010 The Open Source Geospatial Foundation
 */

/**
 * Copyright (c) 2010 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 *
 * This is loosely based on The Open Planning Project Styler:
 *   http://svn.opengeo.org/suite/trunk/styler/
 */
Ext.namespace("GeoExt.ux");

/** api: (define)
 *  module = GeoExt.ux.form
 *  class = StyleSelectorComboBox
 *  base_link = `Ext.form.FormPanel <http://extjs.com/deploy/dev/docs/?class=Ext.form.FormPanel>`_
 */

/** api: constructor
 *  .. class:: StyleSelectorComboBox
 *
 *  Todo
 */
GeoExt.ux.StyleSelectorComboBox = Ext.extend(Ext.Panel, {

    store: null,

    comboBox: null,

    comboBoxOptions: {},

    /** private: method[initComponent]
     */
    initComponent: function() {

        this.addEvents(
            /**
             * Event: change
             * Fires when the style is changed.
             *
             * Listener arguments:
             * style - {OpenLayers.Style} The style selected.
             */
            "change"

        );

        this.initComboBox();

        GeoExt.ux.StyleSelectorComboBox.superclass.initComponent.call(this);
    },


    /** api: method[createLayout]
     *  This function returns a GeoExt object (Panel, Window, etc)
     *  If a generic Styler class is created, then this class would be an 
     *  Observable that create and return a Panel in this function.
     */
    createLayout: function(config) {
        return this;
    },

    /** private: method[initComoboBox]
     *  Create the GeoExt ComboBox from the styleStore.
     */
    initComboBox: function() {
        var oItems= Array();

        if(this.store == null){
            return;
        }

        var oCombo = new Ext.form.ComboBox(
            Ext.applyIf(this.comboBoxOptions, {
                store: this.store,
                tpl: '<tpl for="."><div class="x-combo-list-item">{[values.name]}</div></tpl>',
                editable: false,
                triggerAction: 'all', // needed so that the combo box doesn't filter by its current content
                mode: 'local' // keep the combo box from forcing a lot of unneeded data refreshes,
            })
        );

        oItems.push(oCombo);

        oCombo.on('select', 
            function(combo, record, index) {
                oCombo.setValue(record.data.name);
                this.fireEvent("change", OpenLayers.Util.applyDefaults(record.data.style, OpenLayers.Feature.Vector.style['default']));
            },
            this
        );    

        Ext.apply(this, {items: oItems});

        this.comboBox = oCombo;
    }

});

/** api: xtype = gx_minisymbolizer */
Ext.reg("gx_styleselectorcombobox", GeoExt.ux.StyleSelectorComboBox);
