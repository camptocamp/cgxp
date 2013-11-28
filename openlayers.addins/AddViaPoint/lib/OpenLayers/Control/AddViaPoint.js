/**
 * Copyright (c) 2013 by Camptocamp SA
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
 * @include OpenLayers/Geometry/Point.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Handler/Hover.js
 * @include OpenLayers/Handler/Drag.js
 */

OpenLayers.Control.AddViaPoint = OpenLayers.Class(OpenLayers.Control, {

    vertexStyleConfig: {
        graphicName: 'circle',
        pointRadius: 5,
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeColor: '#000000',
        fillOpacity: 1,
        fillColor: '#ffffff'
    },

    geometryTypes: 'OpenLayers.Geometry.LineString',

    tolerance: 5,

    EVENT_TYPES: ['startviapoint', 'moveviapoint', 'endviapoint'],

    initialize: function(layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layer = layer;
        this.handler = new OpenLayers.Handler.Hover(this, {
            move: this.onMouseMove
        });

        this.dragHandler = new OpenLayers.Handler.Drag(this, {
            down: this.dragDown,
            move: this.dragMove,
            done: this.dragDone
        });
        this.vertexStyle = OpenLayers.Util.applyDefaults(this.vertexStyleConfig, OpenLayers.Feature.Vector.style['default']);
    },

    dragDown: function dragDown(pixel) {
        var feature = this.layer.getFeatureFromEvent(this.dragHandler.evt);
        if (feature && feature == this.virtualVertex) {
            this.events.triggerEvent('startviapoint', {feature: this.virtualVertex});
            this.handler.deactivate();
            this.isDragging = true;
        }
    },

    dragMove: function dragMove(pixel) {
        if (this.isDragging) {
            var pos = this.map.getLonLatFromViewPortPx(pixel);
            var geom = this.virtualVertex.geometry;
            geom.move(pos.lon-geom.x, pos.lat-geom.y);
            this.layer.drawFeature(this.virtualVertex);
            this.events.triggerEvent('moveviapoint', {feature: this.virtualVertex});
        }
    },

    dragDone: function dragDone() {
        if (this.isDragging) {
            this.isDragging = false;
            this.events.triggerEvent('endviapoint', {feature: this.virtualVertex});
            this.virtualVertex = null;
            this.handler.activate();
        }
    },

    onMouseMove: function(evt) {
        var lonLat = this.map.getLonLatFromViewPortPx(evt.xy);
        var mousePoint = new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat);
        var dist = this.tolerance * this.map.resolution;
        var n = this.layer.features.length;
        var closestPoint;
        var result;
        var i;
        var feature;

        for (i=0;i<n;i++) {
            feature = this.layer.features[i];
            if (this.geometryTypeMatches(feature)) {
                closestPoint = this.findClosestOnFeature(mousePoint, feature, dist);
                if (closestPoint) {
                    if (this.virtualVertex) {
                        this.virtualVertex.geometry.x = closestPoint.x;
                        this.virtualVertex.geometry.y = closestPoint.y;
                        if (!this.virtualVertex.layer) {
                            this.layer.addFeatures([this.virtualVertex],{silent:true});
                        }
                        this.layer.drawFeature(this.virtualVertex);
                    } else {
                        this.virtualVertex = new OpenLayers.Feature.Vector(
                            new OpenLayers.Geometry.Point(closestPoint.x, closestPoint.y),
                            {},
                            OpenLayers.Util.extend({}, this.vertexStyle)
                        );
                        this.layer.addFeatures([this.virtualVertex], {silent:true});
                    }
                    this.dragHandler.setMap(this.layer.map);
                    this.dragHandler.activate();
                    break;
                }
                feature = null;
            }
        }
        if (!feature && this.virtualVertex) {
            this.layer.removeFeatures([this.virtualVertex], {silent: true});
            this.dragHandler.deactivate();
        }
    },

    geometryTypeMatches: function(feature) {
            return this.geometryTypes == null ||
                OpenLayers.Util.indexOf(this.geometryTypes,
                    feature.geometry.CLASS_NAME) > -1;
    },

    getSegments: function(geometry) {
        var components = geometry.components;
        var numSeg = components.length - 1;
        var segments = [];
        var point1
        var point2;
        var i;

        for(i=0; i<numSeg; ++i) {
                point1 = components[i];
                point2 = components[i + 1];
                segments[i] = {
                        x1: point1.x,
                        y1: point1.y,
                        x2: point2.x,
                        y2: point2.y
                };
        }
        return segments;
    },

    findClosestOnFeature: function(pt, feature, tolerance) {
        var result = null;
        var segs = this.getSegments(feature.geometry);
        var i;
        var minDistance = tolerance;
        var dist;

        for (i=0; i<segs.length; i++) {
            dist = OpenLayers.Geometry.distanceToSegment(pt, segs[i]);
            if (dist.distance < minDistance) {
                result = {
                    x: dist.x,
                    y: dist.y
                };
                minDistance = dist.distance;
            }
        }
        return result;
    },

    CLASS_NAME: "OpenLayers.Control.AddViaPoint"

});
