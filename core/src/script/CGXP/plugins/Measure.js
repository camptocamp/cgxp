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
 *    This plugin adds a menu with menu items for selecting measure tools.
 *
 *    The menu div is assigned the ``cgxp-menu-measure`` class name, which
 *    can be useful for styling.
 */
cgxp.plugins.Measure = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_measure */
    ptype: "cgxp_measure",

    /** api: config[minAzimuth]
     *  ``Number`` the minimum azimuth value, e.g. -180, default is 0.
     */
    minAzimuth: 0,

    /** api: config[actionConfig]
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

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

    /** api: config[azimuthMenuText]
     *  ``String``
     *  Text for azimuth menu item (i18n).
     */
    azimuthMenuText: "Azimuth",

    /** api: config[coordinateText]
     *  ``String``
     *  Text to display in point mesure tooltip.
     */
    coordinateText: "Coordinate: ",

    /** api: config[easternText]
     *  ``String``
     *  Text to display in point mesure tooltip.
     */
    easternText: "Eastern: ",

    /** api: config[northernText]
     *  ``String``
     *  Text to display in point mesure tooltip.
     */
    northernText: "Northern: ",

    /** api: config[distanceText]
     *  ``String``
     *  Text to display in point azimuth tooltip.
     *  Not taken into account if azimuthTemplate is set.
     */
    distanceText: "Distance: ",

    /** api: config[azimuthText]
     *  ``String``
     *  Text to display in point azimuth tooltip.
     *  Not taken into account if azimuthTemplate is set.
     */
    azimuthText: "Azimuth: ",

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

    /** api: config[azimuthTooltip]
     *  ``String``
     *  Text for azimuth action tooltip (i18n).
     */
    azimuthTooltip: "Measure azimuth",

    /** api: config[measureTooltip]
     *  ``String``
     *  Text for measure action tooltip (i18n).
     */
    measureTooltip: "Measure",

    /** api: config[azimuthTemplate]
     *  ``String``
     *  The template string to be used to display the azimut (i18n).
     *
     *  Here is an example of how it can look like:
     *
     *  .. code-block:: javascript
     *
     *      azimuthTemplate: '<table class="measure">' +
     *          '<tr><td>Distance : </td><td>{distance} {units}</td></tr>' +
     *          '<tr><td>Azimut : </td><td>{azimuth}&deg;</td></tr>' +
     *          '<tr><td>Altitude diff. : </td>' +
     *          '<tpl if="raster != false">' +
     *              '<td>{[Math.round(values.raster[1].mnt - values.raster[0].mnt, 2)]} {mapUnits}</td></tr>' +
     *          '</tpl>' +
     *          '<tpl if="raster == false">' +
     *              '<td> ... </td></tr>' +
     *          '</tpl>' +
     *          '</table>'
     */
    azimuthTemplate: null,

    /** api: config[pointMeterTemplate]
     *  ``Ext.Template``
     *  The template object used to display metric coordinates.
     *
     *  Standard value is:
     *
     *  .. code-block:: javascript
     *
     *      this.pointMeterTemplate = new Ext.Template(
     *              '<table class="measure point"><tr>',
     *              '<td>', this.coordinateText, '</td>',
     *              '<td>{lonm}  {latm} m</td>',
     *              '</tr><tr>',
     *              '<td>WGS 84: </td>',
     *              '<td>{lond} {latd}</td>',
     *              '</tr></table>', {compiled: true});
     */
    pointMeterTemplate: null,
    
    /** api: config[pointTemplate]
     *  ``Ext.Template``
     *  The template object used to display coordinates.
     *
     *  Standard value is:
     *
     *  .. code-block:: javascript
     *
     *      this.pointTemplate = new Ext.Template(
     *          this.easternText, ' {lon} {unit}<br />',
     *          this.northernText, ' {lat} {unit}',
     *          {compiled: true});
     */
    pointTemplate: null,

    /** api: config[controlOptions]
     *  ``Object``
     *  Allow to customise the handler behavior.
     *
     *  To enable on-the-fly measurement (ie. not only after mouse click), set 
     *  the attribute 'immediate' to true.
     *  On-the-fly measurement is compatible with both 'follow' and 'fixed' popup 
     *  positionning.
     *
     *  Example:
     *
     *  .. code-block:: javascript
     *
     *     controlOptions: {
     *        immediate: true
     *     }
     */
    controlOptions: {},

    popup: null,

    /** api: config[popupPosition]
     *  ``Object``
     *  (optional) Set the position behaviour for the popup.
     *  By default the popup follow the mouse click (GeoExt.Popup), but it can
     *  also be fixed to a specific position in the viewport (Ext.Window) with
     *  predefined positionning which can be adjusted in x and/or y
     *  
     *  position: 'follow' or 'fixed'
     *  Default: 'follow'
     * 
     *  if position is 'fixed', the additionals parameters are supported:
     *
     *  anchor: one of 'tl','t','tr','l','c','r','bl','b','br'
     *  Default: 't'
     *
     *  offsetx: int
     *  Default: 0
     *
     *  offsety: int
     *  Default: 0
     *
     *  Example:
     *
     *  .. code-block:: javascript
     *
     *      popupPosition: {
     *          'position': 'fixed',
     *          'anchor': 'tl',
     *          'offsetx': 30,
     *          'offsety': 10
     *      }
     */
    popupPosition: {},

    /** api: config[symbolizers]
     *  ``Object``
     *  (optional) Styles of the features drawn on the map when measuring.
     *  If provided they will override the default styles.
     *  Possible symbolizer types are "Point", "Line" and "Polygon".
     *
     *  Example:
     *
     *  .. code-block:: javascript
     *
     *      symbolizers: {
     *          "Point": {
     *              pointRadius: 10,
     *              graphicName: "square",
     *              fillColor: "blue",
     *              strokeWidth: 1,
     *              strokeColor: "red"
     *          }
     *      }
     */
    symbolizers: {},

    /** api: config[azimuthSymbolizers]
     *  ``Object``
     *  (optional) Styles of the features drawn on the map when measuring
     *  azimuths. If provided they will override the default
     *  styles. Possible symbolizer types are "Point", "Line" and "Polygon".
     *  See ``symbolizers`` for an example.
     */
    azimuthSymbolizers: {},

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
                    symbolizer: Ext.apply({
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
                    }, this.symbolizers)
                })]
            })
        });


        var controlOptions = Ext.apply({}, this.initialConfig.controlOptions);
        Ext.applyIf(controlOptions, {
            geodesic: true,
            persist: true,
            handlerOptions: {layerOptions: {styleMap: styleMap}},
            eventListeners: {
                measurepartial: function(event) {
                    this.showPopup(event, title);
                },
                measure: function(event) {
                    this.showPopup(event, title);
                },
                deactivate: function() {
                    this.popup && this.popup.hide();
                },
                scope: this
            }
        });
        var measureControl = (handlerType == OpenLayers.Handler.Point) ?
            new cgxp.plugins.Measure.LocatorControl(controlOptions) :
            new OpenLayers.Control.Measure(handlerType, controlOptions);

        return measureControl;
    },

    /** private: method[showPopup]
     * :param: event: the `Object` containing information about what to display
     *     in the popup
     * :param: title: `String` the title for the popup
     */
    showPopup: function(event, title) {
        if (!this.popup) {
            if (this.popupPosition.position == 'fixed') {
                this.popup = new Ext.Window({
                    border: false,
                    fixed: true,
                    map: this.target.mapPanel.map,                    
                    closeAction: 'hide',
                    listeners: {
                        render: function() {
                            // popup must be rendered to by aligned
                            this.popup.alignTo(this.target.mapPanel.getEl(), 
                                    this.popupPosition.anchor || 't',
                                    [this.popupPosition.offsetx || 0,
                                     this.popupPosition.offsety || 0]
                                    );
                        },
                        scope: this
                    }
                });
            } else {
                this.popup = new GeoExt.Popup({
                    border: false,
                    map: this.target.mapPanel.map,
                    unpinnable: false,
                    closeAction: 'hide',
                    location: new OpenLayers.LonLat(0, 0)
                });
            }
            if (Ext.isIE7) {
                // IE7 needs an explicit width.
                this.popup.setWidth(200);
            }
        }
        if (!this.controlOptions.immediate) {
            this.popup.hide();
        }
        this.popup.setTitle(title);

        var order = event.order,
            geom = event.geometry;

        var measure = (order) ?
            event.measure.toFixed(2) : event.measure;

        if (!order || measure > 0) {
            if (!this.popup.fixed) {
                if (order == 2) {
                    geom = geom.getCentroid();
                } else if (order == 1 || event.azimuth !== undefined) {
                    geom = geom.components[geom.components.length - 1];
                }
                this.popup.location = new OpenLayers.LonLat(geom.x, geom.y);
                this.popup.position();
            }
            if (this.popup.hidden) {
                this.popup.show();           
            }
            this.popup.update({
                html: this.makeString(event)
            });
        }
    },

    /**
     * Method: createSegmentMeasureControl
     */
    createSegmentMeasureControl: function() {
        // style the sketch fancy
        var azimuthSymbolizers = Ext.apply({
            "Point": {
                pointRadius: 6,
                graphicName: "cross",
                fillColor: "#FF0000",
                fillOpacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333"
            },
            "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#FF0000"
            },
            "Polygon": {
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#FF0000",
                fillOpacity: 0
            }
        }, this.azimuthSymbolizers);
        var style = new OpenLayers.Style();
        style.addRules([
            new OpenLayers.Rule({symbolizer: azimuthSymbolizers})
        ]);
        var styleMap = new OpenLayers.StyleMap({"default": style});
        var control = new cgxp.plugins.Measure.SegmentMeasureControl({
            geodesic: true,
            rasterServiceUrl: this.rasterServiceUrl,
            handlerOptions: {
                layerOptions: {styleMap: styleMap}
            }
        });
        control.events.on({
            "measure": function(event) {
                this.showPopup(event, this.azimuthTooltip);
            },
            scope: this
        });
        return control;
    },

    makePointString: function(metric, unit) {
        if (unit == 'm') {
            if (!this.pointMeterTemplate) {
                this.pointMeterTemplate = new Ext.Template(
                        '<table class="measure point"><tr>',
                        '<td>', this.coordinateText, '</td>',
                        '<td>{lonm}  {latm} m</td>',
                        '</tr><tr>',
                        '<td>WGS 84: </td>',
                        '<td>{lond} {latd}°</td>',
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
                        this.easternText, ' {lon} {unit}<br />',
                        this.northernText, ' {lat} {unit}',
                        {compiled: true});
            }
            return this.pointTemplate.apply({
                lon: metric.x.toFixed(5),
                lat: metric.y.toFixed(5),
                unit: metricUnit
            });
        }
    },

    makeAzimuthString: function(e) {
        e.distance = e.distance.toFixed(3);
        var tpl = new Ext.XTemplate(this.azimuthTemplate ||
            '<table class="measure">' +
            '<tr><td>' + this.distanceText + '</td><td>{distance} {units}</td></tr>' +
            '<tr><td>' + this.azimuthText + '</td><td>{azimuth}&deg;</td></tr>' +
            '</table>'
        );
        return tpl.apply(e);
    },

    makeString: function(metricData) {
        var metric = metricData.measure;
        var metricUnit = metricData.units;

        if (metricData.geometry.CLASS_NAME.indexOf("Point") > -1) {
            return this.makePointString(metric, metricUnit);
        } else if (metricData.azimuth !== undefined) {
            return this.makeAzimuthString(metricData);
        }

        var dim = metricData.order == 2 ?
            '<sup>2</sup>' : '';

        return metric.toFixed(2) + " " + metricUnit + dim;
    },

    /** private: method[addActions]
     */
    addActions: function() {
        this.activeIndex = 1;
        function setActiveItem(item, checked) {
            this.activeIndex = this.button.menu.items.indexOf(item);
            this.button.toggle(checked);
            if (checked) {
                this.button.setIconClass(item.iconCls);
            }
            this.cleanup();
        }
        this.button = new Ext.SplitButton(Ext.apply({
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
                cls: 'cgxp-menu-measure',
                items: [
                    new Ext.menu.CheckItem(
                        new GeoExt.Action({
                            text: this.pointMenuText,
                            iconCls: "cgxp-icon-measure-point",
                            toggleGroup: this.toggleGroup,
                            group: this.toggleGroup,
                            listeners: {
                                checkchange: setActiveItem,
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
                                checkchange: setActiveItem,
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
                                checkchange: setActiveItem,
                                scope: this
                            },
                            map: this.target.mapPanel.map,
                            control: this.createMeasureControl(
                                OpenLayers.Handler.Polygon, this.areaTooltip
                            )
                        })
                    ),
                    new Ext.menu.CheckItem(
                        new GeoExt.Action({
                            text: this.azimuthMenuText,
                            iconCls: "cgxp-icon-measure-azimuth",
                            toggleGroup: this.toggleGroup,
                            group: this.toggleGroup,
                            allowDepress: false,
                            listeners: {
                                checkchange: setActiveItem,
                                scope: this
                            },
                            map: this.target.mapPanel.map,
                            control: this.createSegmentMeasureControl(
                                this.azimuthTooltip
                            )
                        })
                    )
                ]
            })
        }, this.actionConfig));

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

/**
 * @requires OpenLayers/Control/Measure.js
 */

/**
 * Class: cgxp.plugins.Measure.SegmentMeasureControl
 * Control to measure segment length (ie. for azimuth)
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.Measure.SegmentMeasureControl = OpenLayers.Class(OpenLayers.Control.Measure, {

    // we want to have partial measures each time the mouse is moved
    partialDelay: 0,

    persist: true,

    /**
     * APIProperty: rasterServiceUrl
     * {String} The url to the elevation service
     */
    rasterServiceUrl: null,

    /**
     * Property: raster
     * {Array} Raster service responses
     */
    raster: null,

    /**
     * Property: measuring
     * {Boolean} Indicate if currently measuring. Measuring
     *     starts when the first point of the segment is added.
     */
    measuring: false,

    /**
     * Property: pendingRequests
     * {Array} the raster service pending requests
     */
    pendingRequests: null,

    /**
     * Constructor: cgxp.plugins.Measure.SegmentMeasureControl
     * Create a new segment measure control to get azimuth
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        var handler = cgxp.plugins.Measure.Segment;
        this.callbacks = {
            point: this.startMeasuring,
            modify: this.measureDrawing,
            done: this.measureDone,
            cancel: this.measureCancel
        };
        this.pendingRequests = new Array(2);
        OpenLayers.Control.Measure.prototype.initialize.call(
                this, handler, options);
    },

    /**
     * Method: startMeasuring
     */
    startMeasuring: function() {
        this.measuring = true;
    },

    /**
     * Method: measureDrawing
     */
    measureDrawing: function(point, feature) {
        if (this.measuring) {
            var geometry = feature.geometry.clone();
            this.measure(geometry);
            this.raster = new Array(2);
        }
    },

    /**
     * Method: measureDone
     */
    measureDone: function(geometry) {
        this.measuring = false;
        this.measure(geometry);
    },

    /**
     * Method: measureCancel
     */
    measureCancel: function() {
        this.measuring = false;
    },

    /**
     * Method: measure
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     */
    measure: function(geometry) {
        function onRasterResponse(index, response) {
            this.raster[index] = Ext.util.JSON.decode(response.responseText);
            if (this.raster[0] && this.raster[1]) {
                onMeasure.call(this, this.raster);
            }
        }
        function onMeasure(raster) {
            var stat = this.getBestLength(geometry),
                azimuth = this.getAzimuth(geometry),
                distance = stat[0],
                values = {
                    distance: distance,
                    units: stat[1],
                    mapUnits: this.map.getUnits(),
                    azimuth: azimuth,
                    geometry: geometry
                };
            if (raster) {
                values.raster = raster;
            } else {
                values.raster = false;
            }
            if (distance !== 0 && !isNaN(azimuth)) {
                this.events.triggerEvent('measure', values);
            }
        }
        onMeasure.call(this);
        if (this.rasterServiceUrl) {
            for (var i = 0; i <=1; i++) {
                Ext.Ajax.abort(this.pendingRequests[i]);
                this.pendingRequests[i] = Ext.Ajax.request({
                    url: this.rasterServiceUrl,
                    method: 'GET',
                    params: {
                        lon: geometry.components[i].x,
                        lat: geometry.components[i].y
                    },
                    success: OpenLayers.Function.bind(
                        onRasterResponse, this, i),
                    scope: this
                });
            }
        }
    },

    /**
     * Method: getAzimuth
     * Gets the azimuth
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     *
     * Returns:
     * {Float} Returns the azimuth
     */
    getAzimuth: function(geometry) {
        // prevent errors with 1 length strings
        if (geometry.components.length <= 1) {
            return;
        }
        // we consider that we don't use geodetic
        var pt1 = geometry.components[0];
        var pt2 = geometry.components[1];
        var x = pt2.x - pt1.x;
        var y = pt2.y - pt1.y;

        var rad = Math.acos( y / Math.sqrt( x * x + y * y));
        // negative or positive
        var factor = x > 0 ? 1 : -1;

        var azimuth = Math.round(factor * rad * 180 / Math.PI);
        return cgxp.tools.modulo(azimuth - this.minAzimuth, 360) + this.minAzimuth;
    },

    CLASS_NAME: "cgxp.plugins.Measure.SegmentMeasureControl"
});

/**
 * @requires OpenLayers/Handler/Path.js
 */

/**
 * Class: cgxp.plugins.Measure.Segment
 * Handler to draw a segment on the map.
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Path>
 */
cgxp.plugins.Measure.Segment = OpenLayers.Class(OpenLayers.Handler.Path, {

    /**
     * Property: origin
     * {<OpenLayers.Feature.Vector>} The origin of the segment, first clicked
     * point
     */
    origin: null,

    /**
     * Property: target
     * {<OpenLayers.Feature.Vector>} The target of the segment, second clicked
     * point
     */
    target: null,

    /**
     * Property: circle
     * {<OpenLayers.Feature.Vector>} The circle which radius is the drawn
     *     segment
     */
    circle: null,

    /**
     * Property: _drawing
     * {Boolean} Indicate if in the process of drawing a segment.
     *    (We prefix the variable name with an underscore not to
     *     collide with a "drawing" property of the parent.)
     */
    _drawing: false,

    /**
     * Constructor: cgxp.plugins.Measure.Segment
     */
    initialize: function(control, callbacks, options) {
        options = options || {};
        options.maxVertices = 2;
        options.persist = true;
        options.freehandToggle = null;
        OpenLayers.Handler.Path.prototype.initialize.apply(
            this, [control, callbacks, options]);
    },

    /**
     * Method: addPoint
     */
    addPoint: function() {
        OpenLayers.Handler.Path.prototype.addPoint.apply(this, arguments);
        var numVertices = this.line.geometry.components.length;
        if (numVertices == 2) {
            var feature = this.origin = new OpenLayers.Feature.Vector(
                this.line.geometry.components[0].clone());
            this.layer.addFeatures([feature], {silent: true});
            this._drawing = true;
        }
    },

    /**
     * Method: finishGeometry
     */
    finishGeometry: function() {
        var components = this.line.geometry.components;
        this.target = new OpenLayers.Feature.Vector(
                components[components.length-2].clone());
        this.layer.addFeatures([this.target], {silent: true});
        this._drawing = false;
        OpenLayers.Handler.Path.prototype.finishGeometry.apply(
                this, arguments);
    },

    /**
     * Method: destroyPersistedFeature
     */
    destroyPersistedFeature: function() {
        OpenLayers.Handler.Path.prototype.destroyPersistedFeature.apply(
            this, arguments);
        if (this.layer) {
            if (this.origin) {
                this.origin.destroy();
                this.origin = null;
            }
            if (this.target) {
                this.target.destroy();
                this.target = null;
            }
            if (this.circle) {
                this.circle.destroy();
                this.circle = null;
            }
        }
    },

    /**
     * Method: modifyFeature
     */
    modifyFeature: function() {
        OpenLayers.Handler.Path.prototype.modifyFeature.apply(
            this, arguments);
        if (this._drawing) {
            if (this.circle) {
                this.layer.removeFeatures([this.circle]);
            }
            var geometry = OpenLayers.Geometry.Polygon.createRegularPolygon(
                this.origin.geometry, this.line.geometry.getLength(), 40
            );
            this.circle = new OpenLayers.Feature.Vector(geometry);
            this.layer.addFeatures([this.circle], {silent: true});
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Handler.Path.prototype.deactivate.call(this)) {
            this._drawing = false;
            return true;
        }
        return false;
    },

    /**
     * Method: dblclick
     */
    dblclick: function() {
        // we don't want double click
    },

    CLASS_NAME: "cgxp.plugins.Measure.Segment"
});
