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

    /** api: config[floors]
     * ``Array``
     * The optional list of floor names (will be computed if not provided)
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

    /** api: config[initialFloor]
     *  ``Number``
     *  The initial floor, default to 0.
     */
    initialFloor: 0,

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
        floorMap = this.generateFloorMap(config);
        var ul = document.createElement('ul');
        for (var i = config.maxValue; i >= config.minValue; i--) {
            var li = Ext.DomHelper.append(ul, {
                tag: 'li'
            }, true);
            var a = Ext.DomHelper.append(li, {
                tag: 'a',
                'href': 'javascript:',
                html: floorMap[i]
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
            value: this.floor2pos(config.value),
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
            cgxp.plugins.Print.prototype.paramRenderer.floor =
                function(value) {
                    return value === null ? self.skyText : value;
                };
        }

        this.show();
        this.mapPanel.addListener('bodyresize', function() {
            this.anchorTo(this.mapPanel.body,
                    this.anchorPosition, this.anchorOffsets);
        }, this);
        this.anchorTo.defer(100, this, [this.mapPanel.body,
                this.anchorPosition, this.anchorOffsets]);
    },

    /** private: method[generateFloorMap]
    */
    generateFloorMap: function(config) {
        var floorMap = {};
        if (!config.floors) {
            //floors not provided => compute them
            for (var i = config.minValue; i <= config.maxValue; ++i) {
                if (i == config.maxValue && config.maxIsSky) {
                    floorMap[i] = this.skyText;
                } else {
                    floorMap[i] = i.toString();
                }
            }
        } else {
            //floors provided => compute min/max
            config.minValue = 0;
            config.maxValue = config.floors.length - 1;
            for(var j = 0; j <= config.maxValue; ++j) {
                floorMap[j] = config.floors[j];
            }
        }
        return floorMap;
    },

    /** private: method[pos2floor]
     */
    pos2floor: function(pos) {
        if (this.maxIsSky && pos == this.maxValue) {
            return null;
        }
        if (this.floors) {
            return this.floors[pos];
        } else {
            return pos;
        }
    },

    /** private: method[floor2pos]
     */
    floor2pos: function(floor) {
        if (this.maxIsSky && floor === null) {
            return this.maxValue;
        }
        if (this.floors) {
            for (var pos = 0; pos < this.floors.length; ++pos) {
                if (this.floors[pos] == floor) {
                    return pos;
                }
            }
            throw "Invalid floor value";
        } else {
            return floor;
        }
    },

    /** private: method[initComponent]
     */
    initComponent: function() {
        cgxp.FloorSlider.superclass.initComponent.call(this);

        this.slider.on('change', function() {
            var value = this.slider.getValue();
            var floor = this.pos2floor(value);
            this.mapPanel.setParams({ 'floor': floor });
        }, this);
        this.mapPanel.on('paramschange', function(params) {
            if (params.floor !== undefined) {
                this.slider.setValue(this.floor2pos(params.floor));
            }
        }, this);
        if (this.mapPanel.params.floor === undefined) {
            this.mapPanel.setParams({ 'floor': this.initialFloor });
        }
    }
});

/** api: xtype = cgxp_floorslider */
Ext.reg(cgxp.FloorSlider.prototype.xtype, cgxp.FloorSlider);
