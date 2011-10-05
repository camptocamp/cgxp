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
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = ThemeSelector
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

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

    /** api: config[tree]
     *  ``Object``
     *  Layertree panel.
     */
    tree: null,

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="thumb-wrap">',
                '<div class="thumb"><img src="{icon}"></div>',
                '<span>{name}</span></div>',
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
            width: 560,
            cls: 'theme-selector',
            listeners: {
                selectionchange: function(view, nodes) {
                    var record = view.getRecords(nodes)[0];
                    if (record) {
                        this.tree.loadTheme.apply(this.tree, [record.data]);
                    }   
                    themeSelector.menu.hide();
                }   
            }   
        };  
        var localView = new Ext.DataView(Ext.apply({
            title: OpenLayers.i18n('Themeselector.local'),
            store: localStore
        }, tabconfig));
        var externalView = new Ext.DataView(Ext.apply({
            title: OpenLayers.i18n('Themeselector.external'),
            store: externalStore
        }, tabconfig));

        var items = [localView];
        if (this.themes.external) {
            items.push(externalView);
        }
        var tabs = new Ext.TabPanel({
            width: 560,
            activeItem: 0,
            plain: true,
            border: false,
            tabPosition: 'bottom',
            items: items
        });        

        config = Ext.apply({
            xtype: "button",
            text: OpenLayers.i18n("Themeselector.themes"),
            cls: "themes",
            iconCls: 'themes',
            scale: 'large',
            width: '100%',
            menu: [{
                xtype: 'container',
                layout: 'fit',
                items: [tabs]
            }]
        }, config || {});
        
        var themeSelector = cgxp.plugins.ThemeSelector.superclass.addOutput.call(this, config);
        return themeSelector;
    }

});

Ext.preg(cgxp.plugins.ThemeSelector.prototype.ptype, cgxp.plugins.ThemeSelector);
