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
 *  class = Help
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Help(config)
 *
 *    Provides an "help" button.
 */
cgxp.plugins.Help = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_help */
    ptype: "cgxp_help",

    /** api: config[url]
     *  URL of help page to open.
     */
    url: null,

    helpactiontooltipText: "Help",

    helpactionText: null,

    /** api: method[addActions]
     */
    addActions: function() {
        var action = new GeoExt.Action({
            iconCls: "help",
            text: this.helpactionText,
            tooltip: this.helpactiontooltipText,
            handler: function() {
                window.open(this.url);
            },
            scope: this
        });
        return cgxp.plugins.Help.superclass.addActions.apply(this, [action]);
    }
});

Ext.preg(cgxp.plugins.Help.prototype.ptype, cgxp.plugins.Help);
