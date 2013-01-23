/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = ThemeSelector
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a ThemeSelector plugin to a
 *  `gxp.Viewer` can be see in the `LayerTree <LayerTree.html>`_.
 */

/** api: constructor
 *  .. class:: ThemeSelector(config)
 *
 */   
cgxp.plugins.ThemeSelector = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = cgxp_themeselector */
    ptype: "cgxp_themeselector",

    /** api: config[themes]
     *  ``Object``
     *  List of internal and external themes and layers.
     */
    themes: null,

    /** api: config[layerTreeId]
     *  ``String``
     *  Id of the layertree tool.
     */
    layerTreeId: null,

    /* i18n */
    localTitle: "Local layers",
    externalTitle: "External layers",
    toolTitle: "Themes",
    
    /** api: config[maxHeight]
     *  ``Integer``
     *  Maximum height in pixels of the themeSelector panel.
     */
    maxHeight: null,

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="thumb-wrap">',
                '<div class="thumb"><img src="{icon}" onError="if (event.target) event.target.src=Ext.BLANK_IMAGE_URL"></div>',
                '<span>{[OpenLayers.i18n(values.name)]}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
        );  
     
        var tabconfig = { 
            fields: ['name', 'icon', 'children']
        };  
        var localStore = new Ext.data.JsonStore(Ext.apply(tabconfig, {
            data: this.themes.local
        }));
        var externalStore = new Ext.data.JsonStore(Ext.apply(tabconfig, {
            data: this.themes.external || []  
        }));
     
        tabconfig =  {
            tpl: tpl,
            overClass: 'x-view-over',
            itemSelector:'div.thumb-wrap',
            singleSelect: true,
            autoScroll: true,
            cls: 'theme-selector',
            listeners: {
                selectionchange: function(view, nodes) {
                    var record = view.getRecords(nodes)[0];
                    if (record) {
                        var tree = this.target.tools[this.layerTreeId].tree;
                        tree.loadTheme(record.data);
                    }   
                    themeSelector.menu.hide();
                },
                afterrender: function(view) {
                    if (this.maxHeight && view.getHeight() > this.maxHeight) {
                        view.setHeight(this.maxHeight);
                    }
                },
                scope: this
            }   
        };

        var themepanel;
        if (this.themes.external) {
            var localView = new Ext.DataView(Ext.apply({
                title: this.localTitle,
                store: localStore
            }, tabconfig));
            var externalView = new Ext.DataView(Ext.apply({
                title: this.externalTitle,
                store: externalStore
            }, tabconfig));
    
            themepanel = new Ext.TabPanel({
                width: 560,
                activeTab: 0,
                plain: true,
                border: false,
                tabPosition: 'bottom',
                items: [localView, externalView],
                deferredRender: false,
                listeners: {
                    tabchange: function(cmp) {
                        cmp.ownerCt.doLayout();
                    }
                }
            });
        } else {
            themepanel = new Ext.DataView(Ext.apply({
                width: 560,
                store: localStore
            }, tabconfig));
        }

        config = Ext.apply({
            xtype: "button",
            text: this.toolTitle,
            cls: "themes",
            iconCls: 'themes',
            scale: 'large',
            width: '100%',
            menu: [themepanel]
        }, config || {});
        
        var themeSelector = cgxp.plugins.ThemeSelector.superclass.addOutput.call(this, config);
        return themeSelector;
    }
});

Ext.preg(cgxp.plugins.ThemeSelector.prototype.ptype, cgxp.plugins.ThemeSelector);
