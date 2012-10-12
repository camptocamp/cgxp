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

/*
 * @require GeoExt/widgets/ZoomSlider.js
 */

/** api: (define)
 *  module = cgxp
 *  class = StageSlider
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: StageSlider(config)
 */
cgxp.StageSlider = Ext.extend(Ext.Window, {

    /* api: xtype = cgxp_stageslider */
    xtype: 'cgxp_stageslider',

    /** api: config[minValue]
     *  ``int``
     *  The fist stage value.
     */

    /** api: config[maxValue]
     *  ``int``
     *  The max stage value.
     */

    /** api: config[maxMeanAll]
     *  ``Boolean``
     *  Max value mean all stage, default is true.
     */

    /** api: config[stateId]
     *  ``String``
     *  Used for the permalink.
     */
    stateId: 'stage',

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
     *  ``Array[int]``
     *  The offsets from the anchor, default to [45, 10].
     */    
    anchorOffsets: [45, 10],

    /** private: property[stateEvents]
     *  ``Array(String)``
     *  Array of state events
     */
    stateEvents: ['stagechange'],

    /** public: config[sky_text] 
     *  ``String``
     *  l10n 
     */
    sky_text: 'Sky',

    /** public: config[level_text] 
     *  ``String``
     *  l10n 
     */
    level_text: 'Level',

    /**
     * private: method[constructor]
     */
    constructor: function(config) {
        var ul = document.createElement('ul');
        for (var i = config.maxValue; i >= config.minValue; i--) {
            var li = Ext.DomHelper.append(ul, {
                tag: 'li',
                html: config.maxMeanAll && i == config.maxValue ? 
                        this.sky_text : i.toString()
            }, true);
            li.on({
                click: (function(i) {
                    this.setStage(i);
                    this.slider.setValue(i);
                }).createDelegate(this, [i])
            });
        }

        this.slider = new Ext.slider.SingleSlider({
            increment: 1,
            vertical: true,
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
            title: this.level_text,
            layout: 'hbox',
            cls: 'stage-window',
            items: [this.slider,
                {
                    cls: 'stagelabelscontainer',
                    border: false,
                    contentEl: ul
                }
            ]
        }, config);
        cgxp.StageSlider.superclass.constructor.call(this, config);

        this.show();
        this.anchorTo.defer(100, this, [this.mapPanel.body, 
                this.anchorPosition, this.anchorOffsets]);
    },

    /**
     * private: method[initComponent]
     * Creates the map toolbar.
     *
     * Returns:
     * {Ext.Toolbar} The toolbar.
     */
    initComponent: function() {
        cgxp.StageSlider.superclass.initComponent.call(this);
        this.addEvents(
            /** private: event[stagechange]
             * Throws when the stage change.
             */
            'stagechange'
        );

        this.slider.on('change', function() {
            this.fireEvent('stagechange');
            var value = this.slider.getValue();
            this.setStage(this.maxMeanAll && value == this.maxValue ?
                    undefined : value);
        }, this);
    },

    /**
     * Method: setStage
     * Change the stage,
     */
    setStage: function(stage) {
        Ext.each(this.mapPanel.map.layers, function(layer) {
            if (layer.setStage) {
                layer.setStage(stage);
                layer.redraw();
            }
            else if (layer.params) { // WMS or WMTS
                if (stage !== undefined) {
                    layer.params.STAGE = stage;
                }
                else {
                    delete layer.params.STAGE;
                }
                layer.redraw();
            }
        }, this);
    },

    /** private: method[saveState]
     */
    getState: function() {
        return {
            val: this.slider.getValue()
        };
    },

    /** private: method[applyState]
     */
    applyState: function(state) {
        if (state.val) {
            var stage = parseInt(state.val);
            this.setValue(stage);
            this.setStage(stage);
        }
    }
});

/** api: xtype = cgxp_stageslider */
Ext.reg(cgxp.StageSlider.prototype.xtype, cgxp.StageSlider);
