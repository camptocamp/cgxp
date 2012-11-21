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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @requires FeatureEditing/ux/widgets/form/RedLiningPanel.js
 * @requires OpenLayers/Format/URLCompressed.js
 */

/** api: (define)
 * module = cgxp.widgets
 * class = RedLiningPanel
 */

Ext.namespace("cgxp.widgets");

/** api: constructor
 *  .. class:: RedLiningPanel(config)
 *
 *  Add a state to store the geometry in URL
 */
cgxp.RedLiningPanel = Ext.extend(
        GeoExt.ux.form.RedLiningPanel, {

    /** api: config[stateId]
     *  Used to generate the permalink.
     */

    /** private: property[stateEvents]
     * ``Array(String)``
     * Array of state events
     */
    stateEvents: ['featuresadded', 'featuremodified', 'featuresremoved'],

    /** private: attrivute[urlCompressed]
     *  The used format to create geom in permalink
     */
    urlCompressed: new OpenLayers.Format.URLCompressed({
        attributes: {
            point: {},
            line: {},
            polygon: {}
        },
        accuracy: 0.1,
        styleAttributes: {
            point: {
                'pointRadius': parseFloat,
                'fillColor': true,
                'strokeColor': true,
                'fontColor': true,
                'graphic': function(val) { return val == 'true' },
                'label': true
            },
            line: {
                'strokeColor': true,
                'strokeWidth': parseFloat
            },
            polygon: {
                'fillColor': true,
                'strokeColor': true,
                'strokeWidth': parseFloat
            }
        }
    }),

    /** private: method[initComponent]
     */
    initComponent: function() {
        cgxp.RedLiningPanel.superclass.initComponent.apply(this, arguments);
        this.addEvents(
            /** private: event[featuresadded]
             *  Throws new object is drawed.
             */
            'featuresadded',

            /** private: event[featuremodified]
             *  Throws when some objects are modified.
             */
            'featuremodified',

            /** private: event[featuresremoved]
             *  Throws when some objects are removed.
             */
            'featuresremoved'
        );
        this.controler.activeLayer.events.on({
            'featuresadded': function(e) {
                this.fireEvent('featuresadded', e);
            },
            'featuremodified': function(e) {
                this.fireEvent('featuremodified', e);
            },
            'featuresremoved': function(e) {
                this.fireEvent('featuresremoved', e);
            },
            scope: this
        });
    },

    /** private: method[saveState]
     */
    getState: function() {
        return {
            features: this.urlCompressed.write(this.controler.activeLayer.features)
        }
    },

    /** private: method[applyState]
     */
    applyState: function(state) {
        if (state.features) {
            var features = this.urlCompressed.read(state.features);
            Ext.each(features, function(feature) {
                var style = feature.style;
                this.controler.activeLayer.addFeatures([feature]);
                Ext.apply(feature.style, style);
                this.controler.activeLayer.drawFeature(feature)
            }, this);
        }
    }
});
