/**
 * Copyright (c) 2012 Camptocamp
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
 *  class = Menu
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Menu plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_menu',
 *              id: 'menu',
 *              actionTarget: 'center.tbar',
 *              actionConfig: {
 *                  text: 'My menu'
 *              }
 *          },
 *          {
 *              ptype: 'an_other_tool',
 *              actionTarget: 'menu',
 *              actionConfig: {
 *                  menuText: 'Item'
 *              }
 *          }]
 *          ...
 *      });
 *
 *  And for a split button menu:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_menu',
 *              id: 'splitmenu',
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools',
 *              splitButton: true,
 *              actionConfig: {
 *                  text: 'My split menu'
 *              }
 *          },
 *          {
 *              ptype: 'an_other_tool',
 *              actionTarget: 'splitmenu',
 *              actionConfig: {
 *                  menuText: 'Item'
 *              }
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Menu(config)
 */
cgxp.plugins.Menu = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_menu */
    ptype: "cgxp_menu",

    /** api: config[actionConfig]
     *  ``Object``
     *  Configuration object for the action created by this plugin.
     */

    /** api: config[toggleGroup]
     *  ``String``
     *  Toggle button group.
     */

    /** api: config[id]
     *  ``String``
     *  ID of the plugin and the menu.
     */

    /** api: config[splitButton]
     *  ``Boolean``
     *  Use a split button instance of a simple menu. Default is ``false``.
     */
    splitButton: false,

    /** api: config[actionTarget]
     *  ``String`` the place where the menu is placed. Default is 'center.tbar'.
     */
    actionTarget: "center.tbar",

    /** api: method[addActions]
     */
    addActions: function() {
        var self = this;
        var listeners = {};
        var setActiveItem;
        if (this.splitButton) {
            setActiveItem = function(item, checked) {
                self.activeItem = item;
                self.button.toggle(checked);
                // for backward compatibility to toggle button
                item.fireEvent('toggle', item);
                if (checked) {
                    self.button.setIconClass(item.iconCls);
                    self.button.setTooltip(item.tooltip);
                    if (self.actionConfig.text !== undefined) {
                        self.button.setText(item.text);
                    }
                }
            }
        }

        var menu = new Ext.menu.Menu({
            id: this.id,
            getItem: function(item) {
                if (self.splitButton || item.initialConfig.enableToggle) {
                    if (self.splitButton) {
                        item.addListener('checkchange', setActiveItem);
                    }
                    else {
                        item.addListener('checkchange',
                                function(item, checked) {
                            // for backward compatibility to toggle button
                            item.fireEvent('toggle', item);
                        });
                        // always change check when we are in a group
                        item.handleClick = function(e) {
                             if (!this.disabled) {
                                 this.setChecked(!this.checked);
                             }
                             Ext.menu.CheckItem.superclass.handleClick
                                    .apply(this, arguments);
                         };
                    }
                    return item
                }
                else {
                    var config = Ext.applyIf({
                        text: item.initialConfig.menuText,
                        group: item.initialConfig.toggleGroup,
                        listeners: {}
                    }, item.initialConfig);
                    if (self.splitButton) {
                        config.listeners.checkchange = setActiveItem;
                    }
                    return config;
                }
            },
            add: function(item) {
                return Ext.menu.Menu.superclass.add.apply(this,
                        [this.getItem(item)]);
            },
            insert: function(index, item) {
                return Ext.menu.Menu.superclass.insert.apply(this,
                        [index, this.getItem(item)]);
            }
        })
        var button;
        if (this.splitButton) {
            button = new Ext.SplitButton(Ext.apply({
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                allowDepress: true,
                handler: function(button, event) {
                    if (button.pressed && this.activeItem) {
                        this.activeItem.setChecked(true);
                    }
                },
                scope: this,
                listeners: {
                    toggle: function(button, pressed) {
                        if (!pressed) {
                            button.menu.items.each(function(i) {
                                i.setChecked(false);
                            });
                        }
                    },
                    render: function(button) {
                        Ext.ButtonToggleMgr.register(button);
                    }
                },
                menu: menu
            }, this.actionConfig || {}));
            this.button = button;
        }
        else {
            button = new Ext.Button(Ext.apply({
                iconCls: 'no-icon',
                menu: menu
            }, this.actionConfig || {}));
        }

        return cgxp.plugins.Menu.superclass.addActions.apply(this, [button]);
    }
});

Ext.preg(cgxp.plugins.Menu.prototype.ptype, cgxp.plugins.Menu);
