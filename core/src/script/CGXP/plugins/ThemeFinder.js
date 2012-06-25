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
 *  class = ThemeFinder
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing on to add a ThemeFinder plugin to a
 *  Viewer can be see in the `LayerTree <LayerTree.html>`_.
 */

/** api: constructor
 *  .. class:: ThemeFinder(config)
 *
 */   
cgxp.plugins.ThemeFinder = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = cgxp_themefinder */
    ptype: "cgxp_themefinder",

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

    emptyText: "Find a theme or a layer",

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var store = new Ext.data.ArrayStore({
            fields: ['name', 'displayName']
        });
        var tpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-combo-list-item">',
            '{displayName}',
            '</div></tpl>'
        );
        var ThemeRecord = Ext.data.Record.create([
            {name: 'name'},
            {name: 'displayName'},
            {name: 'level'},
            {name: 'children'},
            {name: 'group'}
        ]);
        var twinField = new Ext.form.ComboBox(Ext.apply({
            store: store,
            tpl: tpl,
            mode: 'local',
            themes: this.themes,
            themeQuery: function(queryText) {
                store.removeAll();
                var iQueryText = queryText.toLowerCase();
                
                /*
                 * Filter the theme, layer group, layer to display only the 
                 * corresponding elements.
                 *
                 * It will search on layer name and Displayname.
                 *
                 * Add a level elemnt to sort theme (theme = 0, first layer group 1, ...)
                 * and add 0.5 if it's not case sensitive.
                 */
                function filter(nodes, level, theme) {
                    level = level || 0;
                    Ext.each(nodes, function(node) {
                        var mainGroup = level <= 1 ? node : theme;
                        // remove dupplicate theme and same layergroup
                        if (level == 1 && theme.children.length == 1 
                                && theme.children[0] === node 
                                && theme.name === node.name) {
                            filter(node.children, level+1, mainGroup);
                            return;
                        }
                        if (node.name.search(queryText) >= 0
                                || node.displayName.search(queryText) >= 0) {
                            store.add([new ThemeRecord({
                                'name': node.name,
                                'displayName': node.displayName,
                                'level': level,
                                'children': node.children,
                                'group': mainGroup
                            })]);
                        }
                        else {
                            // case insensitive search
                            if (node.name.toLowerCase().search(iQueryText) >= 0
                                    || node.displayName.toLowerCase().search(iQueryText) >= 0) {
                                store.add([new ThemeRecord({
                                    'name': node.name,
                                    'displayName': node.displayName,
                                    'level': level + 0.5,
                                    'children': node.children,
                                    'group': mainGroup
                                })]);
                            }
                        }
                        filter(node.children, level+1, mainGroup);
                    });
                }

                filter(this.themes.local);
                if (this.themes.external) {
                    filter(this.themes.external);
                }
                store.sort('level');

                this.onLoad();
                if (this.view) {
                    this.select(0);
                }
            },
            minChars: 1,
            queryDelay: 0,
            emptyText: this.emptyText,
            displayField: 'displayName',
            hideTrigger: true,
            margins: { left: 3, right: 3, top: 0, bottom: 0 }
        }, config || {}));

        twinField.on({
            'beforequery': function(e) {
                twinField.themeQuery(e.query);
                return false;
            },
            'select': function(combo, record, index) {
                var tree = this.target.tools[this.layerTreeId].tree;
                // theme
                if (record.data.level < 1) {
                    tree.loadTheme(record.data);
                }
                // first level of layer group
                else if (record.data.level < 2) {
                    tree.loadGroup(record.data);
                }
                else {
                    var layers = [record.data.name];
                    var fillLayers = function(nodes) {
                        Ext.each(nodes, function(node) {
                            layers.push(node.name);
                            if (node.children) {
                                fillLayers(node.children);
                            }
                        });
                    };
                    if (record.data.children) {
                        fillLayers(record.data.children);
                    }

                    tree.loadGroup(record.data.group, layers);
                }
            },
            'render': function(component) {
                function stop(e) {
                    var event = e || window.event;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        event.cancelBubble = true;
                    }
                }
                component.getEl().dom.onkeydown = stop;
            },
            scope: this
        });
        
        var searchField = cgxp.plugins.ThemeFinder.superclass.addOutput.call(this, twinField);
        return searchField;
    }
});

Ext.preg(cgxp.plugins.ThemeFinder.prototype.ptype, cgxp.plugins.ThemeFinder);
