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

Ext.namespace("cgxp.tree");
cgxp.tree.TreeNodeLoading = Ext.extend(Ext.util.Observable, {
    
    /** private: method[constructor]
     *  :param config: ``Object``
     */
    constructor: function(config) {
        Ext.apply(this.initialConfig, Ext.apply({}, config));
        Ext.apply(this, config);

        cgxp.tree.TreeNodeLoading.superclass.constructor.apply(this, arguments);
    },

    /** private: method[init]
     *  :param tree: ``Ext.tree.TreePanel`` The tree.
     */
    init: function(tree) {
        tree.root.on({
            "append": this.onAppendNode,
            "insert": this.onAppendNode,
            scope: this
        });
    },
    
    /** private: method[onAppendNode]
     *  :param node: ``Ext.tree.TreeNode``
     */
    onAppendNode: function(tree, parentNode, node) {
        var rendered = node.rendered;
        if(!rendered && node.layer) {
            var layer = node.layer;
            layer.events.on({
                'loadstart': function() {
                    if (node && node.ui && node.ui.isChecked()) {
                        Ext.get(node.ui.elNode).addClass('gx-tree-node-loading');
                    }
                },
                'loadend': function() {
                    if (node && node.ui && node.ui.elNode) {
                        Ext.get(node.ui.elNode).removeClass('gx-tree-node-loading');
                    }
                }
            });
        }
    }
});

