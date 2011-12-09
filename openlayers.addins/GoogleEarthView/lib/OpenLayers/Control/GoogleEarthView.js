/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Control/DragFeature.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Projection.js
 * @requires OpenLayers/Spherical.js
 */

/**
 * Class: OpenLayers.Control.GoogleEarthView
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 *
 * This class provides a link between a 2D map and a 3D view in a Google Earth
 * plugin.  The 3D view's camera and look at point are displayed on the 2D map,
 * and are automatically updated as the 3D view changes.  Similarly, dragging
 * the camera or look at point on the 2D map updates the 3D view.  This
 * provides an intuitive interface pan, rotate and zoom in the 3D view while
 * clearly communicating the exact location of the camera and the point of
 * interest on the 2D map.
 *
 * Usage:
 *
 * The control requires a google.earth.GEPlugin instance representing the 3D
 * view.  This can either be set at initialization time with the gePlugin
 * option, or at any time later with the setGEPlugin method call.  Typically,
 * the control will be created and added to the map before the Google Earth
 * plugin initialization is complete, and then setGEPlugin is called when the
 * plugin is available.
 *
 * Styling is controlled by the cameraStyle, lineStyle and lookAtStyle
 * symbolizers which can be passed in the initial options, or set any time
 * before the draw() method is called.
 *
 * Implementation notes:
 *
 * Dragging the look at point on the map changes the look at point in the 3D
 * view directly.  Dragging the camera on the map keeps the look at point and
 * camera tilt constant but changes the camera's range and heading relative to
 * the look at point.
 *
 * We listen for "frameend" rather than "viewchange" events from the Google
 * Earth plugin to minimise the number of updates.
 *
 * The Google Earth plugin's altitude mode constants are only available once
 * the plugin is initialized, hence the delayed initialization.
 *
 * Gimball lock occurs when the camera is directly above the look at point. In
 * this case, the calculation of the range and heading from the camera to the
 * look at point on the map becomes degenerate.  We treat this case specially
 * by removing the camera and only allowing the user to move the look at point.
 *
 * Known bugs:
 *
 * The calculation of the camera range when the camera is moved assumes that
 * the surface of the earth is a plane.  This is good enough when the camera is
 * close to the ground, but does produce imperfect but usable results when the
 * camera is at very high altitudes.
 *
 * History:
 *
 * The initial code was developed by yves.bologni@camptocamp.com for
 * http://sitn.ne.ch/.
 *
 */
OpenLayers.Control.GoogleEarthView = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: autoActivate
     * {Boolean}
     */
    autoActivate: false,

    /**
     * APIProperty: displayInLayerSwitcher
     * {Boolean}
     */
    displayInLayerSwitcher: false,

    /**
     * APIProperty: gePlugin
     * {google.earth.GEPlugin}
     */
    gePlugin: null,

    /**
     * APIProperty: visible
     * {Boolean}
     */
    visible: true,

    /**
     * APIProperty: layerName
     * {String}
     */
    layerName: null,

    /**
     * APIProperty: cameraStyle
     * {symbolizer}
     */
    cameraStyle: {
        externalGraphic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAASCAQAAAAJOc1sAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2QwDBAEgC9wc/QAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAGDSURBVDjLdZQtktwwEIXf5gLREUzDzAPi2pBAH0FVqUpgzEJ1BKOQEB/BdJloyEYzJ9CC4brBF6C24pnxtIi7q1//vO72E7qXt29xyh/ippYud2k4fZoPXLl6RYEOHT6HJ/68Nt5AnSkd/YMgA+n7ATz97izHRAJgYCIQGBHCs7S6Zm7gy1rzjhT+y0wgkEh0iADMVp9nB19fapSFa9myeQoOkYFkbfmzwdOL24ETA9HgS2sysCAmAIoFCGckZEorWCzMeDI0Kh0gBvNJZo9nzV8q05sERGQwJoaWH7oGr16i5914kaSs024XijpJ0qq4s+bd9ypJGiU0X2r+ynlEeOLNtEcSYrTc3nIb8/6lqjWAw5HMZes8MyDWxo5w5Oc2d/9aTdH47sks9LaqBW/EFQvrSM9XWzd93Wac8QhHIAOFlaEFrIz3l/zxbufjj21N+oOzGdsQp0s5OhmE5of3ZrX9yZ8fXFw7nl/Tbt5bPZ6Fcuf7dPS72OT0tyS99eH9Q49/xBxZf91v2x4AAAAASUVORK5CYII=",
        graphicHeight: 18,
        graphicWidth: 31,
        graphicYOffset: -3,
        rotation: 0
    },

    /**
     * APIProperty: lineStyle
     * {symbolizer}
     */
    lineStyle: {
        pointRadius: 6,
        strokeColor: "#ff0000",
        strokeWidth: 3
    },

    /**
     * APIProperty: lookAtStyle
     * {symbolizer}
     */
    lookAtStyle: {
        fillColor: "#ff0000",
        graphicName: "circle",
        pointRadius: 8
    },

    /**
     * Property: altitudeMode
     * {number}
     */
    altitudeMode: 0,

    /**
     * Property: layer
     * {OpenLayers.Layer.Vector}
     */
    layer: null,

    /**
     * Property: featuresAdded
     * {Boolean}
     */
    featuresAdded: false,

    /**
     * Property: dragFeatureControl
     * {OpenLayers.Control.DragFeature}
     */
    dragFeatureControl: null,

    /**
     * Property: cameraFeature
     * {OpenLayers.Feature.Vector}
     */
    cameraFeature: null,

    /**
     * Property: lineFeature
     * {OpenLayers.Feature.Vector}
     */
    lineFeature: null,

    /**
     * Property: lookAtFeature
     * {OpenLayers.Feature.Vector}
     */
    lookAtFeature: null,

    /**
     * Property: gimballLock
     * {boolean}
     */
    gimballLock: false,

    /**
     * Property: gimballLockThreshold
     * {number}
     */
    gimballLockThreshold: 1,

    /**
     * Property: geProjection
     * {OpenLayers.Projection}
     */
    geProjection: null,

    /**
     * Property: frameendCallback
     * {function}
     */
    frameendCallback: null,

    /**
     * Constructor: OpenLayers.Control.GoogleEarthView
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        options = options || {};
        options.layerName =
            options.layerName || OpenLayers.i18n("Google Earth view control");
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.geProjection = new OpenLayers.Projection("EPSG:4326");
        if (this.gePlugin) {
            this.setGEPlugin(this.gePlugin);
        }
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        if (this.layer) {
            this.layer.destroy();
            this.layer = null;
        }
    },

    /**
     * APIMethod: setGEPlugin
     */
    setGEPlugin: function(gePlugin) {
        this.removeGEPluginListener();
        this.gePlugin = gePlugin;
        if (this.gePlugin) {
            this.altitudeMode = this.gePlugin.ALTITUDE_RELATIVE_TO_GROUND;
            if (this.active) {
                this.addGEPluginListener();
                this.onFrameend();
            }
        }
    },

    /**
     * Method: addGEPluginListener
     */
    addGEPluginListener: function() {
        this.frameendCallback = OpenLayers.Function.bind(this.onFrameend, this);
        google.earth.addEventListener(
            this.gePlugin, "frameend", this.frameendCallback);
    },

    /**
     * Method: removeGEPluginListener
     */
    removeGEPluginListener: function() {
        if (this.frameendCallback) {
            google.earth.removeEventListener(
                this.gePlugin, "frameend", this.frameendCallback);
            this.frameendCallback = null;
        }
    },

    /**
     * APIMethod: draw
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.cameraFeature) {
            this.cameraFeature = new OpenLayers.Feature.Vector(
                null, {}, this.cameraStyle);
        }
        if (!this.lineFeature) {
            this.lineFeature = new OpenLayers.Feature.Vector(
                null, {}, this.lineStyle);
        }
        if (!this.lookAtFeature) {
            this.lookAtFeature = new OpenLayers.Feature.Vector(
                null, {}, this.lookAtStyle);
        }
        if (!this.layer) {
            this.layer = new OpenLayers.Layer.Vector(this.layerName, {
                visibility: this.visible,
                displayInLayerSwitcher: this.displayInLayerSwitcher
            });
        }
        if (!this.dragFeatureControl) {
            this.dragFeatureControl = new OpenLayers.Control.DragFeature(
                this.layer, {
                    geometryTypes: [OpenLayers.Geometry.Point.prototype.CLASS_NAME],
                    onDrag: OpenLayers.Function.bind(this.onDrag, this)
                });
        }
        return this.div;
    },

    /**
     * APIMethod: activate
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments) &&
                this.gePlugin) {
            this.map.addLayer(this.layer);
            this.map.addControl(this.dragFeatureControl);
            this.dragFeatureControl.activate();
            this.addGEPluginListener();
            this.onFrameend();
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.removeGEPluginListener();
            this.dragFeatureControl.deactivate();
            this.map.removeControl(this.dragFeatureControl);
            this.map.removeLayer(this.layer);
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: onDrag
     */
    onDrag: function(feature, pixel) {
        var mapProjection = this.map.getProjectionObject();
        var lonLat = this.layer.getLonLatFromViewPortPx(pixel);
        var point = new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat);
        OpenLayers.Projection.transform(
            point, mapProjection, this.geProjection);
        lonLat = new OpenLayers.LonLat(point.x, point.y);
        var view = this.gePlugin.getView();
        var geLookAt = view.copyAsLookAt(this.altitudeMode);
        if (feature === this.cameraFeature && !this.gimballLock) {
            // Set the camera heading and range
            var lookAtLonLat = new OpenLayers.LonLat(
                geLookAt.getLongitude(), geLookAt.getLatitude());
            geLookAt.setHeading(
                -OpenLayers.Spherical.computeHeading(lonLat, lookAtLonLat));
            geLookAt.setRange(
                1000 * OpenLayers.Util.distVincenty(lonLat, lookAtLonLat) /
                    Math.sin(Math.PI * geLookAt.getTilt() / 180));
        } else if (feature === this.lookAtFeature ||
                   (feature === this.cameraFeature && this.gimballLock)) {
            // Set the look at point
            geLookAt.setLongitude(lonLat.lon);
            geLookAt.setLatitude(lonLat.lat);
        }
        view.setAbstractView(geLookAt);
    },

    /**
     * APIMethod: onFrameend
     */
    onFrameend: function() {

        var mapProjection = this.map.getProjectionObject();
        var view = this.gePlugin.getView();

        // Calculate new cameraFeature geometry
        var geCamera = view.copyAsCamera(this.altitudeMode);
        var newCameraGeometry = new OpenLayers.Geometry.Point(
            geCamera.getLongitude(), geCamera.getLatitude());
        OpenLayers.Projection.transform(
            newCameraGeometry, this.geProjection, mapProjection);

        // Calculate new lookAtFeature geometry
        var geLookAt = view.copyAsLookAt(this.altitudeMode);
        var newLookAtGeometry = new OpenLayers.Geometry.Point(
            geLookAt.getLongitude(), geLookAt.getLatitude());
        OpenLayers.Projection.transform(
            newLookAtGeometry, this.geProjection, mapProjection);

        var prevGimballLock = this.gimballLock;
        this.gimballLock = geCamera.getTilt() < this.gimballLockThreshold;

        if (!this.featuresAdded ||
            this.gimballLock != prevGimballLock ||
            newCameraGeometry.x != this.cameraFeature.geometry.x ||
            newCameraGeometry.y != this.cameraFeature.geometry.y ||
            newLookAtGeometry.x != this.lookAtFeature.geometry.x ||
            newLookAtGeometry.y != this.lookAtFeature.geometry.y) {

            if (this.featuresAdded) {
                this.layer.removeAllFeatures();
            }

            this.cameraFeature.geometry = newCameraGeometry;
            this.lookAtFeature.geometry = newLookAtGeometry;
            this.lineFeature.geometry = new OpenLayers.Geometry.LineString(
                [newCameraGeometry, newLookAtGeometry]);

            if (this.gimballLock) {

                this.layer.addFeatures([this.cameraFeature]);
                this.cameraFeature.style.rotation = geLookAt.getHeading();

            } else {

                this.layer.addFeatures(
                    [this.lineFeature, this.lookAtFeature, this.cameraFeature]);

                // Calculate camera rotation
                var cameraLonLat = new OpenLayers.LonLat(
                    geCamera.getLongitude(), geCamera.getLatitude());
                var cameraPixel = this.layer.getViewPortPxFromLonLat(cameraLonLat);
                var lookAtLonLat = new OpenLayers.LonLat(
                    geLookAt.getLongitude(), geLookAt.getLatitude());
                var lookAtPixel = this.layer.getViewPortPxFromLonLat(lookAtLonLat);
                var rotation =
                    90 + 180 * Math.atan2(lookAtPixel.y - cameraPixel.y,
                                          lookAtPixel.x - cameraPixel.x) / Math.PI;
                this.cameraFeature.style.rotation = rotation;

            }

            this.featuresAdded = true;

        }

    },

    CLASS_NAME: "OpenLayers.Control.GoogleEarthView"
});
