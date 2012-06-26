/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Control/Measure.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/StyleMap.js
 * @include OpenLayers/Style.js
 * @include OpenLayers/Rule.js
 */


/** api: (define)
 *  module = cgxp.plugins
 *  class = Measure
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Measure plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_measure',
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools'
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Measure(config)
 *
 *    Provides two actions for measuring length and area.
 */
cgxp.plugins.Measure = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = cgxp_measure */
    ptype: "cgxp_measure",

    /** api: config[outputTarget]
     *  ``String`` Popups created by this tool are added to the map by default.
     */
    outputTarget: "map",

    /** api: config[pointMenuText]
     *  ``String``
     *  Text for measure point menu item (i18n).
     */
    pointMenuText: "Point",

    /** api: config[lengthMenuText]
     *  ``String``
     *  Text for measure length menu item (i18n).
     */
    lengthMenuText: "Length",

    /** api: config[areaMenuText]
     *  ``String``
     *  Text for measure area menu item (i18n).
     */
    areaMenuText: "Area",

    /** api: config[pointTooltip]
     *  ``String``
     *  Text for measure point action tooltip (i18n).
     */
    pointTooltip: "Measure point",

    /** api: config[lengthTooltip]
     *  ``String``
     *  Text for measure length action tooltip (i18n).
     */
    lengthTooltip: "Measure length",

    /** api: config[areaTooltip]
     *  ``String``
     *  Text for measure area action tooltip (i18n).
     */
    areaTooltip: "Measure area",

    /** api: config[measureTooltip]
     *  ``String``
     *  Text for measure action tooltip (i18n).
     */
    measureTooltip: "Measure",

    popup: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        cgxp.plugins.Measure.superclass.constructor.apply(this, arguments);
    },

    /** private: method[destroy]
     */
    destroy: function() {
        this.button = null;
        cgxp.plugins.Measure.superclass.destroy.apply(this, arguments);
    },

    cleanup: function() {
        if (this.popup) {
            this.popup.destroy();
            delete this.popup;
        }  
    },

    /** private: method[createMeasureControl]
     * :param: handlerType: the :class:`OpenLayers.Handler` for the measurement
     *     operation
     * :param: title: the string label to display alongside results
     *
     * Convenience method for creating a :class:`OpenLayers.Control.Measure`
     * control
     */
    createMeasureControl: function(handlerType, title) {

        var styleMap = new OpenLayers.StyleMap({
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
                            strokeColor: "#666666",
                            strokeDashstyle: "dash"
                        },
                        "Polygon": {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#666666",
                            fillColor: "white",
                            fillOpacity: 0.3
                        }
                    }
                })]
            })
        });

        var showPopup = function(event, complet) {
            var complet = typeof(complet) != 'undefined' ? complet : false;
            if (!this.popup) {
                this.popup = new GeoExt.Popup({
                    title: title,
                    border: false,
                    map: this.target.mapPanel.map,
                    unpinnable: false,
                    closeAction: 'hide',
                    location: new OpenLayers.LonLat(0, 0)
                });
                if (Ext.isIE7) {
                    // IE7 needs an explicit width.
                    this.popup.setWidth(200);
                }
            }
            this.popup.hide();
            var singlePoint = false;
            var measure = null;
            if (event.geometry.components) {
                var points = event.geometry.components;
                measure = event.measure.toFixed(2);
            } else {
                var points = Array(event.geometry);
                singlePoint = true;
                measure = event.measure;
            }
            if (points[0] instanceof OpenLayers.Geometry.LinearRing) {
                var line = points[0];
                points = points[0].components;              
            }
            // conditions to show the popup are different for partial and final 
            // geometries, the cases are: poly ongoing, poly complet, line ongoing, 
            // line complet, point
            if (points.length > 4 || (points.length > 3 && complet)|| 
                (points.length > 2 && event.order == 1) || 
                (points.length > 1 && event.order == 1 && complet) || singlePoint) {
                if (event.order == 2) {
                    var poly = new OpenLayers.Geometry.Polygon([line]);
                    this.popup.location = poly.getBounds().getCenterLonLat();
                } else {
                    this.popup.location = points[points.length-1].getBounds().getCenterLonLat();
                }
                this.popup.position();
                this.popup.show();
                var measure;
                this.popup.update({
                    measure: measure,
                    units: event.units,
                    dim: event.order == 2 ? '<sup>2</sup>' : '',
                    html: this.makeString(event)
                });
            }
        }.createDelegate(this);

        var controlOptions = Ext.apply({}, this.initialConfig.controlOptions);
        Ext.applyIf(controlOptions, {
            geodesic: true,
            persist: true,
            handlerOptions: {layerOptions: {styleMap: styleMap}},
            eventListeners: {
                measurepartial: showPopup,
                measure: function(event) {
                    showPopup(event, true);
                },
                deactivate: function() { this.popup && this.popup.hide(); },
                scope: this
            }
        });
        var measureControl = (handlerType == OpenLayers.Handler.Point) ?
            new cgxp.plugins.Measure.LocatorControl(controlOptions) :
            new OpenLayers.Control.Measure(handlerType, controlOptions);

        return measureControl;
    },

    makePointString: function(metric, unit) {
        if (unit == 'm') {
            if (!this.pointMeterTemplate) {
                this.pointMeterTemplate = new Ext.Template(
                        '<table class="measure point"><tr>' +
                        '<td>' + OpenLayers.i18n('Coordinate') + '</td>' + 
                        '<td>{lonm}  {latm} m</td>' +
                        '</tr><tr>' +
                        '<td>' + OpenLayers.i18n('WGS 84') + '</td>' +
                        '<td>{lond} {latd}°</td>' + 
                        '</tr></table>', {compiled: true});
            }

            var metricLonLat = new OpenLayers.LonLat(metric.x, metric.y).transform(
                    this.target.mapPanel.map.getProjectionObject(),
                    new OpenLayers.Projection("EPSG:4326"));
            return this.pointMeterTemplate.apply({
                lonm: metric.x.toFixed(1), latm: metric.y.toFixed(1),
                lond: metricLonLat.lon.toFixed(5), latd: metricLonLat.lat.toFixed(5)
            });
        }
        else {
            if (!this.pointTemplate) {
                this.pointTemplate = new Ext.Template(
                        OpenLayers.i18n('eastern:') + ' {lon} {unit}<br />' +
                        OpenLayers.i18n('northern:') + ' {lat} {unit}',
                        {compiled: true});
            }
            return this.pointTemplate.apply({
                lon: metric.x.toFixed(5), 
                lat: metric.y.toFixed(5),
                unit: metricUnit
            });
        }
    },

    makeString: function(metricData) {
        var metric = metricData.measure;
        var metricUnit = metricData.units;

        if (metricData.geometry.CLASS_NAME.indexOf("Point") > -1) {
            return this.makePointString(metric, metricUnit);
        }

        var dim = metricData.order == 2 ?
        '<sup>2</sup>' :
        '';

        return metric.toFixed(2) + " " + metricUnit + dim;
    },

    /** api: method[addActions]
     */
    addActions: function() {
        this.activeIndex = 1;
        this.button = new Ext.SplitButton({
            iconCls: "cgxp-icon-measure-length",
            tooltip: this.measureTooltip,
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            allowDepress: true,
            handler: function(button, event) {
                if(button.pressed) {
                    button.menu.items.itemAt(this.activeIndex).setChecked(true);
                }
            },
            scope: this,
            listeners: {
                toggle: function(button, pressed) {
                    // toggleGroup should handle this
                    if(!pressed) {
                        button.menu.items.each(function(i) {
                            i.setChecked(false);
                        });
                    }
                },
                render: function(button) {
                    // toggleGroup should handle this
                    Ext.ButtonToggleMgr.register(button);
                }
            },
            menu: new Ext.menu.Menu({
                items: [
                    new Ext.menu.CheckItem(
                        new GeoExt.Action({
                            text: this.pointMenuText,
                            iconCls: "cgxp-icon-measure-point",
                            toggleGroup: this.toggleGroup,
                            group: this.toggleGroup,
                            listeners: {
                                checkchange: function(item, checked) {
                                    this.activeIndex = 0;
                                    this.button.toggle(checked);
                                    if (checked) {
                                        this.button.setIconClass(item.iconCls);
                                    }
                                    this.cleanup();
                                },
                                scope: this
                            },
                            map: this.target.mapPanel.map,
                            control: this.createMeasureControl(
                                OpenLayers.Handler.Point, this.pointTooltip
                            )
                        })
                    ),
                    new Ext.menu.CheckItem(
                        new GeoExt.Action({
                            text: this.lengthMenuText,
                            iconCls: "cgxp-icon-measure-length",
                            toggleGroup: this.toggleGroup,
                            group: this.toggleGroup,
                            listeners: {
                                checkchange: function(item, checked) {
                                    this.activeIndex = 1;
                                    this.button.toggle(checked);
                                    if (checked) {
                                        this.button.setIconClass(item.iconCls);
                                    }
                                    this.cleanup();
                                },
                                scope: this
                            },
                            map: this.target.mapPanel.map,
                            control: this.createMeasureControl(
                                OpenLayers.Handler.Path, this.lengthTooltip
                            )
                        })
                    ),
                    new Ext.menu.CheckItem(
                        new GeoExt.Action({
                            text: this.areaMenuText,
                            iconCls: "cgxp-icon-measure-area",
                            toggleGroup: this.toggleGroup,
                            group: this.toggleGroup,
                            allowDepress: false,
                            listeners: {
                                checkchange: function(item, checked) {
                                    this.activeIndex = 2;
                                    this.button.toggle(checked);
                                    if (checked) {
                                        this.button.setIconClass(item.iconCls);
                                    }
                                    this.cleanup();
                                },
                                scope: this
                            },
                            map: this.target.mapPanel.map,
                            control: this.createMeasureControl(
                                OpenLayers.Handler.Polygon, this.areaTooltip
                            )
                        })
                    )
                ]
            })
        });

        return cgxp.plugins.Measure.superclass.addActions.apply(this, [this.button]);
    }
        
});

Ext.preg(cgxp.plugins.Measure.prototype.ptype, cgxp.plugins.Measure);


/**
 * Class: cgxp.plugins.Measure.LocatorControl
 * Allows for drawing of point features for position measurements.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.Measure.LocatorControl = OpenLayers.Class(OpenLayers.Control, { 
    
    /**
     * APIProperty: displayProjection
     * {<OpenLayers.Projection>} The projection in which the 
     * position is displayed
     */
    displayProjection: null,
    
    /**
     * APIProperty: handlerOptions
     * {Object} ReadOnly options for point handler
     */
    handlerOptions: null,
    
    /**
     * Constant: EVENT_TYPES
     *
     * Supported event types:
     * measure - Triggered when a point is drawn
     */
    EVENT_TYPES: ['measure'],

    /**
     * Constructor: cgxp.plugins.Measure.LocatorControl
     * Create a new locator control to get point position
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        this.EVENT_TYPES =
            cgxp.plugins.Measure.LocatorControl.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.handler = new OpenLayers.Handler.Point(this, {
            'done': this.onPoint
        }, OpenLayers.Util.extend({
            persist: true
        }, this.handlerOptions));
    },

    /**
     * Method: onPoint
     * Callback executed on sketch done.
     */
    onPoint: function(geometry) {
        var units, displayProjection = this.displayProjection;
        if(displayProjection) {
            var mapProjection = this.map.getProjectionObject();
            geometry.transform(mapProjection, displayProjection);
            units = this.displayProjection.getUnits();
        } else {
            units = this.map.getUnits();
        }
        this.events.triggerEvent('measure', {
            measure: {x: geometry.x, y: geometry.y},
            units: units,
            geometry: geometry
        });
    },
    
    /**
     * APIMethod: cancel
     * Stop the control from measuring. The temporary sketch will be erased.
     */
    cancel: function() {
        this.handler.cancel();
    },
    
    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced. 
     */
    destroy: function() {
        this.handler = null;
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    
    CLASS_NAME: "cgxp.plugins.Measure.LocatorControl"
});
