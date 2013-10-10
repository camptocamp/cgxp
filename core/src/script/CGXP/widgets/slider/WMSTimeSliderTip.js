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

/**
 * @requires GeoExt/widgets/tips/SliderTip.js
 */

Ext.namespace("cgxp.slider");

/** api: constructor
 *  .. class:: WMSTimeSliderTip(config)
 *
 *      Create a slider tip displaying :class:`cgxp.slider.WMSTimeSlider` values.
 */
cgxp.slider.WMSTimeSliderTip = Ext.extend(GeoExt.SliderTip, {

    /** api: config[template]
     *  ``String``
     *  Template for the tip. Can be customized using the following keywords in
     *  curly braces:
     *
     *  * ``time`` - the layer time
     */
    template: '<div>{time}</div>',

    /** private: property[compiledTemplate]
     *  ``Ext.Template``
     *  The template compiled from the ``template`` string on init.
     */
    compiledTemplate: null,

    /** private: method[init]
     *  Called to initialize the plugin.
     */
    init: function(slider) {
        this.compiledTemplate = new Ext.Template(this.template);
        cgxp.slider.WMSTimeSliderTip.superclass.init.call(this, slider);
    },

    /** private: method[getText]
     *  :param thumb: ``Ext.slider.Thumb`` The thumb this tip is attached to.
     */
    getText: function(thumb) {
        var slider = thumb.slider;
        var value = thumb.slider.timeValues
            ? slider.getClosestValue(thumb.value)
            : thumb.value;

        return this.compiledTemplate.apply({
            time: slider.formatLayerTimeLabel(new Date(value))
        });
    }
});
