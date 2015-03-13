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

/**
 * @include OpenLayers/Util/AutoProjection.js
 */

/** api: (define)
 *  module = cgxp
 *  class = FullTextSearch
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: FullTextSearch(config)
 */
cgxp.FullTextSearch = Ext.extend(Ext.Panel, {

    /* api: xtype = cgxp_fulltextsearch */
    xtype: 'cgxp_fulltextsearch',

    /** api: config[tooltipTitle]
     *  ``String`` Text for the tooltip title (i18n). Only applies if
     *  :attr:`tooltip` is ``true``.
     */
    tooltipTitle: "Search",

    /** api: config[tooltipEl]
     *  ``String`` Optional id of an element to place the tooltip in.
     *  Default is ``search-tip``
     */
    tooltipEl: "search-tip",

    /** api: config[emptyText]
     *  ``String`` Text to use when the field is empty (i18n).
     */
    emptyText: "Search...",
    /** api: config[loadingText]
     *  ``String`` Text to display while loading results (i18n).
     */
    loadingText: "Searching...",

    /** api: config[tooltip]
     *  ``Boolean`` Whether to display a tooltip above the search box.
     *  Default is ``true``.
     */
    tooltip: true,

    /** api: config[comboWidth]
     *  ``Number`` Width in pixels of the search combobox.
     *  Default is 200.
     */
    comboWidth: 200,

    /** api: config[tooltipDuration]
     *  ``Number`` Duration in milliseconds after which the tooltip is hidden.
     *  Default is 15000.
     */
    tooltipDuration: 15000,

    /** api: config[tooltipWidth]
     *  ``Number`` Width in pixels of the tooltip window.
     *  Default is 500.
     */
    tooltipWidth: 500,

    /** api: config[grouping]
     *  ``Boolean``
     *  Tells whether to group the results by ``layer_name``. If set to ``true``,
     *  the data returned by the service is intended to include such a field.
     *  If set to ``true``, ``Ext/ux/form/GroupComboBox.js`` needs to be
     *  included as part of the built file if any.
     *  Defaults to ``false``.
     */
    grouping: false,

    /** api: config[limits]
     *  ``Object`` Option object to configure search
     *  limit parameters sent to the text search
     *  service. The possible properties are:
     *
     *  * ``limit`` - ``Number`` The maximum number of
     *    results in the response.
     *  * ``partitionlimit`` - ``Number`` The maximum number
     *    of results per layer/group in the response.
     *
     *  ``partitionlimit`` is typically used when the ``grouping``
     *  option is to ``true``, to limit the number of
     *  results in each group.
     *
     *  If the ``limits`` option is unspecified the limit
     *  parameters sent in search requests depend whether
     *  ``grouping`` is ``true`` or ``false``:
     *
     *  * If ``grouping`` is ``false`` then ``limit`` is set to ``20``,
     *    and ``partitionlimit`` is not set.
     *  * If ``grouping`` is ``true`` then ``limit`` is set to ``40``,
     *    and ``partitionlimit`` is set to ``10``.
     *
     *  Any provided ``limits`` object is *applied* to the
     *  default values. For example, if ``grouping`` is
     *  ``true`` and if the ``limits`` option is set to
     *  ``{limit: 50}`` then ``limit`` will be set to ``50`` and
     *  ``partitionlimit`` will be set to ``10`` in search requests.
     */
    limits: {},

    /** private: method[initComponent]
     */
    initComponent: function() {
        Ext.apply(this, {
          layout: 'hbox',
          width: this.comboWidth,
          items: [this.createCombo()],
          unstyled: true
        });
        cgxp.FullTextSearch.superclass.initComponent.call(this);

        // define projections that may be used for coordinates recentering
        this.autoProjection = new OpenLayers.AutoProjection(this);
    },

    createStore: function() {
        var baseParams = Ext.apply(this.grouping ?
                { limit: 40, partitionlimit: 10 } :
                { limit: 20 }, this.limits);
        var store = new GeoExt.data.FeatureStore({
            proxy: new Ext.data.ScriptTagProxy({
                url: this.url,
                callbackParam: 'callback'
            }),
            baseParams: baseParams,
            reader: new cgxp.data.FeatureReader({
                format: new OpenLayers.Format.GeoJSON()
            }, ['label', 'layer_name']),
            sortInfo: this.grouping ? {field: 'layer_name', direction: 'ASC'} : null
        });

        store.on('beforeload', function(store, options) {
            var coords = store.baseParams.query.match(
                /([\d\.']+)[\s,]+([\d\.']+)/
            );
            this.position = null;
            if (coords) {
                var map = this.map;
                var left = parseFloat(coords[1].replace("'", ""));
                var right = parseFloat(coords[2].replace("'", ""));

                this.position = this.autoProjection.tryProjection([left, right]); 
                if (this.position === null) {
                    this.position = this.autoProjection.tryProjection([right, left]);
                }
                if (this.position) {
                    this.closeLoading.cancel();
                    // close the loading twin box.
                    this.closeLoading.delay(10);
                    this.fireEvent('applyposition', this.position);
                    return false;
                }
            }
            return true;
        }, this);
        return store;
    },

    /** private: method[createCombo]
     *
     *  :returns ``Ext.form.ComboBox`` The search combo.
     */
    createCombo: function() {
        var tpl = new Ext.XTemplate(
            '<tpl for="."><div class="x-combo-list-item">',
            '{label}',
            '</div></tpl>'
        );
        var comboClass = this.grouping ?
            Ext.ux.form.GroupComboBox : Ext.ux.form.TwinTriggerComboBox;
        var combo = new comboClass(Ext.apply({
            store: this.createStore(),
            tpl: tpl,
            minChars: 1,
            queryDelay: 50,
            emptyText: this.emptyText,
            loadingText: this.loadingText,
            displayField: 'label',
            triggerAction: 'all',
            trigger2Class: 'x-form-trigger-no-width x-hidden',
            trigger3Class: 'x-form-trigger-no-width x-hidden',
            width: this.comboWidth,
            selectOnFocus: true
        }, this.actionConfig));

        // used to close the loading panel
        this.closeLoading = new Ext.util.DelayedTask(function () {
            combo.list.hide();
        }, this);
        combo.on({
            'select': function(combo, record, index) {
              this.fireEvent('select', combo, record, index);
            },
            'clear': function(combo) {
              this.fireEvent('clear', combo);
            },
            'specialkey': function(combo, event) {
              if (this.position && event.getKey() == event.ENTER) {
                this.fireEvent('specialkey', combo, event);
              };
            },
            'render': function(component) {
                if (this.tooltip) {
                    new Ext.ToolTip({
                        target: combo.getEl(),
                        title: this.tooltipTitle,
                        contentEl: this.tooltipEl,
                        width: this.tooltipWidth,
                        trackMouse: true,
                        dismissDelay: this.tooltipDuration
                    });
                }
                function stop(e) {
                    var event = e || window.event;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else {
                        event.cancelBubble = true;
                    }
                }
                component.getEl().dom.onkeydown = stop;
                this.fireEvent('render', component);
            },
            scope: this
        });
        return combo;
    }
});

/** api: xtype = cgxp_fulltextsearch */
Ext.reg(cgxp.FullTextSearch.prototype.xtype, cgxp.FullTextSearch);
