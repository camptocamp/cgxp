/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 * @include CGXP/plugins/FullTextSearch.js
 * @include CGXP/widgets/RoutingPanel.js
 * @include GeoExt/widgets/Action.js
 * @include OpenLayers/Handler/Point.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Routing
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Routing plugin to a
 *  ``gxp.Viewer`` in a existing container:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_routing',
 *              outputTarget: "left-panel",
 *              osrmURL: "${request.route_url('osrmproxy', path='')}",
 *              searchURL: "${request.route_url('ftsproxy', path='')}",
 *              outputConfig: {
 *                  labelAlign: 'top',
 *                  defaults: {
 *                      anchor: '100%'
 *                  },
 *                  autoFit: true
 *              }
 *          }]
 *          ...
 *      });
 *
 *  Sample code showing how to add a Routing plugin to a
 *  ``gxp.Viewer`` via an icon in a toolbar. The routing form will show up in
 *  a ``CGXP.tool.Window`` below the toolbar:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_routing',
 *              actionTarget: "center.tbar",
 *              toggleGroup: "maptools",
 *              osrmURL: "${request.route_url('osrmproxy', path='')}",
 *              searchURL: "${request.route_url('ftsproxy', path='')}",
 *              outputConfig: {
 *                  labelAlign: 'top',
 *                  defaults: {
 *                      anchor: '100%'
 *                  },
 *                  autoFit: true
 *              }
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Routing(config)
 *
 */
cgxp.plugins.Routing = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_routing */
    ptype: "cgxp_routing",

    /** private: property[routingPanel]
     *  the routing panel widget
     */
    routingPanel: null,

    /** api: config[routingService]
     *  ``Object``
     *  Object which controls the routing service to be used.  Keys identify
     *  the routing engine to use, ENGINE_0 is for computing the fastest route
     *  by car.  The key will be localised using OpenLayers.i18n and the value
     *  will be used in the Method field of the routing panel.  The value of
     *  each key contains the following options:
     *
     *  * ``type`` - ``String`` Type of the routing service, currently
     *    only OSRM is supported.
     *  * ``url`` - ``String`` Base URL of the routing service
     *  * ``dynamic`` - ``Boolean`` If true, update the route dynamically
     *    as points on the route are moved
     *
     *  Additional properties are available depending on the type of
     *  the routing service.
     *
     *  OSRM-specific Properties:
     *
     *  none.
     *
     */
    routingService: {
      'ENGINE_0': { // Car (fastest) - see strings below and in locale files
        type: 'OSRM',
        url: null,
        dynamic: true
      }
    },

    /** api: config[searchOptions]
     *  ``String``
     *  Options for a FullTextSearch widget.
     */
    searchOptions: null,

    /** api: config[outputConfig]
     *  ``String``
     *  panel config options.
     */
    outputConfig: null,

    /** api: config[timeout]
     * ``Number``
     * The timeout delay for fetching results from full text search and
     * routing engines in milliseconds. Default to 2 minutes.
     */
    timeout: 120000,

    /** api: config[actionTarget]
     *  ``Object`` or ``String`` or ``Array`` Where to place the tool's actions
     *  (e.g. buttons or menus)?
     *  As opposed to CGXP.plugins.Tool, we don't want it to be set by default
     *  to the mapPanel top toolbar.
     */
    actionTarget: null,

    /* i18n */
    routingTitle: "Routing",
    routingwindowTitle: "Routing",
    routingbuttonText: "Routing",
    routingbuttonTooltip: "Routing",
    sourcefieldLabelText: "From",
    sourcefieldValueText: "From",
    sourceButtonLabel: "Set",
    targetfieldLabelText: "To",
    targetfieldValueText: "To",
    targetButtonLabel: "Set",
    routeenginefieldLabel: 'Travel by',
    zoombuttonLabel: 'Zoom',
    resetbuttonLabel: 'Reset',
    reversebuttonLabel: 'Reverse',
    routeDescriptionLabel: "Route Description",
    totalDistanceLabel: 'Total Distance',
    totalTimeLabel: 'Total Time',
    directionsLabel: 'Directions',
    loadingRouteLabel: "Your route is being computed",
    noRouteFoundLabel: "No route possible",
    routeErrorTitle: 'Error',

    // see also OpenLayers.Lang['en'] below this class

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
     *    ``{[Ext.util.Format.routeDirection(values)]}`` to work correctly.
     */

    directionsTpl: '<div style="float:left; width: 30px;">{directionType:routeImage}</div><div style="float: right; width: 40px; text-align: right; ">{distance:routeDistance}</div><div style="margin:0 40px 0 30px; white-space: normal">{[Ext.util.Format.routeDirection(values)]}</div>',


    /** api: config[limits]
     *  ``Object`` Option object to configure search
     *  limit parameters sent to the text search
     *  service. The possible properties are:
     *
     *  * ``limit`` - ``Number`` The maximum number of
     *    results in the response.
     *  * ``partitionlimit`` - ``Number`` The maximum number
     *    of results per layer/group in the response.
     *
     *  ``partitionlimit`` is typically used when the ``grouping``
     *  option is to ``true``, to limit the number of
     *  results in each group.
     *
     *  If the ``limits`` option is unspecified the limit
     *  parameters sent in search requests depend whether
     *  ``grouping`` is ``true`` or ``false``:
     *
     *  * If ``grouping`` is ``false`` then ``limit`` is set to ``20``,
     *    and ``partitionlimit`` is not set.
     *  * If ``grouping`` is ``true`` then ``limit`` is set to ``40``,
     *    and ``partitionlimit`` is set to ``10``.
     *
     *  Any provided ``limits`` object is *applied* to the
     *  default values. For example, if ``grouping`` is
     *  ``true`` and if the ``limits`` option is set to
     *  ``{limit: 50}`` then ``limit`` will be set to ``50`` and
     *  ``partitionlimit`` will be set to ``10`` in search requests.
     */
    limits: {},

    /** api: config[vectorLayerConfig]
     *  ``Object``
     *  Optional configuration of the vector layer.
     */
    vectorLayerConfig: {},

    /** private: method[addOutput]
     *  :arg config: ``Object``
     */
    addOutput: function(config) {
        var routingServices = {};

        for (var i in this.routingService) {
          routingServices[i] = this.createRoutingService(this.routingService[i]);
        }

        var routingPanel = new cgxp.RoutingPanel(Ext.apply({
          title: this.routingTitle,
          map: this.target.mapPanel.map,
          routingService: routingServices,
          searchOptions: this.searchOptions,
          sourcefieldLabel: this.sourcefieldLabelText,
          sourcefieldValue: this.sourcefieldValueText,
          sourceButtonLabel: this.sourceButtonLabel,
          targetfieldLabel: this.targetfieldLabelText,
          targetfieldValue: this.targetfieldValueText,
          targetButtonLabel: this.targetButtonLabel,
          routeenginefieldLabel: this.routeenginefieldLabel,
          zoombuttonLabel: this.zoombuttonLabel,
          resetbuttonLabel: this.resetbuttonLabel,
          reversebuttonLabel: this.reversebuttonLabel,
          routeDescriptionLabel: this.routeDescriptionLabel,
          totalDistanceLabel: this.totalDistanceLabel,
          totalTimeLabel: this.totalTimeLabel,
          directionsLabel: this.directionsLabel,
          loadingRouteLabel: this.loadingRouteLabel,
          noRouteLabel: this.noRouteLabel,
          bodyStyle: {
            'padding': '10px'
          }
        }, this.outputConfig));

        this.routingPanel = cgxp.plugins.Routing.superclass.addOutput.call(this, routingPanel);

        return this.routingPanel;
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var button;

        if (this.actionTarget) {
            var routingWin = new cgxp.tool.Window({
                width: 250,
                bodyStyle: 'padding: 5px',
                title: this.routingwindowTitle,
                border: false,
                layout: 'fit',
                autoHeight: false,
                height: 350,
                closeAction: 'hide',
                autoScroll: true,
                cls: 'toolwindow'
            });

            routingWin.on({
                'show': function() {
                    var routingPanel = this.createRoutingPanel({
                        header: false,
                        unstyled: true
                    });
                    routingWin.add(routingPanel);
                },
                'beforehide': function() {
                    routingWin.removeAll();
                },
                scope: this
            });

            button = new cgxp.tool.Button(Ext.apply({
                text: this.routingbuttonText,
                iconCls: "routing",
                tooltip: this.routingbuttonTooltip,
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                window: routingWin
            }, this.actionConfig));
        }

        return cgxp.plugins.Routing.superclass.addActions.apply(this, [button]);
    },

    /** private: method[createRoutingService]
     */
    createRoutingService: function(serviceConfig) {
        return new cgxp.data[serviceConfig.type](serviceConfig);
    }
});

Ext.preg(cgxp.plugins.Routing.prototype.ptype, cgxp.plugins.Routing);

// TODO: this probably isn't the right place for these but they need to
//       be set somewhere
OpenLayers.Lang['en'] = OpenLayers.Util.applyDefaults({
  "STATUS_0": "Successful",
  "STATUS_1": "Unknown server error",
  "STATUS_2": "Invalid parameter",
  "STATUS_3": "Parameter out of range",
  "STATUS_4": "Required parameter missing",
  "STATUS_5": "Service unavailable",
  "STATUS_202": "Route is blocked",
  "STATUS_205": "DB corrupted",
  "STATUS_206": "DB is not open",
  "STATUS_207": "No route",
  "STATUS_208": "Invalid start point",
  "STATUS_209": "Invalid end point",
  "STATUS_210": "Start and end points are equal",

  // routing engines
  "ENGINE_0": "Car (fastest)",
  // directions
  "N": "north",
  "E": "east",
  "S": "south",
  "W": "west",
  "NE": "northeast",
  "SE": "southeast",
  "SW": "southwest",
  "NW": "northwest",
  // driving directions
  // ${roadName}: road name
  // ${compassDirection}: compass direction
  // ${distance}: distance
  // ${duration}: duration
  // [*]: will only be printed when there actually is a road name
  "DIRECTION_0":"Unknown instruction[ onto <b>${roadName}</b>]",
  "DIRECTION_1":"Continue[ onto <b>${roadName}</b>]",
  "DIRECTION_2":"Turn slightlyå right[ onto <b>${roadName}</b>]",
  "DIRECTION_3":"Turn right[ onto <b>${roadName}</b>]",
  "DIRECTION_4":"Turn sharply right[ onto <b>${roadName}</b>]",
  "DIRECTION_5":"U-Turn[ onto <b>${roadName}</b>]",
  "DIRECTION_6":"Turn sharply left[ onto <b>${roadName}</b>]",
  "DIRECTION_7":"Turn left[ onto <b>${roadName}</b>]",
  "DIRECTION_8":"Turn slightly left[ onto <b>${roadName}</b>]",
  "DIRECTION_10":"Head <b>${compassDirection}</b>[ onto <b>${roadName}</b>]",
  "DIRECTION_11-1":"Enter roundabout and leave at first exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-2":"Enter roundabout and leave at second exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-3":"Enter roundabout and leave at third exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-4":"Enter roundabout and leave at fourth exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-5":"Enter roundabout and leave at fifth exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-6":"Enter roundabout and leave at sixth exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-7":"Enter roundabout and leave at seventh exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-8":"Enter roundabout and leave at eighth exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-9":"Enter roundabout and leave at nineth exit[ onto <b>${roadName}</b>]",
  "DIRECTION_11-x":"Enter roundabout and leave at one of the too many exits[ onto <b>${roadName}</b>]",
  "DIRECTION_15":"You have reached your destination"
});
