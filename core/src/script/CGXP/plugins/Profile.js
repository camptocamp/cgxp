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
 * @requires CGXP/dygraph-combined.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/StyleMap.js
 * @include OpenLayers/Style.js
 * @include OpenLayers/Rule.js
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
 *              toggleGroup: 'maptools',
 *              serviceUrl: 'http://myserver.com/route/to/profile.json',
 *              rasterLayers: ['mnt', 'mns']
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

    /** api: ptype = cgxp_profile*/
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

    /** api: config[xLabelText]
     *  ``String``
     *  The translated x label text.
     */
    xLabelText: null,

    /** api: config[yLabelText]
     *  ``String``
     *  The translated y label text.
     */
    yLabelText: null,
    
    /** api: config[style]
     *  ``Object``
     *  The style to be applied to the control vector layer
     */
    style: null,

    /** api: config[rasterLayers]
     *  ``Array(String)``
     *  The list of raster layers.
     */
    rasterLayers: null,

    /** api: config[nbPoints]
     *  ``Integer``
     *  The number of points to show in the charts.
     */
    nbPoints: 100,

    /** api: config[markerStyle]
     *  ``Object``
     *  The style to be applied to the marker when hovering the chart.
     */
    markerStyle: {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "yellow",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
    },

    /** private: property[control]
     *  ``cgxp.plugins.Profile.Control``
     *  The Profile control
     */
    control: null,

    /** private: property[firstShow]
     *  ``Booolean``
     *  Tells whether the window has already been displayed.
     *  Useful to get it positionned top left.
     */
    firstShow: true,

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
            style: this.style || {
                "default": new OpenLayers.Style(null, {
                    rules: [new OpenLayers.Rule({
                        symbolizer: {
                            "Point": {
                                pointRadius: 4,
                                graphicName: "square",
                                fillColor: "white",
                                fillOpacity: 1,
                                strokeWidth: 1,
                                strokeOpacity: 1,
                                strokeColor: "#333333"
                            },
                            "Line": {
                                strokeWidth: 3,
                                strokeOpacity: 1,
                                strokeColor: "#666666"
                            }
                        }
                    })]
                })
            },
            eventListeners: {
                featureadded: function(obj) {
                    this.showOutput(cmp);
                    cmp.getEl().mask(this.waitMsgText);

                    var format = new OpenLayers.Format.GeoJSON();
                    var geometry = format.write(obj.feature.geometry);

                    Ext.Ajax.request({
                        url: this.serviceUrl,
                        method: 'POST',
                        params: {
                            layers: this.rasterLayers.join(','),
                            geom: geometry,
                            nbPoints: this.nbPoints
                        },
                        success: function(result) {
                            var data = new OpenLayers.Format.JSON().read(result.responseText);
                            this.drawProfile(data.profile);
                        },
                        scope: this
                    });
                },
                startdrawing: this.clearProfile,
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
                if (this.firstShow) {
                    cmp.ownerCt.ownerCt.alignTo(
                        this.target.mapPanel.body, 'tl-tl', [30, 5]);
                }
        } else if (this.outputTarget) {
            var container = this.getContainer(this.outputTarget); 
            container.show();
            container.ownerCt.doLayout();
        }
        this.firstShow = false;
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
        this.clearProfile();
    },

    /** private: method[drawProfile]
     *  Draws the profile using the DyGraph library
     */
    drawProfile: function(data) {
        var cmp = this.output[0].add({
            xtype: 'box'
        });
        this.output[0].getLayout().setActiveItem(cmp);

        var values = [];
        var layers = this.rasterLayers;
        for (var i=0; i < data.length; i++) {
            var datum = data[i];
            var value = [parseFloat(datum.dist)];
            for (var j=0; j < layers.length; j++) {
                var layer = layers[j];
                value.push(parseFloat(datum[this.valuesProperty][layer]));
            }
            values.push(value);
        }

        var marker;
        var g = new Dygraph(
            cmp.el.dom,
            function() {
                var ret = "X," + layers.join(',') + "\n";
                for (var i = 0; i < values.length; i++) {
                    ret += values[i].join(',') + "\n";
                }
                return ret;
            },
            {
                ylabel: this.yLabelText,
                xlabel: this.xLabelText,
                axes: {
                    x: {
                        valueFormatter: function(d) {
                            return d + 'm';
                        }
                    },
                    y: {
                        valueFormatter: function(d) {
                            return d + 'm';
                        }
                    }
                },
                legend: 'always',
                highlightCallback: (function(e, x, pts, row) {
                    for (var i = 0; i < data.length; i++) {
                        var datum = data[i];
                        if (x == datum.dist) {
                            var point = new OpenLayers.Geometry.Point(datum.x, datum.y);
                            marker && marker.destroy();
                            marker = new OpenLayers.Feature.Vector(point, null, this.markerStyle);
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

    /** private: method[clearProfile]
     *  Removes the chart.
     */
    clearProfile: function() {
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
            styleMap: new OpenLayers.StyleMap(options.style)
        });

        options = OpenLayers.Util.extend(options, {
            callbacks: {
                point: function() {
                    this.startDrawing();
                }
            },
            handlerOptions: {
                layerOptions: {
                    style: options.style
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
