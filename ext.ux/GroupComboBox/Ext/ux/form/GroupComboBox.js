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
 * @include Ext/ux/form/TwinTriggerComboBox.js
 * @include Ext/ux/form/GroupingView.js
 */
Ext.ux.form.GroupComboBox = Ext.extend(Ext.ux.form.TwinTriggerComboBox, {

    /** private: method[initList]
     */
    initList: function() {
        // check if list will be initialized by superclass initList
        var initList = false;
        if (!this.list) {
            initList = true;
        }

        Ext.ux.form.GroupComboBox.superclass.initList.call(this);

        // if list was just initialized, view class has to be changed
        if (initList) {
            var cls = 'x-combo-list';

            // view is changed to a grouping one @see GroupingView.js
            this.view = new Ext.ux.form.GroupingView({
                applyTo: this.innerList,
                itemTpl: this.tpl,
                singleSelect: true,
                selectedClass: this.selectedClass,
                itemSelector: this.itemSelector || '.' + cls + '-item'
            });

            this.bindStore(this.store, true);
        }
    }
});
