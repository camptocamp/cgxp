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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Point.js
 * @include OpenLayers/Geometry/LineString.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Renderer/SVG.js
 * @include OpenLayers/Renderer/VML.js
 * @include OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Control/ModifyFeature.js
 */

/** api: (define)
 * module = cgxp
 * class = RoutingPanel
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: RoutingPanel(config)
 *
 */
cgxp.RoutingPanel = Ext.extend(
  Ext.form.FormPanel, {

    /** private: property[map]
     */
    map: null,

    /** private: property[map]
     */
    routingService: null,

    searchOptions: null,

    /** api: config[zoomToRouteLevel]
     *  ``Integer``
     *  The zoom level to zoom to when a user clicks on
     *  one of the directions in the list view.  Default 15
     */
    zoomToRouteLevel: 15,

    /** api: config[vectorLayerConfig]
     *  ``Object``
     *  Optional configuration of the vector layer.
     */
    vectorLayerConfig: {},

    /** api: config[directionsTpl]
     *  ``XTemplate`` used to format driving directions.  There are four
     *  specific formatters added to Ext.util.Format for routing:
     *
     *  * ``Ext.util.Format.routeImage`` - creates an img tag with an image
     *    from directionType. Invoke with ``{directionType:routeImage}``
     *  * ``Ext.util.Format.routeDistance`` - formats the distance as m or
     *    km with variable decimal places depending on distance.  Invoke
     *    with ``{distance:routeDistance}``
     *  * ``Ext.util.Format.routeTime`` - formats the time as "h m s"
     *    appropriately. Invoke with ``{time:routeTime}``
     *  * ``Ext.util.Format.routeDirection`` - formats a translated version of
     *    the driving directions for a given directionType.  This formatter
     *    expects to be passed the entire record and should be invoked using
     *    ``{[Ext.util.Format.routeDirection(values)]} to work correctly.
     */
    directionsTpl: '<div style="float:left; width: 30px;">{directionType:routeImage}</div><div style="float: right; width: 40px; text-align: right; ">{distance:routeDistance}</div><div style="margin:0 40px 0 30px; white-space: normal">{[Ext.util.Format.routeDirection(values)]}</div>',

    // i18n
    sourcefieldLabel: "",
    sourcefieldValue: "",
    sourceButtonLabel: '',
    targetfieldLabel: "",
    targetfieldValue: "",
    targetButtonLabel: '',
    routeenginefieldLabel: '',
    zoombuttonLabel: '',
    resetbuttonLabel: '',
    reversebuttonLabel: '',
    routeDescriptionLabel: '',
    totalDistanceLabel: '',
    totalTimeLabel: '',
    directionsLabel: '',
    loadingRouteLabel: '',
    noRouteLabel: '',
    routeErrorTitle: '',

    /** api: config[routeStyleConfig]
     *  ``Object``
     *  Optional configuration of the route feature.
     */
    routeStyleConfig: {
      strokeColor: '#0000ff',
      strokeWidth: 5,
      strokeOpacity: 0.75
    },

    /** api: config[newRouteStyleConfig]
     *  ``Object``
     *  Optional configuration of the new route feature.
     */
    newRouteStyleConfig: {
      strokeColor: '#ffff00',
      strokeWidth: 5,
      strokeOpacity: 0.6
    },

    /** api: config[sourceStyleConfig]
     *  ``Object``
     *  Optional configuration of the source feature.
     */
    sourceStyleConfig: {
      graphicOpacity: 1,
      graphicWidth: 23,
      graphicHeight: 34,
      graphicYOffset: -34,
      graphicZIndex: 2000,
      externalGraphic: '../src/theme/img/route_source.png'
    },

    /** api: config[targetStyleConfig]
     *  ``Object``
     *  Optional configuration of the target feature.
     */
    targetStyleConfig: {
      graphicOpacity: 1,
      graphicWidth: 23,
      graphicHeight: 34,
      graphicYOffset: -34,
      graphicZIndex: 2000,
      externalGraphic: '../src/theme/img/route_target.png'
    },

    /** api: config[highlightStyleConfig]
     *  ``Object``
     *  Optional configuration of the highlight feature.
     */
    highlightStyleConfig: {
      graphicName: 'circle',
      pointRadius: 10,
      strokeOpacity: 1,
      strokeWidth: 2,
      strokeColor: '#ffffff',
      fillOpacity: 0.25,
      fillColor: '#ff00ff'
    },

    /** api: config[viaStyleConfig]
     *  ``Object``
     *  Optional configuration of the via features.
     */
    viaStyleConfig: {
      graphicOpacity: 1,
      graphicWidth: 23,
      graphicHeight: 34,
      graphicYOffset: -34,
      graphicZIndex: 2000,
      label: '',
      labelXOffset: 0,
      labelYOffset: 17,
      fontColor: '#000000',
      fontOpacity: 1,
      fontSize: '8px',
      externalGraphic: '../src/theme/img/route_via.png'
    },

  /** private: method[initComponent]
   */
  initComponent: function() {

    this.directionsStore = new Ext.data.JsonStore({
       fields: ['index', 'position', 'directionType', 'roadName', 'distance', 'time', 'compassDirection']
    });

    this.initVectorLayer();
    this.initControls();
    this.initFormItems();

    this.map.events.register('addlayer', this, function(event) {
      if (this.vectorLayer) {
        this.map.raiseLayer(this.vectorLayer, 1);
      }
    });

    this.epsg4326 = new OpenLayers.Projection('EPSG:4326');
    cgxp.RoutingPanel.superclass.initComponent.apply(this, arguments);

    this.directionsStore.loadData([]);
  },

  /** private: method[initVectorLayer]
   */
  initVectorLayer: function() {

    this.routeFeature = null;
    this.sourceFeature = null;
    this.highlightFeature = null;
    this.targetFeature = null;
    this.viaFeatures = [];

    this.newRouteStyle = OpenLayers.Util.applyDefaults(this.newRouteStyleConfig, OpenLayers.Feature.Vector.style['default']);
    this.routeStyle = OpenLayers.Util.applyDefaults(this.routeStyleConfig, OpenLayers.Feature.Vector.style['default']);
    this.sourceStyle = OpenLayers.Util.applyDefaults(this.sourceStyleConfig, OpenLayers.Feature.Vector.style['default']);
    this.targetStyle = OpenLayers.Util.applyDefaults(this.targetStyleConfig, OpenLayers.Feature.Vector.style['default']);
    this.highlightStyle = OpenLayers.Util.applyDefaults(this.highlightStyleConfig, OpenLayers.Feature.Vector.style['default']);
    this.viaStyle = OpenLayers.Util.applyDefaults(this.viaStyleConfig, OpenLayers.Feature.Vector.style['default']);

    this.vectorLayer = new OpenLayers.Layer.Vector(
      OpenLayers.Util.createUniqueID("cgxp"), Ext.apply({
        displayInLayerSwitcher: false,
        alwaysInRange: true
    }, this.vectorLayerConfig));
    this.vectorLayer.events.on({
      'beforefeaturemodified': function(evt) {
        this.modifyControl._unselect = evt.feature;
      },
      'featuremodified': function(evt) {
        if (evt.feature == this.sourceFeature) {
          this.updateSource();
        }
        if (evt.feature == this.targetFeature) {
          this.updateTarget();
        }
        this.vectorLayer.removeFeatures([this.newRouteFeature]);
        this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
      },
      'vertexmodified': function(evt) {
        if (evt.feature == this.sourceFeature || evt.feature == this.targetFeature) {
          this.newRouteFeature = this.computeRoute(this.newRouteFeature, this.newRouteStyle, false);
        }
      },
      'afterfeaturemodified': function(evt) {
        if (!evt.modified && evt.feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Point') {
          this.removeViaPoint(evt.feature);
        }
      },
      scope: this
    })
    this.map.addLayer(this.vectorLayer);
  },

  /** private: method[initControls]
   */
  initControls: function() {
    this.drawControl = new OpenLayers.Control.DrawFeature(this.vectorLayer,
      OpenLayers.Handler.Point, {});

    this.modifyControl = new OpenLayers.Control.ModifyFeature(this.vectorLayer, {
      geometryTypes: ['OpenLayers.Geometry.Point']
    });

    this.viaPointControl = new OpenLayers.Control.AddViaPoint(this.vectorLayer);
    this.viaPointControl.events.on({
      'startviapoint': this.startViaPoint,
      'moveviapoint': this.moveViaPoint,
      'endviapoint': this.endViaPoint,
      scope: this
    });

    this.map.addControls([
      this.drawControl,
      this.modifyControl,
      this.viaPointControl
    ]);

    this.modifyControl.activate();
    this.viaPointControl.activate();
  },

  /** private: method[removeViaPoint]
   *  remove a via point from the route and recalculate the route
   */
  removeViaPoint: function(feature) {
    for (var i=0, n=this.viaFeatures.length; i<n; i++) {
      if (this.viaFeatures[i] == feature) {
        this.vectorLayer.removeFeatures([feature]);
        feature.destroy();
        this.viaFeatures.splice(i, 1);
        break;
      }
    }
    if (i != n) {
      for (i=0, n=this.viaFeatures.length; i<n; i++) {
        this.viaFeatures[i].style.label = ''+(i+1);
        this.vectorLayer.drawFeature(this.viaFeatures[i]);
      }
      this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
    }
  },

  /** private: method[insertViaPoint]
   *  insert a new via point at the correct index based on the
   *  position of the new feature along the existing route and
   *  the positions of the other via points.
   *  Recalculate the routes.
   */
  insertViaPoint: function(feature) {
    var features = this.viaFeatures;
    var components = this.routeFeature.geometry.components;
    var n = components.length;
    var tolerance = this.map.resolution / 2;
    var segment
    var i;
    var j = 0;
    var dist;

    if (features.length == 0) {
      features.push(feature);
    } else {
      for (i=1; i<n; i++) {
        segment = {
          x1: components[i-1].x,
          y1: components[i-1].y,
          x2: components[i].x,
          y2: components[i].y
        };
        dist = OpenLayers.Geometry.distanceToSegment(feature.geometry, segment);
        if (dist.distance < tolerance) {
          // this is where the new feature goes.
          features.splice(j, 0, feature);
          break;
        } else {
          if (features[j].geometry.equals(components[i])) {
            j++;
            if (j >= features.length) {
              features.push(feature);
              break;
            }
          }
        }
      }
      // did the feature get added?
      if (i == n) {
        features.push(feature);
      }
    }
    for (i=0; i<features.length; i++) {
      features[i].style.label = '' + (i+1);
      this.vectorLayer.drawFeature(features[i]);
    }
  },

  /** private: method[startViaPoint]
   *  start rendering a via point in response to a click
   *  and drag on the route feature. Recalculate the route
   *  and render it in the newRouteStyle
   */
  startViaPoint: function(evt) {
    evt.feature.style = OpenLayers.Util.extend({},this.viaStyle);
    this.insertViaPoint(evt.feature);
    if (this.routingService[this.currentEngine].dynamic) {
      this.newRouteFeature = this.computeRoute(this.newRouteFeature, this.newRouteStyle);
    }
  },

  /** private: method[moveViaPoint]
   *  move an existing via point in response to dragging from the route
   *  feature.  Recalculate the route and render it in the newRouteStyle
   */
  moveViaPoint: function(evt) {
    if (this.routingService[this.currentEngine].dynamic) {
      this.computeRoute(this.newRouteFeature, this.newRouteStyle);
    }
  },

  /** private: method[endViaPoint]
   *  Finalize a new via point when the user drops it in a new location.
   *  Recalculate the route and render it in the routeStyle.
   */
  endViaPoint: function(evt) {
    if (this.newRouteFeature) {
      this.vectorLayer.removeFeatures([this.newRouteFeature], {silent:true});
      this.newRouteFeature.destroy();
      this.newRouteFeature = null;
    }
    this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
  },

  /** private: method[computeRoute]
   *  trigger recomputation of a route using the current routing engine.  Fire
   *  a fake beforeload event on the directionsStore so it will show that the
   *  route is loading. Update directions on callback if requested.
   */
  computeRoute: function(routeFeature, style, withInstructions) {
    if (this.sourceFeature && this.targetFeature && this.routingService[this.currentEngine]) {
      var mapProj = this.map.projection;
      var source = this.sourceFeature.geometry.clone();
      source.transform(mapProj, this.epsg4326);
      var target = this.targetFeature.geometry.clone();
      target.transform(mapProj, this.epsg4326);
      var via = [];
      for (var i=0, n=this.viaFeatures.length; i<n; i++) {
        var point = this.viaFeatures[i].geometry.clone();
        point.transform(mapProj, this.epsg4326);
        via.push(point);
      }
      if (!routeFeature) {
        routeFeature = new OpenLayers.Feature.Vector(null, {}, style);
      }
      this.find('itemId', 'directionsPanel')[0].show();
      this.directionsStore.fireEvent('beforeload');
      this.routingService[this.currentEngine].getRoute({
        source: source,
        target: target,
        via: via,
        alternates: false,
        instructions: withInstructions
      }, function(err, route) {
        if (err) {
          this.vectorLayer.removeFeatures([routeFeature],{silent:true});
        } else {
          var geom = new OpenLayers.Geometry.LineString(route.geometry);
          geom.transform(this.epsg4326, this.map.projection);
          if (routeFeature.layer) {
            this.vectorLayer.removeFeatures([routeFeature],{silent:true});
          }
          routeFeature.geometry = geom;
          if (routeFeature == this.routeFeature && this.newRouteFeature) {
            this.vectorLayer.removeFeatures([this.newRouteFeature]);
          }
          this.vectorLayer.addFeatures([routeFeature], {silent:true});
          if (withInstructions && route.instructions) {
            this.updateDirections(route);
          }
        }
      }, this);
    }
    return routeFeature;
  },

  /** private: method[zoomToNode]
   *  zoom to a point in the routeFeature
   */
  zoomToNode: function(position) {
    var geom = this.routeFeature.geometry.components[position];
    this.map.setCenter([geom.x, geom.y], this.zoomToRouteLevel);
    this.highlightNode(position);
  },

  /** private: method[highlightNode]
   *  highlight a point in the routeFeature
   */
  highlightNode: function(position) {
    var geom = this.routeFeature.geometry.components[position].clone();
    if (!this.highlightFeature) {
      this.highlightFeature = new OpenLayers.Feature.Vector(geom, {}, this.highlightStyle);
    } else {
      this.highlightFeature.style.display = '';
      this.highlightFeature.geometry.x = geom.x;
      this.highlightFeature.geometry.y = geom.y;
      this.vectorLayer.drawFeature(this.highlightFeature);
    }
  },

  /** private: method[unhighlightNode]
   *  remove feature highlighting
   */
  unhighlightNode: function() {
    this.highlightFeature.style.display = 'none';
    this.vectorLayer.drawFeature(this.highlightFeature);
  },

  /** private: method[deactivateDrawSource]
   *  after drawing the source feature, deregister event handlers
   */
  deactivateDrawSource: function() {
    this.drawControl.events.unregister('featureadded', this, this.onDrawSource);
    this.drawControl.events.unregister('deactive', this, this.deactivateDrawSource);
  },

  /** private: method[deactivateDrawTarget]
   *  after drawing the target feature, deregister event handlers
   */
  deactivateDrawTarget: function() {
    this.drawControl.events.unregister('featureadded', this, this.onDrawTarget);
    this.drawControl.events.unregister('deactive', this, this.deactivateDrawTarget);
  },

  /** private: method[onDrawSource]
   *  handle the user drawing a new source feature.
   */
  onDrawSource: function(event) {
    if (this.sourceFeature) {
      this.vectorLayer.removeFeatures([this.sourceFeature], {silent:true});
      this.sourceFeature.destroy();
    }
    this.sourceFeature = event.feature;
    this.sourceFeature.style = OpenLayers.Util.extend(this.sourceStyle);
    this.vectorLayer.drawFeature(this.sourceFeature);
    this.drawControl.deactivate();
    this.updateSource();
  },

  /** private: method[onDrawTarget]
   *  handle the user drawing a new target feature.
   */
  onDrawTarget: function(event) {
    if (this.targetFeature) {
      this.vectorLayer.removeFeatures([this.targetFeature], {silent: true});
      this.targetFeature.destroy();
    }
    this.targetFeature = event.feature;
    this.targetFeature.style = OpenLayers.Util.extend(this.targetStyle);
    this.vectorLayer.drawFeature(this.targetFeature);
    this.drawControl.deactivate();
    this.updateTarget();
  },

  /** private: method[updateSource]
   *  after drawing a source feature, get the nearest node from the routing
   *  engine and update recompute the route.
   */
  updateSource: function() {
    var geom = this.sourceFeature.geometry.clone();
    geom.transform(this.map.projection, this.epsg4326);
    this.routingService[this.currentEngine].getNearest(geom, function(err, nearest) {
      if (err) {
        this.vectorLayer.removeFeatures([this.sourceFeature]);
        this.sourceFeature.destroy();
        this.sourceFeature = null;
        this.find('itemId', 'sourceComposite')[0].items.items[0].setValue('');
        if (this.routeFeature) {
          this.vectorLayer.removeFeatures([this.routeFeature]);
          this.directionsStore.loadData([]);
        }
        this.find('itemId', 'directionsPanel')[0].hide();
      } else {
        this.sourceFeature.geometry.x = nearest.x;
        this.sourceFeature.geometry.y = nearest.y;
        this.sourceFeature.geometry.transform(this.epsg4326, this.map.projection);
        this.vectorLayer.drawFeature(this.sourceFeature);
        var text = nearest.name || nearest.x + ', ' + nearest.y;
        this.find('itemId', 'sourceComposite')[0].items.items[0].setValue(text);
        this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
      }
    }, this);
  },

  /** private: method[updateTarget]
   *  after drawing a target feature, get the nearest node from the routing
   *  engine and update recompute the route.
   */
  updateTarget: function() {
    var geom = this.targetFeature.geometry.clone();
    geom.transform(this.map.projection, this.epsg4326);
    this.routingService[this.currentEngine].getNearest(geom, function(err, nearest) {
      if (err) {
        this.vectorLayer.removeFeatures([this.targetFeature]);
        this.targetFeature.destroy();
        this.targetFeature = null;
        this.find('itemId', 'targetComposite')[0].items.items[0].setValue('');
        if (this.routeFeature) {
          this.vectorLayer.removeFeatures([this.routeFeature]);
          this.directionsStore.loadData([]);
        }
        this.find('itemId', 'directionsPanel')[0].hide();
      } else {
        this.targetFeature.geometry.x = nearest.x;
        this.targetFeature.geometry.y = nearest.y;
        this.targetFeature.geometry.transform(this.epsg4326, this.map.projection);
        this.vectorLayer.drawFeature(this.targetFeature);
        var text = nearest.name || nearest.x + ', ' + nearest.y;
        this.find('itemId', 'targetComposite')[0].items.items[0].setValue(text);
        this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
      }
    }, this);
  },

  /** private: method[updateDirections]
   *  update the directions store with new driving instructions
   */
  updateDirections: function(route) {
    this.directionsStore.loadData(route.instructions);
    this.find('id', 'routeDescription')[0].update({
      distance: Ext.util.Format.routeDistance(route.distance),
      time: Ext.util.Format.routeTime(route.time)
    });
  },

  setSource: function(geom) {
    if (this.sourceFeature) {
      this.sourceFeature.geometry.x = geom.x;
      this.sourceFeature.geometry.y = geom.y;
      this.vectorLayer.drawFeature(this.sourceFeature);
    } else {
      this.sourceFeature = new OpenLayers.Feature.Vector(geom, {}, this.sourceStyle);
      this.vectorLayer.addFeatures([this.sourceFeature]);
    }
    this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
  },

  setTarget: function(geom) {
    if (this.targetFeature) {
      this.targetFeature.geometry.x = geom.x;
      this.targetFeature.geometry.y = geom.y;
      this.vectorLayer.drawFeature(this.targetFeature);
    } else {
      this.targetFeature = new OpenLayers.Feature.Vector(geom, {}, this.targetStyle);
      this.vectorLayer.addFeatures([this.targetFeature]);
    }
    this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
  },

  /** private: method[initFormItems]
   */
  initFormItems: function() {
    var items = [];

    items.push({
      xtype: 'compositefield',
      itemId: 'sourceComposite',
      fieldLabel: this.sourcefieldLabel,
      items: [new cgxp.FullTextSearch(Ext.apply({
            url: this.searchOptions.url,
            listeners: {
              'applyposition': {
                fn: function(pos) {
                  var geom = new OpenLayers.Geometry.Point(pos.lon,pos.lat);
                  this.setSource(geom);
                },
                scope: this
              },
              select: {
                fn: function(combo, record, index) {
                  var geom = record.data.feature.geometry.getCentroid();
                  this.setSource(geom);
                },
                scope: this
              }
            }
        }, this.searchOptions.widgetOptions)
      ),{
        xtype: 'button',
        text: this.sourceButtonLabel,
        handler: Ext.createDelegate(function() {
          if (this.drawControl.active) {
            this.drawControl.deactivate();
          }
          this.drawControl.events.on({
            'featureadded': this.onDrawSource,
            'deactivate': this.deactivateDrawSource,
            scope: this
          });
          this.drawControl.activate();
        }, this)
      }]
    });
    items.push({
      xtype: 'compositefield',
      itemId: 'targetComposite',
      fieldLabel: this.targetfieldLabel,
      items: [new cgxp.FullTextSearch(Ext.apply({
            url: this.searchOptions.url,
            listeners: {
              'applyposition': {
                fn: function(pos) {
                  var geom = new OpenLayers.Geometry.Point(pos.lon,pos.lat);
                  this.setTarget(geom);
                },
                scope: this
              },
              select: {
                fn: function(combo, record, index) {
                  var geom = record.data.feature.geometry.getCentroid();
                  this.setTarget(geom);
                },
                scope: this
              }
            }
        }, this.searchOptions.widgetOptions)
      ),{
        xtype: 'button',
        text: this.targetButtonLabel,
        handler: Ext.createDelegate(function() {
          if (this.drawControl.active) {
            this.drawControl.deactivate();
          }
          this.drawControl.events.on({
            'featureadded': this.onDrawTarget,
            'deactivate': this.deactivateDrawTarget,
            scope: this
          });
          this.drawControl.activate();
        }, this)
      }]
    });

    var routeEngines = [];
    for (var i in this.routingService) {
      routeEngines.push([i, OpenLayers.i18n(i)]);
    }

    this.currentEngine = routeEngines[0][0];

    items.push({
      xtype: 'combo',
      name: 'routeEngine',
      fieldLabel: this.routeenginefieldLabel,
      editable: false,
      triggerAction: 'all',
      typeAhead: 'false',
      mode: 'local',
      width: 120,
      listWidth: 120,
      hiddenName: 'routeEngine_dropdown',
      store: routeEngines,
      value: this.currentEngine,
      listeners: {
        change: {
          fn: function(combo, newValue, oldValue) {
            if (this.currentEngine !== newValue) {
              this.currentEngine = newValue;
              this.routeFeature = this.computeRoute(this.routeFeature, this.routeStyle, true);
            }
          },
          scope: this
        }
      }
    });

    items.push({
      xtype: 'container',
      layout: 'hbox',
      items: [{
        xtype: 'button',
        text: this.zoombuttonLabel,
        margins: '10px',
        handler: Ext.createDelegate(function() {
          if (this.routeFeature) {
            this.routeFeature.geometry.calculateBounds();
            this.map.zoomToExtent(this.routeFeature.geometry.getBounds());
          }
        }, this)
      },{
        xtype: 'button',
        text: this.resetbuttonLabel,
        margins: '10px',
        handler: Ext.createDelegate(function() {
          this.vectorLayer.removeAllFeatures();
          if (this.sourceFeature) {
            this.sourceFeature.destroy();
            this.sourceFeature = null;
          }
          if (this.targetFeature) {
            this.targetFeature.destroy();
            this.targetFeature = null;
          }
          if (this.routeFeature) {
            this.routeFeature.destroy();
            this.routeFeature = null;
          }
          if (this.newRouteFeature) {
            this.newRouteFeature.destroy();
            this.newRouteFeature = null;
          }
          for (var i=0, n=this.viaFeatures.length; i<n; i++) {
            this.viaFeatures[i].destroy();
          }
          this.viaFeatures = [];

          this.directionsStore.loadData([]);

          this.find('itemId', 'directionsPanel')[0].hide();
          this.find('itemId', 'sourceComposite')[0].items.items[0].setValue('');
          this.find('itemId', 'targetComposite')[0].items.items[0].setValue('');

        }, this)
      },{
        xtype: 'button',
        text: this.reversebuttonLabel,
        margins: '10px',
        handler: Ext.createDelegate(function() {
          if (this.sourceFeature && this.targetFeature) {
            var target = this.targetFeature;
            this.targetFeature = this.sourceFeature;
            this.sourceFeature = target;
            this.sourceFeature.style = this.sourceStyle;
            this.targetFeature.style = this.targetStyle;
            this.vectorLayer.drawFeature(this.sourceFeature);
            this.vectorLayer.drawFeature(this.targetFeature);
          }
          this.viaFeatures.reverse();
          for (var i=0, n=this.viaFeatures.length; i<n; i++) {
            this.viaFeatures[i].style.label = '' + (i+1);
            this.vectorLayer.drawFeature(this.viaFeatures[i]);
          }
          this.routeFeature = this.computeRoute(this.routeFeature, this.routeFeatureStyle, true);
        }, this)
      }]
    },{
      xtype: 'panel',
      layout: 'border',
      bodyStyle: 'background-color: #ffffff',
      itemId: 'directionsPanel',
      hidden: true,
      title: this.routeDescriptionLabel,
      height: 400,
      items: [{
        xtype: 'panel',
        region: 'north',
        unstyled: true,
        id: 'routeDescription',
        data: {
          distance: '',
          time: ''
        },
        tpl: '<div style=""><div style="margin: 5px 0"><span class="total-distance-title">'+this.totalDistanceLabel+':</span> <span class="total-distance-value">{distance}</span></div><div style="margin: 5px 0"><span class="total-time-title">'+this.totalTimeLabel+':</span> <span class="total-time-value">{time}</span></div><div style="margin: 5px 0"><span class="">'+this.directionsLabel+':</span></div></div>',
      },{
        xtype: 'listview',
        region: 'center',
        store: this.directionsStore,
        emptyText: this.noRouteLabel,
        loadingText: this.loadingRouteLabel,
        hideHeaders: true,
        trackOver: true,
        singleSelect: true,
        columns: [{
          width: 1,
          tpl: this.directionsTpl
        }],
        listeners: {
          click: {
            fn: function(list, index, node, e) {
              this.zoomToNode(this.directionsStore.getAt(index).data.position);
            },
            scope: this
          },
          mouseenter: {
            fn: function(list, index, node, e) {
              this.highlightNode(this.directionsStore.getAt(index).data.position);
            },
            scope: this
          },
          mouseleave: {
            fn: function(list, index, node, e) {
              this.unhighlightNode();
            },
            scope: this
          }
        }
      }]
    })

    Ext.apply(this, {items: items});
  }

});
/** api: xtype = cgxp_routingpanel */
Ext.reg('cgxp_routingpanel', cgxp.RoutingPanel);

Ext.util.Format.routeImage = function(directionType) {
  var imgs = {
    "DIRECTION_0":"",
    "DIRECTION_1":"route_straight.png",
    "DIRECTION_2":"route_slightright.png",
    "DIRECTION_3":"route_right.png",
    "DIRECTION_4":"route_sharpright.png",
    "DIRECTION_5":"route_uturn.png",
    "DIRECTION_6":"route_sharpleft.png",
    "DIRECTION_7":"route_left.png",
    "DIRECTION_8":"route_slightleft.png",
    "DIRECTION_10":"route_straight.png",
    "DIRECTION_11-1":"route_roundabout.png",
    "DIRECTION_11-2":"route_roundabout.png",
    "DIRECTION_11-3":"route_roundabout.png",
    "DIRECTION_11-4":"route_roundabout.png",
    "DIRECTION_11-5":"route_roundabout.png",
    "DIRECTION_11-6":"route_roundabout.png",
    "DIRECTION_11-7":"route_roundabout.png",
    "DIRECTION_11-8":"route_roundabout.png",
    "DIRECTION_11-9":"route_roundabout.png",
    "DIRECTION_11-x":"route_roundabout.png",
    "DIRECTION_15":"route_target.png"
  };
  return '<img src="../src/theme/img/'+imgs[directionType]+'">';
};

Ext.util.Format.routeDirection = function(record) {
  var context = OpenLayers.Util.extend({}, record);
  context.compassDirection = OpenLayers.i18n(context.compassDirection);
  var text = OpenLayers.i18n(context.directionType, context);
  if (context.roadName) {
    text = text.replace(/\[/,'','g');
    text = text.replace(/\]/,'','g');
  } else {
    text = text.replace(/\[.*\]/,'','g');
  }
  return text;
};

Ext.util.Format.routeDistance = function(meters) {
  var dist;
  if (meters > 10000) {
    dist = (meters/1000).toFixed(0) + ' km';
  } else if (meters > 1000) {
    dist = (meters/1000).toFixed(1) + ' km';
  } else {
    dist = meters + ' m';
  }
  return dist;
};

Ext.util.Format.routeTime = function(seconds) {
  var time = [];
  var s = seconds % 60;
  var m = parseInt(seconds/60) % 60;
  var h = parseInt(seconds/3600);
  if (h) {
    time.push(h + 'hrs');
  }
  if (m) {
    time.push(m + 'm');
  }
  if (s) {
    time.push(s + 's');
  }
  return time.join(' ');
};
