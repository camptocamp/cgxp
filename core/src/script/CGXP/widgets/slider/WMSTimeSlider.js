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
 * @include CGXP/tools/tools.js
 * @require OpenLayers/Layer.js
 */

/** api: (define)
 *  module = cgxp.slider
 *  class = WMSTimeSlider
 */

Ext.ns("cgxp.slider");

cgxp.slider.WMSTimeSlider = Ext.extend(Ext.slider.MultiSlider, {

    /** api: config[layer]
     *  ``OpenLayers.Layer`` or ``GeoExt.data.LayerRecord``
     *  The layer this slider changes the time of. (required)
     */
    /** private: property[layer]
     *  ``OpenLayers.Layer``
     */
    layer: null,

    /** api: config[delay]
     *  ``Number`` Time in milliseconds before setting the time value to the
     *  layer. If the value change again within that time, the original value
     *  is not set. Only applicable if aggressive is true.
     */
    delay: 5,

    /** api: config[aggressive]
     *  ``Boolean``
     *  If set to true, the time parameter is changed as soon as the thumb is moved.
     *  Otherwise when the thumb is released (default).
     */
    aggressive: false,

    /** private: property[currentTimes]
     *  ``Array(Number)`` The timestamps currently represented by the slider. The
     *  array has a single value in "single" mode and two values in "range" mode.
     */
    currentTimes: null,

    /** private: property[timeValues]
     *  ``Array`` The list of the possible time values.
     */
    timeValues: null,

    /** private: property[timeInterval]
     *  ``Array`` The time interval between each value as an array of:
     *  * years,
     *  * months,
     *  * days,
     *  * seconds
     */
    timeInterval: null,

    /** api: config[dateLabelFormat]
     *  ``String`` The format to use when formatting a label
     */
    dateLabelFormat: 'Y-m-d H:i:s',

    /** private: property[resolution]
     *  ``String`` The date resolution, one of
     *  * "year",
     *  * "month",
     *  * "day",
     *  * "second"
     */
    resolution: null,

    /** private: property[timeMode]
     *  ``String`` how to handle the time:
     *  * "value" display a single thumb
     *  * "range" display two thumbs
     */
    timeMode: null,

    /** private: method[constructor]
     *  Construct the component.
     */
    constructor: function(config) {
        this.layer = this.getLayer(config.layer);
        delete config.layer;

        var sliderConfig = this.parseTime(config.wmsTime);
        delete config.wmsTime;
        Ext.apply(config, sliderConfig);

        cgxp.slider.WMSTimeSlider.superclass.constructor.call(this, config);
    },

    /** private: method[parseTime]
     *  Initializes the instance from the given time information.
     *  Returns the underlying slider configuration.
     */
    parseTime: function(wmsTime) {
        this.resolution = wmsTime.resolution;
        this.timeMode = wmsTime.mode;

        var minDate = OpenLayers.Date.parse(wmsTime.minValue);
        var maxDate = OpenLayers.Date.parse(wmsTime.maxValue);

        var minDefaultDate = (wmsTime.minDefValue) ?
            OpenLayers.Date.parse(wmsTime.minDefValue) : minDate;
        var maxDefaultDate = (wmsTime.maxDefValue) ?
            OpenLayers.Date.parse(wmsTime.maxDefValue) : maxDate;

        var defaultValues = (this.timeMode == "range") ?
            [minDefaultDate.getTime(), maxDefaultDate.getTime()] :
            [minDefaultDate.getTime()];

        if (wmsTime.values) {
            this.timeValues = [];
            Ext.each(
                wmsTime.values,
                function(date) {
                    this.timeValues.push(OpenLayers.Date.parse(date).getTime());
                },
                this
            );
        } else {
            var maxNbValues = 1024;
            var endDate = minDate
                .add(Date.YEAR, maxNbValues * wmsTime.interval[0])
                .add(Date.MONTH, maxNbValues * wmsTime.interval[1])
                .add(Date.DAY, maxNbValues * wmsTime.interval[2])
                .add(Date.SECOND, maxNbValues * wmsTime.interval[3]);

            if (endDate > maxDate) {
                // Transform interval to a list of values when the number
                // of values is below a threshold (maxNbValues)
                this.timeValues = [];
                for (var i = 0;; i++) {
                    var nextDate = minDate
                        .add(Date.YEAR, i * wmsTime.interval[0])
                        .add(Date.MONTH, i * wmsTime.interval[1])
                        .add(Date.DAY, i * wmsTime.interval[2])
                        .add(Date.SECOND, i * wmsTime.interval[3]);
                    if (nextDate <= maxDate) {
                        this.timeValues.push(nextDate.getTime());
                    } else {
                        break;
                    }
                }
            } else {
                // Use interval when there would be too many values
                this.timeInterval = wmsTime.interval;
            }
        }

        return {
            minValue: minDate.getTime(),
            maxValue: maxDate.getTime(),
            values: defaultValues
        };
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
        cgxp.slider.WMSTimeSlider.superclass.initComponent.call(this);

        if (this.aggressive === true) {
            this.on("change", this.changeLayerTime, this, {buffer: this.delay});
        } else {
            this.on("changecomplete", this.changeLayerTime, this);
        }

        this.on("beforedestroy", this.unbind, this);

        this.currentTimes = [];
        this.changeLayerTime();
    },

    /** private: method[changeLayerTime]
     *
     *  Updates the ``OpenLayers.Layer`` time parameter.
     */
    changeLayerTime: function() {
        var times = this.getValues();

        for (var i = times.length - 1; i >= 0; --i) {
            times[i] = this.getClosestValue(times[i]);
        }

        if (!this.compareArrays(times, this.currentTimes)) {
            this.currentTimes = times;
            var timeValue = this.formatLayerTimeValue(times[0]);
            if (this.timeMode == "range") {
                timeValue += '/' + this.formatLayerTimeValue(times[1]);
            }
            this.layer.mergeNewParams({"TIME": timeValue});
        }
    },

    /** private: method[compareArrays]
     *  :param a: ``Array``
     *  :param b: ``Array``
     *
     *  Returns whether the 2 arrays contain the same elements (shallow comparison)
     */
    compareArrays: function(a, b) {
        var l = a.length;
        if (l != b.length) {
            return false;
        }
        while (l--) {
            if (a[l] !== b[l]) {
                return false;
            }
        }
        return true;
    },

    /** api: method[formatLayerTimeValue]
     *  :param time: ``Number`` Timestamp
     *
     *  Returns the time value to pass to the layer formatted according
     *  to ``this.resolution``
     */
    formatLayerTimeValue: function(time) {
        var date = new Date(time);
        switch (this.resolution) {
            case 'year':
                return date.getUTCFullYear();

            case 'month':
                return date.getUTCFullYear()
                    + '-' + OpenLayers.Number.zeroPad(date.getUTCMonth() + 1, 2);

            case 'day':
                return date.getUTCFullYear()
                    + '-' + OpenLayers.Number.zeroPad(date.getUTCMonth() + 1, 2)
                    + '-' + OpenLayers.Number.zeroPad(date.getUTCDate(), 2);

            case 'second':
            default:
                return OpenLayers.Date.toISOString(date);
        }
    },

    /** api: method[formatLayerTimeLabel]
     *  :param date: ``Date``
     */
    formatLayerTimeLabel: function(date) {
        return cgxp.tools.formatDate(date, this.dateLabelFormat);
    },

    /** private: method[doSnap]
     *  :param value: ``Number`` A timestamp
     *
     *  Returns the nearest time stop.
     */
    doSnap: function(value) {
        // The value is snapped only when a list of values exists
        if (this.timeValues) {
            return this.getClosestValue(value);
        } else {
            return value;
        }
    },

    /** api: method[getClosestValue]
     * :param timestamp: ``Number`` A timestamp
     * :return: ``Number`` The closest value known by the underlying server
     */
    getClosestValue: function(timestamp) {
        if (timestamp <= this.minValue) {
            return this.minValue;
        }

        if (timestamp >= this.maxValue) {
            return this.maxValue;
        }

        if (this.timeValues !== null) {
            // Time stops are defined as a list of values
            var idx;
            var lIdx = 0;
            var rIdx = this.timeValues.length - 1;

            while ((rIdx - lIdx) > 1) {
                idx = Math.floor((lIdx + rIdx) / 2);
                if (this.timeValues[idx] >= timestamp) {
                    rIdx = idx;
                } else {
                    lIdx = idx;
                }
            }

            var lDist = Math.abs(this.timeValues[lIdx] - timestamp);
            var rDist = Math.abs(this.timeValues[rIdx] - timestamp);

            return lDist < rDist
                ? this.timeValues[lIdx]
                : this.timeValues[rIdx];
        } else {
            // Time stops are defined by a start date plus an interval
            var targetDate = new Date(timestamp);
            var startDate = new Date(this.minValue);
            var bestDate = new Date(this.minValue);
            var maxDate = new Date(this.maxValue);
            var bestDistance = Math.abs(targetDate - bestDate);

            for (var i = 1;; i++) {
                // The start date should always be used as a reference
                // because adding a month twice could differ from adding
                // two months at once
                var next = startDate
                    .add(Date.YEAR, i * this.timeInterval[0])
                    .add(Date.MONTH, i *  this.timeInterval[1])
                    .add(Date.DAY, i * this.timeInterval[2])
                    .add(Date.SECOND, i * this.timeInterval[3]);

                if (next > maxDate) {
                    break;
                }

                var distance = Math.abs(targetDate - next);
                if (distance <= bestDistance) {
                    bestDate = next;
                    bestDistance = distance;
                } else {
                    break;
                }
            }

            return bestDate.getTime();
        }
    }
});

Ext.reg("cgxp_wmstimeslider", cgxp.slider.WMSTimeSlider);
