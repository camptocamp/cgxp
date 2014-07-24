/**
 * Copyright (c) 2011-2014 by Camptocamp SA
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
 *  Sample code showing how to add a ThemeFinder plugin to a
 *  `gxp.Viewer` can be see in the `LayerTree <LayerTree.html>`_.
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

    /** api: config[ignoreThemes]
     *  ``Array``
     *  List of theme names that shouldn't be found.
     */
    ignoreThemes: [],

    /** api: config[findTheme]
     *  ``Boolean``
     *  Find for themes, default to true.
     */
    findTheme: true,

    /** api: config[findGroup]
     *  ``Boolean``
     *  Find for first level layer groups (block), default to true.
     */
    findGroup: true,

    /** api: config[findFolder]
     *  ``Boolean``
     *  Find for layer group (tree folder), default to true.
     */
    findFolder: true,

    /** api: config[findLayer]
     *  ``Boolean``
     *  Find for layer (tree node), default to true.
     */
    findLayer: true,

    /** api: config[template]
     *  ``Ext.XTemplate``
     *  The template used to display the result, default to:
     *
     *  .. code:: javascript
     *
     *      new Ext.XTemplate(
     *          '<tpl for="."><div class="x-combo-list-item themefinder-{type}">',
     *          '{displayName}',
     *          '</div></tpl>'
     *      )
     *
     *  Available attributes:
     *   * {name} ``String``
     *   * {displayName} ``String``
     *   * {groupName} ``String`` Group display name
     *   * {level} ``Number`` 0 for theme, 1 for group, ... add 1 on each step,
     *     and 1.5 for case insensitive
     *   * {type} ``String`` theme|group|folder|layer
     */
    template: new Ext.XTemplate(
        '<tpl for="."><div class="x-combo-list-item themefinder-{type}">',
        '{displayName}',
        '</div></tpl>'
    ),

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var store = new Ext.data.ArrayStore({
            fields: ['name', 'displayName']
        });
        var ThemeRecord = Ext.data.Record.create([
            {name: 'name'},
            {name: 'displayName'},
            {name: 'groupName'},
            {name: 'level'},
            {name: 'type'},
            {name: 'node'},
            {name: 'group'}
        ]);
        var plugin = this;
        var twinField = new Ext.form.ComboBox(Ext.apply({
            store: store,
            tpl: this.template,
            mode: 'local',
            /*
             * Filter the theme, layer group, layer to display only the
             * corresponding elements.
             *
             * It will search on layer name and Displayname.
             *
             * Add a level element to sort theme (theme = 0, first layer group 1, ...)
             * and add 0.5 if it's not case sensitive.
             */
            filter: function(queryText, iQueryText, nodes, level, theme) {
                var cmp = function(node) {
                    return node.data.name == this.name &&
                        node.data.groupName == this.groupName &&
                        Math.floor(node.data.level) == this.level;
                };

                level = level || 0;
                Ext.each(nodes, function(node) {
                    if (level === 0 && plugin.ignoreThemes.indexOf(node.name) >= 0) {
                        return;
                    }
                    var mainGroup = level <= 1 ? node : theme;
                    var isLayer = !node.children;
                    var isTheme = level === 0;
                    var isGroup = !isLayer && level == 1;
                    var isFolder = !isLayer && level > 1;
                    // remove duplicate theme and same layergroup
                    var duplicate = level == 1 && theme.children.length == 1 &&
                            theme.children[0] === node &&
                            theme.name === node.name &&
                            plugin.findTheme; // don't filter duplicate if they aren't displayed
                    var type = isLayer ? 'layer' :
                            isTheme ? 'theme' :
                            isGroup ? 'group' :
                            'folder';

                    if (!duplicate && (isLayer && plugin.findLayer ||
                            isTheme && plugin.findTheme ||
                            isGroup && plugin.findGroup ||
                            isFolder && plugin.findFolder)) {
                        if ((node.name.search(queryText) >= 0 ||
                                node.displayName.search(queryText) >= 0) &&
                                store.findBy(cmp, {
                                    'name': node.name,
                                    'level': level,
                                    'groupName': mainGroup ? mainGroup.displayName : ''}) == -1) {
                            store.add([new ThemeRecord({
                                'name': node.name,
                                'displayName': node.displayName,
                                'groupName': mainGroup ? mainGroup.displayName : '',
                                'level': level,
                                'type': type,
                                'node': node,
                                'group': mainGroup
                            })]);
                        }
                        else {
                            // case insensitive search
                            if ((node.name.toLowerCase().search(iQueryText) >= 0 ||
                                    node.displayName.toLowerCase().search(iQueryText) >= 0) &&
                                    store.findBy(cmp, {
                                        'name': node.name,
                                        'level': level,
                                        'groupName': mainGroup ? mainGroup.displayName : ''}) == -1) {
                                store.add([new ThemeRecord({
                                    'name': node.name,
                                    'displayName': node.displayName,
                                    'groupName': mainGroup ? mainGroup.displayName : '',
                                    'level': level + 0.5,
                                    'type': type,
                                    'node': node,
                                    'group': mainGroup
                                })]);
                            }
                        }
                    }
                    this.filter(queryText, iQueryText, node.children, level+1, mainGroup);
                }, this);
            },

            themeQuery: function(queryText) {
                store.removeAll();
                var iQueryText = queryText.toLowerCase();

                this.filter(queryText, iQueryText, plugin.themes.local);
                if (plugin.themes.external) {
                    this.filter(queryText, iQueryText, plugin.themes.external);
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

        this.target.mapPanel.map.events.register('movestart', this, function(event) {
            twinField.blur();
        });

        twinField.on({
            'beforequery': function(e) {
                twinField.themeQuery(e.query);
                return false;
            },
            'select': function(combo, record, index) {
                var tree = this.target.tools[this.layerTreeId].tree;
                // theme
                if (record.data.level < 1) {
                    tree.loadTheme(record.data.node);
                }
                // first level of layer group
                else if (record.data.level < 2) {
                    tree.loadGroup(record.data.node);
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
                    if (record.data.node.children) {
                        fillLayers(record.data.node.children);
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
