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
 * @include OpenLayers/Protocol/Script.js
 */

/** api: (define)
 *  module = cgxp.data
 *  class = OSRM
 */

Ext.namespace("cgxp.data");

/** api: constructor
 *  .. class:: OSRM(config)
 */
cgxp.data.OSRM = Ext.extend(Ext.util.Observable, {

  /** static OSRM coordinate precision
   */
  OSRM_PRECISION: 6,

  /** api: config[url]
   *  ``String``
   * the url to the OSRM server
   */

  /** api: config[dynamic]
   *  ``Boolean``
   *  Is the routing service supposed to issue requests dynamically
   *  as the user drags a route marker?
   */
  dynamic: false,

  /** private: property[_cacheHints]
   *  hints from previous OSRM requests
   */
  _cacheHints: {
    checksum: null
  },

  /** private: method[constructor]
   */
  constructor: function(config) {
    this.url = config.url;
    this.dynamic = config.dynamic;

    this.listeners = config.listeners;

    this.protocol = new OpenLayers.Protocol.Script({
      callbackKey: 'jsonp',
      params: {
        output: 'json'
      }
    });

    cgxp.data.OSRM.superclass.constructor.call(this, config);
  },

  /** api: method[getNearest]
   *  Find the nearest location on the routing network
   *
   *  :return ``Object`` a handle that can be used to cancel the
   *    asynchronous method
   */
  getNearest: function(loc, callback, scope) {
    var url = this.url + '/nearest';
    url = OpenLayers.Util.urlAppend(url,'loc='+loc.y+','+loc.x);
    return this.protocol.read({
      url: url,
      callback: function(response) {
        if (callback) {
          var data = response.data;
          var location = {
            x: data.mapped_coordinate[1],
            y: data.mapped_coordinate[0],
            name: data.name,
            status: data.status,
            message: OpenLayers.i18n("STATUS_"+data.status),

          };
          callback.apply(scope, [data.status, location]);
        }
      },
      scope: this
    });
  },

  /** private: method[getLocWithHint]
   *  get a location as a URL parameter with hint from
   *  a previous call if available
   */
  getLocWithHint: function(loc, tag) {
    var param = 'loc='+loc.y+','+loc.x;

    if (this._cacheHints[loc.x] &&
        this._cacheHints[loc.x][loc.y]) {
      param += '&hint='+this._cacheHints[loc.x][loc.y];
    }
    return param;
  },

  /** private: method[cacheOne]
   *  cache a single location from a previous request
   */
  cacheOne: function(x, y, hint) {
    if (!this._cacheHints[x]) {
      this._cacheHints[x] = {};
    }
    this._cacheHints[x][y] = hint;
  },

  /** private: method[cacheHintData]
   *  cache hint data from a previous request
   */
  cacheHintData: function(source, target, via, hint_data) {
    var hints = hint_data.locations.slice();
    this._cacheHints.checksum = hint_data.checksum;

    this.cacheOne(source.x, source.y, hints.shift());
    this.cacheOne(target.x, target.y, hints.pop());
    for (var i=0, n=via.length; i<n; i++) {
      this.cacheOne(via[i].x,via[i].y,hints[i]);
    }
  },

  /** private: getUrl
   *
   *  create a url to OSRM based on the server api documented
   *  at https://github.com/DennisOSRM/Project-OSRM/wiki/Server-api
   *
   *  :arg options: ``Object`` options, see getRoute
   *
   *  :return ``String`` the url
   */

  getUrl: function(options) {
    var url = this.url + '/viaroute';
    var params = [];
    params.push(this.getLocWithHint(options.source, 'source'));
    if (options.via instanceof Array) {
      for (var i=0,n=options.via.length; i<n; i++) {
        params.push(this.getLocWithHint(options.via[i], 'via'+i));
      }
    }
    params.push(this.getLocWithHint(options.target, 'target'));
    if (this._cacheHints.checksum) {
      params.push('checksum='+this._cacheHints.checksum);
    }
    if (typeof options.z !== 'undefined') {
      params.push('z='+options.z);
    }
    if (options.alternates) {
      params.push('alt=true');
    }
    if (options.instructions) {
      params.push('instructions=true');
    }
    url += '?'+params.join('&');

    return url;
  },

  /** api: getRoute
   *
   *  :arg options: ``Object`` object containing routing options with
   *    the following properties:
   *
   *  :return ``Object`` a handle that can be used to cancel the
   *    asynchronous method
   *
   *  * ``source`` - ``OpenLayers.Geometry.Point`` in EPSG:4326
   *  * ``target`` - ``OpenLayers.Geometry.Point`` in EPSG:4326
   *  * ``via`` - ``Array(OpenLayers.Geometry.Point)()`` in EPSG:4326
   *  * ``z`` - ``Integer`` optional zoom level for route geometry
   *  * ``alternates`` - ``Boolean`` optional, if true then compute
   *    alternate routes
   *  * ``instructions`` - ``Boolean`` optional, if true then include
   *    turn-by-turn instructions
   */
  getRoute: function(options, callback, scope) {
    if (this._current) {
      this._next = OpenLayers.Function.bind(function() {
        this.getRoute(options, callback, scope);
      }, this);
    } else {
      this._current = this.protocol.read({
        url: this.getUrl(options),
        callback: function(response) {
          var data = response.data;
          if (callback) {
            var route = {
              status: data.status,
              message: OpenLayers.i18n("STATUS_"+data.status),
            };

            if (data.status == 0) {
              this.cacheHintData(options.source, options.target, options.via, data.hint_data);
              var geometry =

              route.geometry = this.parseRouteGeometry(data.route_geometry);
              route.distance = data.route_summary.total_distance;
              route.time = data.route_summary.total_time;
              if (options.instructions) {
                var instructions = [];
                for (var i=0, n=data.route_instructions.length; i<n; i++) {
                  instructions.push(this.formatInstruction(i, data.route_instructions[i]));
                }
                route.instructions = instructions;
              }
            }

            callback.apply(scope, [data.status, route]);
            this._current = null;
            if (this._next) {
              this._next();
              this._next = null;
            }
          }
        },
        scope: this
      });
      return this._current;
    }

  },

  /** private: method[parseRouteGeometry]
   *
   *  algorithm based on
   */
  cancel: function(handle) {
    this.protocol.abort(handle);
  },

  /** private: method[parseRouteGeometry]
   *
   *  algorithm based on
   *  https://github.com/DennisSchiefer/Project-OSRM-Web/blob/develop/WebContent/routing/OSRM.RoutingGeometry.js
   *  :returns ``Array`` an array of [lng,lat] pairs
   */
  parseRouteGeometry: function(encoded) {
    var precision = Math.pow(10, -this.OSRM_PRECISION);
    var len = encoded.length;
    var index = 0;
    var lat = 0;
    var lng = 0;
    var coords = [];

    var parseNext = function() {
      var b;
      var shift = 0;
      var result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while(b >= 0x20);
      return (result & 1) ? ~(result >> 1) : result >> 1;
    };

    while (index<len) {
      lat += parseNext();
      lng += parseNext();
      coords.push(new OpenLayers.Geometry.Point(lng*precision, lat*precision));
    }
    return coords;
  },

  /** private: method[formatInstruction]
   *  returns a JSON object representing a driving direction on the route
   */
  formatInstruction: function(index, info) {
    return {
      id: index,
      directionType: "DIRECTION_" + info[0],
      roadName: info[1],
      distance: info[2], // distance in meters
      position: info[3], // offset into geometry for this instruction
      time: info[4], // time in seconds
      compassDirection: info[6] // cardinal or ordinal direction
    }
  }
});
