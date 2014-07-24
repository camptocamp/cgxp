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

Ext.namespace("cgxp.tree");
cgxp.tree.TreeNodeLoading = Ext.extend(Ext.util.Observable, {

    /** private: property[layerIds]
     *  ``Object`` A map referencing the layers we already have loadstart
     *  and loadend listeners for.
     */
    layerIds: null,

    /** private: property[numLoadingLayers]
     *  ``Object`` A map indicating whether nodes have loading layers.
     */
    numLoadingLayers: null,

    /** private: method[constructor]
     *  :param config: ``Object``
     */
    constructor: function(config) {
        Ext.apply(this.initialConfig, Ext.apply({}, config));
        Ext.apply(this, config);
        this.layerIds = {};
        this.numLoadingLayers = {};

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
        tree.on({
            "rendernode": this.onRenderNode,
            scope: this
        });
    },

    /** private: method[onAppendNode]
     *  :param node: ``Ext.tree.TreeNode``
     */
    onAppendNode: function(tree, parentNode, node) {
        this.registerLoadListeners(node);
    },

    /** private: method[registerLoadListeners]
     *  :param node: ``Ext.tree.TreeNode``
     *
     *  Register loadstart and loadend listeners on the layers associated
     *  with this group node.
     */
    registerLoadListeners: function(node) {
        var i, olLayer, olLayers, onLoadstart, onLoadend;
        olLayers = node.attributes.allOlLayers;
        if (!olLayers) {
            return;
        }
        this.numLoadingLayers[node.id] = 0;
        for (i = 0; i < olLayers.length; ++i) {
            olLayer = olLayers[i];
            if (olLayer !== null && !this.layerIds[olLayer.id]) {
                onLoadstart = Ext.createDelegate(
                        this.onLayerLoadstart, this, [node]);
                onLoadend = Ext.createDelegate(
                        this.onLayerLoadend, this, [node]);
                olLayer.events.on(
                        {loadstart: onLoadstart, loadend: onLoadend});
                this.layerIds[olLayer.id] = true;
            }
        }
    },

    /** private: method[onLayerLoadstart]
     *  :param node: ``Ext.tree.TreeNode``
     *
     *  Layer loadstart listener.
     */
    onLayerLoadstart: function(node) {
        if (++this.numLoadingLayers[node.id] > 0) {
            if (node.element) {
                node.element.style.display = "block";
            }
        }
    },

    /** private: method[onLayerLoadend]
     *  :param node: ``Ext.tree.TreeNode``
     *
     *  Layer loadend listener.
     */
    onLayerLoadend: function(node) {
        if (--this.numLoadingLayers[node.id] === 0) {
            if (node.element) {
                node.element.style.display = "none";
            }
        }
    },

    /** private: method[onRenderNode]
     * :param node: ``Ext.tree.TreeNode``
     */
    onRenderNode: function(node) {
        var rendered = node.rendered;
        if (!rendered) {
            node.element = Ext.DomHelper.insertFirst(node.ui.elNode,
                {"tag": "div", "class": 'gx-tree-node-loading'}
            );
            node.element.style.display = "none";
        }
    }
});

