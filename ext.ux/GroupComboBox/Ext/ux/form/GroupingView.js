/**
 * Copyright (c) 2012-2014 by Camptocamp SA
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

Ext.ux.form.GroupingView = Ext.extend(Ext.DataView, {
    
    /** api: config[groupTextTpl]
     *  ``String`` The template used to render the group text. Not required if
     *  `groupTpl` is set. Optional.
     */
    groupTextTpl : '{[OpenLayers.i18n(values.text)]}',
    
    /** api: config[groupTpl]
     *  ``String`` The template used to render the group text. Optional.
     */
    groupTpl: null,
    
    /** api: config[itemTpl]
     *  ``String`` The template used to render each item. Optional.
     */
    itemTpl: null,
    
    /** private: method[initTemplates]
     */
    initComponent: function() {
        this.initTemplates();
        Ext.ux.form.GroupingView.superclass.initComponent.apply(this, arguments);
    },
    
    /** private: method[initTemplates]
     */
    initTemplates: function() {
        if (!this.groupTpl) {
            this.groupTpl = new Ext.XTemplate([
                '<div class="x-combo-list-group">',
                this.groupTextTpl,
                '</div>'
            ]);
        }
        
        if (typeof this.itemTpl == "string") {
            this.itemTpl = new Ext.XTemplate(this.itemTpl);
        }
    },
    
    /** private: method[initTemplates]
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        this.clearSelections(false, true);
        this.el.update("");
        
        var records = this.store.getRange();
        if (records.length < 1) {
            this.el.update(this.emptyText);
            this.all.clear();
            return;
        }
        var groupField = this.store.getSortState().field;
        var curGroup;
        var buf = [];
        for (var i=0; i < records.length; i++) {
            var r = records[i];
            var gvalue = r.data[groupField];
            // add list items for group names
            if (!curGroup || !curGroup.text ||
                curGroup.text != r.data[groupField]) {
                curGroup = {text: r.data[groupField]};
                buf[buf.length] = this.groupTpl.apply(curGroup);
            }
            buf[buf.length] = this.itemTpl.apply(r.data);
        }
        this.el.update(buf.join(''));
        this.all.fill(Ext.query(this.itemSelector, this.el.dom));
        this.updateIndexes(0);
    }
});
