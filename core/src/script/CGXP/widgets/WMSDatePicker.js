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
 * @include GeoExt/data/LayerRecord.js
 * @require OpenLayers/Layer.js
 * @require ExtOverrides/ExtendIeDetection.js
 */

/** api: (define)
 *  module = cgxp.datepicker
 *  class = WMSDatePicker
 */

Ext.ns("cgxp.datepicker");

cgxp.datepicker.WMSDatePicker = Ext.extend(Ext.Container, {

    /** api: config[layer]
     *  ``OpenLayers.Layer`` or ``GeoExt.data.LayerRecord``
     *  The layer this widget changes the time of. (required)
     */
    /** private: property[layer]
     *  ``OpenLayers.Layer``
     */
    layer: null,

    /** private: property[currentDates]
     *  ``Array(Number)`` The timestamps currently represented by the slider. The
     *  array has a single value in "single" mode and two values in "range" mode.
     */
    currentDates: null,

    /** api: config[dateLabelFormat]
     *  ``String`` The format to use when formatting a date
     */
    dateLabelFormat: 'd.m.Y',

    /** private: property[dateMode]
     *  ``String`` single date or date range?:
     *  * "single" displays a single date picker.
     *  * "range" displays two date pickers to select a range.
     */
    dateMode: null,

    /** api: property[datePicker1]
     *  ``Ext.form.field.Date``
     *  The first date picker.
     */
    datePicker1: null,

    /** api: property[datePicker2]
     *  ``Ext.form.field.Date``
     *  The second date picker if ``dateMode`` equals "range".
     */
    datePicker2: null,

    /** private: method[constructor]
     *  Construct the component.
     */
    constructor: function(config) {
        this.layer = this.getLayer(config.layer);
        delete config.layer;

        this.parseTime(config.wmsTime);
        delete config.wmsTime;

        cgxp.datepicker.WMSDatePicker.superclass.constructor.call(this, config);
    },

    /** private: method[parseTime]
     *  Initializes the instance from the given time information.
     *  The given time is converted to a UTC date, so that the datepicker works
     *  in UTC. The date set as layer param will also be in UTC.
     */
    parseTime: function(wmsTime) {
        this.dateMode = wmsTime.mode;

        this.minDate = this.getUTCDate(OpenLayers.Date.parse(wmsTime.minValue));
        this.maxDate = this.getUTCDate(OpenLayers.Date.parse(wmsTime.maxValue));

        this.minDefaultDate = (wmsTime.minDefValue) ?
            this.getUTCDate(OpenLayers.Date.parse(wmsTime.minDefValue)) :
            this.minDate;
        this.maxDefaultDate = (wmsTime.maxDefValue) ?
            this.getUTCDate(OpenLayers.Date.parse(wmsTime.maxDefValue)) :
            this.maxDate;
    },

    /** private: method[getUTCDate]
     */
    getUTCDate: function(localDate) {
        return new Date(
            localDate.getUTCFullYear(),
            localDate.getUTCMonth(),
            localDate.getUTCDate());
    },

    /** private: method[getLayer]
     *  :param layer: ``OpenLayers.Layer`` or :class:`GeoExt.data.LayerRecord`
     *  :return:  ``OpenLayers.Layer`` The OpenLayers layer object
     *
     *  Returns the OpenLayers layer object for a layer record or a plain layer
     *  object.
     */
    getLayer: function(layer) {
        if (layer instanceof OpenLayers.Layer) {
            return layer;
        } else if (layer instanceof GeoExt.data.LayerRecord) {
            return layer.getLayer();
        }
    },

    /** private: method[initComponent]
     *  Initialize the component.
     */
    initComponent: function() {
        this.datePicker1 = new Ext.form.DateField({
            xtype: 'datefield',
            width: 90,
            columnWidth: this.isModeRange() ? 0.5 : 1.0,
            name: 'date',
            format: this.dateLabelFormat,
            minValue: this.minDate,
            maxValue: this.maxDate,
            value: this.minDefaultDate
        });

        this.mon(this.datePicker1, 'change', function(_datePicker, newValue) {
            if (this.datePicker1.getActiveError() === '') {
                this.setMinDate(newValue);
                this.changeLayerDate();
            }
        }, this);

        this.mon(this.datePicker1, 'select', function(_datePicker, newValue) {
            this.setMinDate(newValue);
            this.changeLayerDate();
        }, this);

        var items = [this.datePicker1];

        if (this.isModeRange()) {
            this.datePicker2 = new Ext.form.DateField({
                xtype: 'datefield',
                width: 90,
                columnWidth: 0.5,
                name: 'date',
                format: this.dateLabelFormat,
                minValue: this.minDate,
                maxValue: this.maxDate,
                value: this.maxDefaultDate
            });
            items.push(this.datePicker2);

            this.mon(this.datePicker2, 'change', function(_datePicker, newValue) {
                if (this.datePicker2.getActiveError() === '') {
                    this.setMaxDate(newValue);
                    this.changeLayerDate();
                }
            }, this);

            this.mon(this.datePicker2, 'select', function(_datePicker, newValue) {
                this.setMaxDate(newValue);
                this.changeLayerDate();
            }, this);
        }

        Ext.apply(this, {
            layout: 'column',
            items: items
        });

        this.currentDates = [];
        this.changeLayerDate();

        cgxp.datepicker.WMSDatePicker.superclass.initComponent.call(this);
    },

    /** private: method[changeLayerDate]
     *
     *  Updates the ``OpenLayers.Layer`` time parameter.
     */
    changeLayerDate: function() {
        var dates = this.getValues();

        if (this.datesHaveChanged(dates)) {
            this.currentDates = dates;
            var timeValue = this.formatLayerDateValue(dates[0]);
            if (this.dateMode === "range") {
                timeValue += '/' + this.formatLayerDateValue(dates[1]);
            }
            this.layer.mergeNewParams({"TIME": timeValue});
        }
    },

    /** private: method[getValues]
     */
    getValues: function() {
        var dates = [this.datePicker1.getValue()];
        if (this.isModeRange()) {
            dates.push(this.datePicker2.getValue());
        }
        return dates;
    },

    /** private: method[getValues]
     */
    datesHaveChanged: function(dates) {
        if (this.currentDates.length === 1 && dates.length === 1) {
            return this.currentDates[0].getTime() !== dates[0].getTime();
        } else if (this.currentDates.length === 2 && dates.length === 2) {
            return this.currentDates[0].getTime() !== dates[0].getTime() ||
                this.currentDates[1].getTime() !== dates[1].getTime();
        }
        return true;
    },

    /** private: method[formatLayerDateValue]
     *  :param time: ``Number`` Timestamp
     *
     *  Returns the formatted date value to pass to the layer.
     */
    formatLayerDateValue: function(date) {
        return date.getFullYear() +
            "-" + OpenLayers.Number.zeroPad(date.getMonth() + 1, 2) +
            "-" + OpenLayers.Number.zeroPad(date.getDate(), 2);
    },

    /** private: method[setMinDate]
     */
    setMinDate: function(minDate) {
        if (this.isModeRange()) {
            this.datePicker2.setMinValue(minDate);
        }
    },

    /** private: method[setMaxDate]
     */
    setMaxDate: function(maxDate) {
        if (this.isModeRange()) {
            this.datePicker1.setMaxValue(maxDate);
        }
    },

    /** api: method[isModeRange]
     *  If in "range" mode?
     */
    isModeRange: function() {
        return this.dateMode === 'range';
    }
});

Ext.reg("cgxp_wmsdatepicker", cgxp.datepicker.WMSDatePicker);
