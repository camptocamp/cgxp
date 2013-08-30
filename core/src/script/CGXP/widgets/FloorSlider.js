/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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

/** api: (define)
 *  module = cgxp
 *  class = FloorSlider
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: FloorSlider(config)
 */
cgxp.FloorSlider = Ext.extend(Ext.Window, {

    /* api: xtype = cgxp_floorslider */
    xtype: 'cgxp_floorslider',

    /** api: config[minValue]
     *  ``Number``
     *  The fist floor value.
     */

    /** api: config[maxValue]
     *  ``Number``
     *  The max floor value.
     */

    /** api: config[maxIsSky]
     *  ``Boolean``
     *  Max value mean all floor, default is true.
     */

    /** api: config[stateId]
     *  ``String``
     *  Used for the permalink.
     */
    stateId: 'floor',

    /** api: config[mapPanel]
     *  ``GeoExt.MapPanel``
     *  The map panel.
     */
    mapPanel: null,

    /** api: config[anchorPosition]
     *  ``String``
     *  The anchor position, default to 'tl-tl'.
     */
    anchorPosition: 'tl-tl',

    /** api: config[anchorOffsets]
     *  ``Array(Number)``
     *  The offsets from the anchor, default to [45, 10].
     */
    anchorOffsets: [45, 10],

    /** api: config[skyText]
     *  ``String``
     *  L10n text for the sky, only used if ``maxIsSky`` is ``true``.
     */
    skyText: 'Sky',

    /** api: config[floorText]
     *  ``String``
     *  L10n text for the window title.
     */
    floorText: 'Floor',

    /** private: method[constructor]
     */
    constructor: function(config) {
        var ul = document.createElement('ul');
        for (var i = config.maxValue; i >= config.minValue; i--) {
            var li = Ext.DomHelper.append(ul, {
                tag: 'li'
            }, true);
            var a = Ext.DomHelper.append(li, {
                tag: 'a',
                'href': 'javascript:',
                html: config.maxIsSky && i == config.maxValue ?
                        this.skyText : i.toString()
            }, true);
            a.on({
                click: (function(value) {
                    this.slider.setValue(value);
                }).createDelegate(this, [i])
            });
        }

        this.slider = new Ext.slider.SingleSlider({
            increment: 1,
            vertical: true,
            value: config.value,
            minValue: config.minValue,
            maxValue: config.maxValue,
            clickToChange: false,
            height: (config.maxValue - config.minValue + 1) * 13
        });
        config = config || {};
        config = Ext.apply({
            border: false,
            closable: false,
            resizable: false,
            draggable: false,
            title: this.floorText,
            layout: 'hbox',
            cls: 'floor-window',
            items: [this.slider,
                {
                    cls: 'floorlabelscontainer',
                    border: false,
                    contentEl: ul
                }
            ]
        }, config);
        cgxp.FloorSlider.superclass.constructor.call(this, config);

        if (this.maxIsSky && cgxp.plugins.Print) {
            var self = this;
            cgxp.plugins.Print.prototype.paramRenderer['floor'] = 
                function(value) {
                    return value === null ? self.skyText : value;
                }
        }

        this.show();
        this.anchorTo.defer(100, this, [this.mapPanel.body,
                this.anchorPosition, this.anchorOffsets]);
    },

    /** private: method[initComponent]
     */
    initComponent: function() {
        cgxp.FloorSlider.superclass.initComponent.call(this);

        this.slider.on('change', function() {
            var value = this.slider.getValue();
            var floor = this.maxIsSky && value == this.maxValue ? null : value;
            this.mapPanel.setParams({ 'floor': floor })
        }, this);
        this.mapPanel.on('paramschange', function(params) {
            if ('floor' in params) {
                floor = params['floor'];
                if (this.maxIsSky && floor === null) {
                    floor = this.maxValue;
                }
                this.slider.setValue(floor);
            }
        }, this);
        if ('floor' in this.mapPanel.params) {
            this.slider.setValue(parseInt(this.mapPanel.params['floor']));
        }
        else {
            this.mapPanel.setParams({ 'floor': null })
        }
    }
});

/** api: xtype = cgxp_floorslider */
Ext.reg(cgxp.FloorSlider.prototype.xtype, cgxp.FloorSlider);
