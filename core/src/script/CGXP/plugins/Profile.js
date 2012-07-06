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
 * @requires plugins/Tool.js
 * @requires OpenLayers/Control/DrawFeature.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Profile
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Profile plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_profile',
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools'
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Profile(config)
 *
 *  This plugin provides an "Profile" button.
 */
cgxp.plugins.Profile = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_wmsbrowser */
    ptype: "cgxp_profile",

    /** api: config[events]
     *  ``Object``
     *  An Observer used to receive events.
     */
    events: null,

    /** api: config[serviceUrl]
     *  ``String``
     *  The url to the profile service. 
     */
    serviceUrl: null,

    /** api: config[valuesProperty]
     *  ``String``
     *  The property in which are stored the elevation values.
     *  Defaults to 'values'.
     */
    valuesProperty: "values",

    /** api: config[helpText]
     *  ``String``
     *  The translated tool help html text.
     */
    helpText: null,

    /** api: config[waitMsgText]
     *  ``String``
     *  The loading message.
     */
    waitMsgText: null,

    /** private: property[control]
     *  ``cgxp.plugins.Profile.Control``
     *  The Profile control
     */
    control: null,

    /** private: method[addActions]
     */
    addActions: function() {
        var control =  this.createControl();
        this.control = control;
        this.target.mapPanel.map.addControl(control);
        var btn = new GeoExt.Action({
            allowDepress: true,
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            text: this.buttonText,
            iconCls: "cgxp-icon-profile",
            control: control 
        });
        return cgxp.plugins.Profile.superclass.addActions.apply(this,[btn]);
    },

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var card = {
            xtype: 'container',
            layout: 'card',
            activeItem: 0,
            border: false,
            items: [{
                html: this.helpText,
                border: false,
                bodyStyle: 'padding: 10px;'
            }]
        };

        this.outputConfig = this.outputConfig || {};
        Ext.applyIf(this.outputConfig, {
            width: 400,
            height: 300,
            defaults: {
                // required when added to a window (see Tool::addOutput)
                // because of overnesting
                layout: 'fit'
            },
            listeners: {
                hide: function() {
                    this.control.layer.destroyFeatures();
                },
                scope: this
            }
        });
        
        var target = cgxp.plugins.Profile.superclass.addOutput.call(this, card);
        this.showOutput(target);
        return target;
    },

    /** private: method[createProfileControl]
     *  Creates the Profile control
     */
    createControl: function() {
        var cmp;
        return new cgxp.plugins.Profile.Control({
            eventListeners: {
                featureadded: function(obj) {
                    this.showOutput(cmp);
                    cmp.getEl().mask(this.waitMsgText);

                    var format = new OpenLayers.Format.GeoJSON();
                    var geojson = format.write(obj.feature);

                    Ext.Ajax.request({
                        url: this.serviceUrl,
                        method: 'POST',
                        jsonData: geojson,
                        success: function(result) {
                            var data = new OpenLayers.Format.JSON().read(result.responseText);
                            this.drawProfile(data.profile);
                        },
                        scope: this
                    });
                },
                startdrawing: this.removeProfile,
                activate: function() {
                    if (cmp) {
                        this.showOutput(cmp);
                    } else {
                        cmp = this.addOutput();
                    }
                },
                deactivate: function() {
                    this.hideOutput(cmp);
                },
                scope: this
            }
        });
    },

    /** private: method[showOutput]
     *  Shows the output
     */
    showOutput: function(cmp) {
        if (cmp.ownerCt && cmp.ownerCt.ownerCt &&
            cmp.ownerCt.ownerCt instanceof Ext.Window) {
                cmp.ownerCt.ownerCt.show();
        } else if (this.outputTarget) {
            var container = this.getContainer(this.outputTarget); 
            container.show();
            container.ownerCt.doLayout();
        }
    },

    /** private: method[hideOutput]
     *  Hides the output
     */
    hideOutput: function(cmp) {
        if (cmp.ownerCt && cmp.ownerCt.ownerCt &&
            cmp.ownerCt.ownerCt instanceof Ext.Window) {
                cmp.ownerCt.ownerCt.hide();
        } else if (this.outputTarget) {
            var container = this.getContainer(this.outputTarget); 
            container.hide();
            container.ownerCt.doLayout();
        }
        this.removeProfile();
    },

    /** private: method[drawProfile]
     *  Draws the profile using the DyGraph library
     */
    drawProfile: function(data) {
        var cmp = this.output[0].add({
            xtype: 'box'
        });
        this.output[0].getLayout().setActiveItem(cmp);

        // guess the y series from the data
        var yKeys = [];
        for (var key in data[0][this.valuesProperty]) {
            yKeys.push(key);
        }

        var values = [];
        for (var i=0; i < data.length; i++) {
            var datum = data[i];
            var value = [parseFloat(datum.dist)];
            for (var j in datum[this.valuesProperty]) {
                value.push(parseFloat(datum[this.valuesProperty][j]));
            }
            values.push(value);
        }

        var marker;
        var g = new Dygraph(
            cmp.el.dom,
            function() {
                var ret = "X," + yKeys.join(',') + "\n";
                for (var i = 0; i < values.length; i++) {
                    ret += values[i].join(',') + "\n";
                }
                return ret;
            },
            {
                legend: 'always',
                highlightCallback: (function(e, x, pts, row) {
                    for (var i = 0; i < data.length; i++) {
                        var datum = data[i];
                        if (x == datum.dist) {
                            var point = new OpenLayers.Geometry.Point(datum.x, datum.y);
                            marker = new OpenLayers.Feature.Vector(point);
                            this.control.layer.addFeatures([marker]);
                            break;
                        }
                    }
                }).bind(this),
                unhighlightCallback: function(e, x, pts, row) {
                    marker && marker.destroy();
                }
            }
        );
        this.output[0].getEl().unmask();

        this.output[0].on('resize', function() {
            g.resize();
        });
    },

    /** private: method[removeProfile]
     *  Removes the chart.
     */
    removeProfile: function() {
        this.output[0].getLayout().setActiveItem(0);
        this.output[0].remove(1);
    }
});

Ext.preg(cgxp.plugins.Profile.prototype.ptype, cgxp.plugins.Profile);

/*
 * @include OpenLayers/Control.js
 * @include OpenLayers/Handler/Path.js
 */

/**
 * Class: App.Profile
 * Let the user draw a polyline and draws the altitude profile out of it.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.Profile.Control = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
    /**
     * APIProperty: serviceUrl
     * URL to access the profile service
     */
    serviceUrl: null,

    /**
     * APIProperty: nbPoints
     * Number of profile points to get
     */
    nbPoints: 200,

    /**
     * APIProperty: layers
     * List of profile layers to show
     */
    layers: ['MNS','MNT'],

    layer: null,

    style: {
        strokeColor: "#FFFF00",
        strokeOpacity: 0.85,
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeDashstyle: "solid",
        pointRadius: 0,
        pointerEvents: "visiblePainted",
        cursor: "inherit"
    },

    styleMarker: {
        strokeColor: "#FFFF00",
        strokeOpacity: 0.85,
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeDashstyle: "solid",
        pointRadius: 5,
        pointerEvents: "visiblePainted",
        cursor: "inherit"
    },

    /**
     * Constructor: App.Profile
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        var layer = new OpenLayers.Layer.Vector("Profile", {
            alwaysInRange: true,
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap(this.style)
        });

        options = OpenLayers.Util.extend(options, {
            callbacks: {
                point: function() {
                    this.startDrawing();
                }
            },
            handlerOptions: {
                layerOptions: {
                    style: this.style
                }
            }
        });

        // make sure "id" isn't set in the options, or
        // our id will be overridden
        delete options.id;

        OpenLayers.Control.DrawFeature.prototype.initialize.call(
                this, layer, OpenLayers.Handler.Path, options);
    },

    /**
     */
    activate: function() {
        if (OpenLayers.Control.DrawFeature.prototype.activate.call(this)) {
            this.map.addLayer(this.layer);
        }
    },

    /**
     */
    deactivate: function() {
        if (OpenLayers.Control.DrawFeature.prototype.deactivate.call(this)) {
            this.layer.destroyFeatures();
            this.map.removeLayer(this.layer);
        }
    }, 

    startDrawing: function() {
        this.layer.destroyFeatures();
        this.events.triggerEvent("startdrawing");
    },

    destroy: function() {
        this.layer.destroyFeatures();
        this.layer.map.removeLayer(this.layer);
        this.layer.destroy();
        OpenLayers.Control.DrawFeature.prototype.destroy.call(this);
    },

    CLASS_NAME: "cgxp.plugins.Profile.Control"
});
