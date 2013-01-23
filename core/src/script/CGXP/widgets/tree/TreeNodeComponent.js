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
 * @requires GeoExt/plugins/TreeNodeComponent.js
 */
Ext.namespace("cgxp.tree");
cgxp.tree.TreeNodeComponent = Ext.extend(GeoExt.plugins.TreeNodeComponent, {

    divCls: null,

    configKey: 'component',

    /** private: method[onRenderNode]
     *  :param node: ``Ext.tree.TreeNode``
     */
    onRenderNode: function(node) {
        var rendered = node.rendered;
        var attr = node.attributes;
        var component = attr[this.configKey] || this[this.configKey];
        if(!rendered && component) {
            var elt = Ext.DomHelper.append(node.ui.elNode, [
                {"tag": "div", "class": this.divCls}
            ]);
            if(typeof component == "function") {
                component = component(node, elt);
            } else if (typeof component == "object" &&
                       typeof component.fn == "function") {
                component = component.fn.apply(
                    component.scope, [node, elt]
                );
            }
            if(typeof component == "object" &&
               typeof component.xtype == "string") {
                component = Ext.ComponentMgr.create(component);
            }
            if(component instanceof Ext.Component) {
                component.render(elt);
                node[this.configKey] = component;
            }
        }
    }
});
