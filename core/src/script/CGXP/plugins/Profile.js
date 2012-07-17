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
 * @include dygraphs/dygraph-combined.js
 * @include dygraphs/excanvas.js
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
 *              serviceUrl: "${request.route_url('profile.json')}",
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

    /** api: config[serviceUrl]
     *  ``String``
     *  The url to the profile service.
     */
    serviceUrl: null,

    /** api: config[valuesProperty]
     *  ``String``
     *  The property in which are stored the elevation values (optional).
     *  Defaults to 'values'.
     */
    valuesProperty: "values",

    /** api: config[helpText]
     *  ``String``
     *  The translated tool help html text (i18n).
     */
    helpText: null,

    /** api: config[waitMsgText]
     *  ``String``
     *  The loading message (i18n).
     */
    waitMsgText: null,

    /** api: config[xLabelText]
     *  ``String``
     *  The translated x label text (i18n).
     */
    xLabelText: null,

    /** api: config[yLabelText]
     *  ``String``
     *  The translated y label text (i18n).
     */
    yLabelText: null,

    /** api: config[exportCsvText]
     *  ``String``
     *  The translated "export as csv" text (i18n).
     */
    exportCsvText: null,

    /** api: config[errorMsg]
     *  ``String``
     *  The translated error message (i18n).
     */
    errorMsg: null,
    
    /** api: config[style]
     *  ``Object``
     *  The style to be applied to the control vector layer (optional).
     */
    style: null,

    /** api: config[rasterLayers]
     *  ``Array(String)``
     *  The list of raster layers.
     */
    rasterLayers: null,

    /** api: config[nbPoints]
     *  ``Integer``
     *  The number of points to show in the charts (optional).
     *  Defaults to 100.
     */
    nbPoints: 100,

    /** api: config[markerStyle]
     *  ``Object``
     *  The style to be applied to the marker when hovering the chart
     *  (optional).
     */
    markerStyle: OpenLayers.Util.applyDefaults({
        pointRadius: 4,
        graphicName: "square",
        fillColor: "yellow",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333",
        fontSize: 12,
        fontColor: '#FF0000',
        labelAlign: 'lt',
        labelYOffset: 5
    }, OpenLayers.Feature.Vector.style['default']),

    /** private: property[control]
     *  ``cgxp.plugins.Profile.Control``
     *  The Profile control
     */
    control: null,

    /** private: property[feature]
     *  ``OpenLayers.Feature.Vector``
     *  The drawn feature.
     */
    feature: null,

    /** private: property[chart]
     *  ``Object``
     *  The DyGraph chart
     */
    chart: null,

    /** private: property[data]
     *  ``Object``
     *  The data as retrieved from the profile service.
     */
    data: null,

    /** private: property[marker]
     *  ``OpenLayers.Feature.Vector``
     *  The marker to be shown over the polyline.
     */
    marker: null,

    /** private: property[firstShow]
     *  ``Booolean``
     *  Tells whether the window has already been displayed.
     *  Useful to get it positionned top left.
     */
    firstShow: true,

    /** private: private[dummy_form]
     *  ``Object`` Fake form used for csv export.
     */
    dummy_form: Ext.DomHelper.append(document.body, {tag : 'form'}),

    /** private: property[container]
     *  ``Component`` Either the created window or a component set in
     *  outputTarget.
     */
    container: null,

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
            title: '<span style="float: right; padding-right: 10px;"><a href="javascript:void(0)" class="csv">' +
                   this.exportCsvText + '</a></span>',
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
                    this.clearProfile();
                },
                afterrender: function(cmp) {
                    cmp.getEl().on({
                        click: function(e) {
                            if (e.getTarget('.csv')) {
                                this.exportAsCsv();
                            }
                        },
                        scope: this
                    });
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
                                strokeColor: "#660000"
                            }
                        }
                    })]
                })
            },
            eventListeners: {
                featureadded: function(obj) {
                    this.showOutput(cmp);
                    cmp.getEl().mask(this.waitMsgText);

                    this.feature = obj.feature;

                    var format = new OpenLayers.Format.GeoJSON();
                    var geometry = format.write(this.feature.geometry);

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
                        failure: function() {
                            this.showError();
                        },
                        scope: this
                    });
                },
                startdrawing: function() {
                    this.clearProfile();
                },
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
                distance: function(distance) {
                    this.showSelection(distance);
                },
                scope: this
            }
        });
    },

    /** private: method[exportAsCsv]
     */
    exportAsCsv: function() {
        var format = new OpenLayers.Format.GeoJSON();
        var geometry = format.write(this.feature.geometry);

        Ext.Ajax.request({
            url: this.csvServiceUrl,
            method: 'POST',
            isUpload: true,
            params: {
                layers: this.rasterLayers.join(','),
                geom: geometry,
                nbPoints: this.nbPoints
            },
            form: this.dummy_form
        });
    },

    /** private: method[showOutput]
     *  Shows the output
     */
    showOutput: function(cmp) {
        if (cmp.ownerCt && cmp.ownerCt.ownerCt &&
            cmp.ownerCt.ownerCt instanceof Ext.Window) {
                this.container = cmp.ownerCt.ownerCt;
                if (this.firstShow) {
                    this.container.alignTo(
                        this.target.mapPanel.body, 'tl-tl', [30, 5]);
                }
        } else if (this.outputTarget) {
            this.container = this.getContainer(this.outputTarget); 
            this.container.show();
            this.container.ownerCt.doLayout();
        }
        this.firstShow = false;
        this.container.getEl().child('.csv').hide();
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

    /** private: method[showError]
     *  Shows an error message
     */
    showError: function() {
        var cmp = this.output[0].add({
            xtype: 'box',
            html: this.errorMsg
        });
        this.output[0].getLayout().setActiveItem(cmp);
        this.output[0].getEl().unmask();
    },

    /** private: method[drawProfile]
     *  Draws the profile using the DyGraph library
     */
    drawProfile: function(data) {
        this.data = data;
        var cmp = this.output[0].add({
            xtype: 'box'
        });
        this.output[0].getLayout().setActiveItem(cmp);
        this.container.getEl().child('.csv').show();

        var values = [];
        var layers = this.rasterLayers;
        var i;
        for (i=0; i < data.length; i++) {
            var datum = data[i];
            var value = [parseFloat(datum.dist)];
            for (var j=0; j < layers.length; j++) {
                var layer = layers[j];
                value.push(parseFloat(datum[this.valuesProperty][layer]));
            }
            values.push(value);
        }

        this.chart = new Dygraph(
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
                    this.showMarker(row);
                }).createDelegate(this),
                unhighlightCallback: (function(e, x, pts, row) {
                    this.marker && this.marker.destroy();
                }).createDelegate(this)
            }
        );
        this.output[0].getEl().unmask();

        this.output[0].on('resize', (function() {
            this.chart && this.chart.resize();
        }).createDelegate(this));
    },

    /** private: showSelection
     *  Highlight the chart for a given distance.
     */
    showSelection: function(x) {
        if (!this.chart) {
            return;
        }
        if (x) {
            for (var i = 0; i < this.data.length; i++) {
                var datum = this.data[i];
                if (datum.dist >= x) {
                    // choose the closest
                    i = (Math.abs(datum.dist-x) < Math.abs(this.data[i-1].dist-x)) ?
                        i : i - 1;
                    this.showMarker(i);
                    this.chart.setSelection(i);
                    return;
                }
            }
        } else {
            this.chart.clearSelection();
            this.marker && this.marker.destroy();
        }
    },

    showMarker: function(row) {
        var layers = this.rasterLayers;
        var datum = this.data[row];
        var point = new OpenLayers.Geometry.Point(datum.x, datum.y);
        this.marker && this.marker.destroy();

        var label = [datum.dist + " m"];
        for (var i=0; i < layers.length; i++) {
            var l = layers[i];
            label.push(l + " : " + datum[this.valuesProperty][l] + " m");
        }
        var style = OpenLayers.Util.extend({
            label: label.join(', ')
        }, this.markerStyle);

        this.marker = new OpenLayers.Feature.Vector(point, datum, style);
        this.control.layer.addFeatures([this.marker]);
    },

    /** private: method[clearProfile]
     *  Removes the chart.
     */
    clearProfile: function() {
        this.output[0].getLayout().setActiveItem(0);
        this.output[0].remove(1);
        this.chart = null;
        this.data = null;
        this.container.getEl().child('.csv').hide();
        this.feature = null;
    }
});

Ext.preg(cgxp.plugins.Profile.prototype.ptype, cgxp.plugins.Profile);

/*
 * @requires OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Control/Snapping.js
 */

/**
 * Class: cgxp.plugins.Profile.Control
 * Let the user draw a polyline and draws the altitude profile out of it.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.Profile.Control = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    /**
     * Property: hoverHandler
     * Hover handler
     */
    hoverHandler: null,

    /**
     * Property: snapping
     * Snapping control
     */
    snapping: null,

    /**
     * Property: feature
     * The Drawn feature
     */
    feature: null,

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

        this.snapping = new OpenLayers.Control.Snapping({
            layer: layer,
            precedence: ['edge']
        });

        this.snapping.events.on({
            'snap': function(obj) {
                this.map.div.style.cursor = 'pointer';
                this.events.triggerEvent('distance',
                    this.computeDistance(obj.point)
                );
            },
            'unsnap': function(obj) {
                this.map.div.style.cursor = '';
                this.events.triggerEvent('distance', false);
            },
            scope: this
        });
        this.hoverHandler = new cgxp.plugins.Profile.HoverHandler(this, layer);
    },

    /**
     */
    activate: function() {
        if (OpenLayers.Control.DrawFeature.prototype.activate.call(this)) {
            this.map.addLayer(this.layer);
            this.map.addControl(this.snapping);
        }
    },

    /**
     */
    deactivate: function() {
        if (OpenLayers.Control.DrawFeature.prototype.deactivate.call(this)) {
            this.layer.destroyFeatures();
            this.map.removeLayer(this.layer);
            this.map.removeControl(this.snapping);
            this.hoverHandler.deactivate();
        }
    }, 

    setMap: function(map) {
        this.hoverHandler.setMap(map);
        OpenLayers.Control.DrawFeature.prototype.setMap.apply(this, arguments);
    },

    startDrawing: function() {
        this.layer.destroyFeatures();
        this.events.triggerEvent("startdrawing");
        this.snapping.deactivate();
        this.hoverHandler.deactivate();
        this.feature = null;
    },

    drawFeature: function(geometry) {
        OpenLayers.Control.DrawFeature.prototype.drawFeature.apply(this, [geometry]);
        this.snapping.activate();
        this.hoverHandler.activate();
        this.feature = this.layer.features[0];
    },

    destroy: function() {
        this.layer.destroyFeatures();
        this.layer.map.removeLayer(this.layer);
        this.layer.destroy();
        this.hoverHandler.destroy();
        OpenLayers.Control.DrawFeature.prototype.destroy.call(this);
    },

    computeDistance: function(point) {
        var cmps = this.feature.geometry.components;
        var segmentIndex;
        var i;
        for (i=1; i < cmps.length; i++) {
            var components = [cmps[i - 1], cmps[i]];
            var segment = new OpenLayers.Geometry.LineString([
                cmps[i - 1].clone(),
                cmps[i].clone()
            ]);
            if (point.distanceTo(segment) < 0.001) {
                segmentIndex = i - 1;
                continue;
            }
        }
        var distance = 0;
        for (i=0; i <= segmentIndex; i++) {
            if (i == segmentIndex) {
                distance += point.distanceTo(cmps[i]);
            } else {
                distance += cmps[i].distanceTo(cmps[i + 1]);
            }
        }
        return distance;
    },

    CLASS_NAME: "cgxp.plugins.Profile.Control"
});

/*
 * @requires OpenLayers/Handler.js
 */

/**
 * Class: cgxp.plugins.Profile.HoverHandler
 * Handler which allows to use snapping. Useful to detect hover by taking
 * a tolerance into account.
 *
 * Inherits from:
 *  - <OpenLayers.Handler>
 */
cgxp.plugins.Profile.HoverHandler = OpenLayers.Class(OpenLayers.Handler, {
    initialize: function(control, layer, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, [control, callbacks, options]);
        this.layer = layer;
    },
    mousemove: function(evt) {
        var loc = this.layer.map.getLonLatFromViewPortPx(evt.xy);
        var vertex = new OpenLayers.Geometry.Point(loc.lon, loc.lat);
        this.layer.events.triggerEvent(
            "sketchstarted", {vertex: vertex}
        );
    }
});
