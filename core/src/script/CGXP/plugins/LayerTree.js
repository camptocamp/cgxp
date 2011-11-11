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
 * @include CGXP/widgets/tree/LayerTree.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = LayerTree
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: LayerTree(config)
 *
 */   
cgxp.plugins.LayerTree = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = cgxp_layertree */
    ptype: "cgxp_layertree",

    /** api: config[themes]
     *  ``Object``
     *  List of internal and external themes and layers.
     */
    themes: null,

    tree: null,

    init: function() {
        cgxp.plugins.LayerTree.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },

    viewerReady: function() {
        this.tree.delayedApplyState();
        this.tree.loadDefaultThemes();
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {

        config = Ext.apply({
            xtype: "cgxp_layertree",
            map: this.target.mapPanel.map
        }, config || {});
        
        this.tree = cgxp.plugins.LayerTree.superclass.addOutput.call(this, config);
        return this.tree;
    }

});

Ext.preg(cgxp.plugins.LayerTree.prototype.ptype, cgxp.plugins.LayerTree);
