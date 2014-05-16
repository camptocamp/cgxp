/**
 * See http://www.jbruni.com.br/extjs-tristate/
 * and http://www.sencha.com/forum/showthread.php?98442-TreePanel-with-tri-state-checkboxes&s=396391365361edfc52edc242327be057
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

/*
 * @requires GeoExt/widgets/tree/TreeNodeUIEventMixin.js
 */

Ext.namespace("cgxp.tree");

cgxp.tree.TreeNodeTriStateUI = function() {
    cgxp.tree.TreeNodeTriStateUI.superclass.constructor.apply(this, arguments);
    this.partial = false;
};

Ext.extend(cgxp.tree.TreeNodeTriStateUI,
    Ext.extend(Ext.tree.TreeNodeUI, new GeoExt.tree.TreeNodeUIEventMixin()), {

    renderElements : function(n, a, targetNode, bulkRender){
        Ext.tree.TreeNodeUI.prototype.renderElements.apply(this, arguments);
        //updating partial nodes
        n.bubble(function(n){
            if (n.parentNode) {
                n.getUI().updateCheck(true);
            }
        });//pass in true -> inform, that this is loaded node!
    },

    toggleCheck: function(value, partial, loaded){
        var cb = this.checkbox;
        if(cb){
            cb.checked = (value === undefined ? !cb.checked : value);
            cb.indeterminate = this.partial = cb.checked && partial;
            if(!loaded) {
                this.onCheckChange();
            }
        }
    },

    updateCheck: function(loaded){
        if (this.node.childNodes.length === 0) {
            return;
        }
        this.partial = 0;
        var cb = this.checkbox;
        Ext.each(this.node.childNodes, function(item){
            var ui = item.getUI();
            if (ui.isChecked()) {
                this.partial++;
                if (ui.partial) {
                    this.toggleCheck(true, true, loaded);
                    return false;
                }
            }
        }, this);
        if (this.partial !== true) {
            this.toggleCheck(
                this.partial > 0,
                this.partial < this.node.childNodes.length,
                loaded
            );
        }
    }
});
