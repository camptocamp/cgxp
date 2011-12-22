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
 *  class = MenuShortcut
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: MenuShortcut(config)
 *
 *  Used to add Ext menu shortcut
 */
cgxp.plugins.MenuShortcut = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_menushortcut */
    ptype: "cgxp_menushortcut",

    /** api: config[type]
     *  The type of menu to add ('->', '-', ' ').
     */
    type: '->',

    /** api: method[addActions]
     */
    addActions: function() {
        var classes = {
            '->': Ext.Toolbar.Fill,
            '-': Ext.Toolbar.Separator,
            ' ': Ext.Toolbar.Spacer
        }
        
        return cgxp.plugins.MenuShortcut.superclass.addActions.apply(this, 
                [new classes[this.type]()]);
    }
});

Ext.preg(cgxp.plugins.MenuShortcut.prototype.ptype, cgxp.plugins.MenuShortcut);
