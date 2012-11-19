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
 * @requires OpenLayers/Control.js
 * @include OpenLayers/Handler/Click.js
 * @include OpenLayers/Geometry/Point.js
 */
cgxp.api.Click = OpenLayers.Class(OpenLayers.Control, {

    /** api: config[protocol]
     */
    protocol: null,

    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.trigger
            }, this.handlerOptions
        );
    },

    trigger: function(e) {
        var params = this.protocol.filterToParams(e);
        if (params) {
            var response = this.protocol.read({
                params: params,
                callback: function(result) {
                    if(result.success()) {
                        if(result.features.length) {
                            var lonlat = this.map.getLonLatFromPixel(e.xy);
                            var feature = this.selectBestFeature(
                                result.features,
                                lonlat
                            );
                            this.events.triggerEvent("featureselected",
                                {feature: feature, event: e});
                        }
                    }
                },
                scope: this
            });
        }
    },

    /** private: method[selectBestFeature]
     *  :args features ``Array(OpenLayers.Feature.Vector)``
     *  :args clickPosition ``OpenLayers.LonLat``
     */
    selectBestFeature: function(features, clickPosition) {
        var point = new OpenLayers.Geometry.Point(clickPosition.lon,
            clickPosition.lat);
        var feature, resultFeature, dist;
        var minDist = Number.MAX_VALUE;
        for(var i=0; i<features.length; i++) {
            feature = features[i];
            if(feature.bounds) {
                var ll = feature.bounds.getCenterLonLat();
                var point2 = new OpenLayers.Geometry.Point(ll.lon, ll.lat);
                dist = point.distanceTo(point2);
                if(dist < minDist) {
                    minDist = dist;
                    resultFeature = feature;
                    if(minDist == 0) {
                        break;
                    }
                }
            }
        }
        return resultFeature;
    }
});
