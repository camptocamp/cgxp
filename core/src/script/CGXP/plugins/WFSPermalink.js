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

/*
 * @requires plugins/Tool.js
 * @include OpenLayers/Control/GetFeature.js
 * @include OpenLayers/Protocol/WFS/v1_1_0.js
 * @include OpenLayers/Format/GML.js
 * @include OpenLayers/Filter/Comparison.js
 * @include OpenLayers/Filter/Logical.js
 */


/** api: (define)
 *  module = cgxp.plugins
 *  class = WFSPermalink
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a WFSPermalink plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_wfspermalink",
 *              componentConfig: {
 *                  WFSURL: "$${request.route_url('mapserverproxy', path='')}",
 *                  WFSGetFeatureId: "wfsgetfeature",
 *                  maxFeatures: 10,
 *                  pointRecenterZoom: 13,
 *                  srsName: 'EPSG:21781',
 *                  events: EVENTS
 *              }
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: WFSPermalink(config)
 *
 *    This plugin is used to perform a WFS request using permalink parameters.
 */
cgxp.plugins.WFSPermalink = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_wfspermalink */
    ptype: "cgxp_wfspermalink",

    /** api: config[componentConfig]
     *  ``Object``
     *  Parameters of the WFS query tool.
     */
    componentConfig: null,

    init: function() {
        cgxp.plugins.WFSPermalink.superclass.init.apply(this, arguments);
        this.componentConfig.target = this.target;
        new cgxp.WFSPermalink(this.componentConfig);
    }
});

Ext.preg(cgxp.plugins.WFSPermalink.prototype.ptype,
         cgxp.plugins.WFSPermalink);

/** api: (define)
 *  module = cgxp
 *  class = WFSPermalink
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: WFSPermalink(config)
 *
 *    Utility class that parses the URL parameters and make a WFS request.
 */
cgxp.WFSPermalink = Ext.extend(Ext.Component, {

    /** api: config[stateId]
     *  ``String``
     * Prefix of the permalink parameters.
     */
    stateId: 'wfs',

    /** api: config[WFSTypes]
     *  ``Array``
     *  The queryable type on the internal server.
     */
    WFSTypes: null,

    /** api: config[WFSURL]
     *  ``String``
     *  The mapserver proxy URL
     */
    WFSURL: null,

    /** api: config[maxFeatures]
     *  ``Integer``
     *  Maximum number of features returned.
     */
    maxFeatures: 100,

    /** api: config[events]
     *  ``Object``
     *  An Observer used to send events.
     */
    events: null,

    /** api: config[srsName]
     *  ``String``
     *  Projection code.
     */
    srsName: null,

    /** api: config[pointRecenterZoom]
     *  ``Integer``
     *  Zoomlevel to use when result is a single point feature.
     */
    pointRecenterZoom: null,

    /** api: config[target]
     *  ``gxp.Viewer``
     *  Reference to the viewer.
     */
    target: null,

    /** private: property[filters]
     *  ``Object``
     *  List of search criteria.
     */
    filters: null,

    /** private: property[layername]
     *  ``String``
     *  Name of layer requested (type).
     */
    layername: null,

    /** private: method[initComponent]
     */
    initComponent: function() {
        cgxp.WFSPermalink.superclass.initComponent.apply(this, arguments);

        if (!this.WFSTypes && this.WFSGetFeatureId &&
            this.target.tools[this.WFSGetFeatureId]) {
            this.WFSTypes = this.target.tools[this.WFSGetFeatureId].WFSTypes;
        }
    },

    /** private: method[applyState]
     *  :param state: ``Object`` The state to apply.
     */
    applyState: function(state) {
        if (!state.layer || this.WFSTypes.indexOf(state.layer) == -1) {
            // layername is missing or unknown => do nothing
            return;
        }
        this.layername = state.layer;
        delete state.layer;
        this.filters = state;

        var protocol = new OpenLayers.Protocol.WFS({
            url: this.WFSURL,
            featureType: this.layername,
            srsName: this.srsName,
            featureNS: 'http://mapserver.gis.umn.edu/mapserver',
            version: "1.1.0"
        });

        this.events.fireEvent('querystarts');
        protocol.read({
            filter: this.createFilter(),
            maxFeatures: this.maxFeatures,
            callback: this.handleResult,
            scope: this
        });
    },

    /** private: method[createFilter]
     *
     *  Build a WFS filter according to the permalink parameters.
     */
    createFilter: function() {
        if (!this.filters) {
            return null;
        }
        
        var filters = [], prop, values, propFilters, i, len;
        for (prop in this.filters) {
            if (!this.filters[prop]) {
                continue;
            }
            values = this.filters[prop] instanceof Array ?
                     this.filters[prop] : [this.filters[prop]];
            propFilters = [];
            for (i = 0, len = values.length; i < len; i++) {
                propFilters.push(new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: prop,
                    value: values[i]
                }));
            }
            if (propFilters.length > 1) {
                filters.push(new OpenLayers.Filter.Logical({
                    type: OpenLayers.Filter.Logical.OR,
                    filters: propFilters
                }));
            } else {
                filters.push(propFilters[0]);
            }
        }

        if (!filters) {
            return null;
        }

        if (filters.length == 1) {
            return filters[0];
        }

        return new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.AND,
            filters: filters
        });
    },

    /** private: method[handleResult]
     *  :param result: ``Object`` Response to the WFS request.
     *
     *  Callback of the WFS request.
     */
    handleResult: function(result) {
        if (result.success() && result.features.length) {
            var features = result.features;
            if (!(OpenLayers.Util.isArray(features))) {
                features = [features];
            }

            var geometry = null, maxExtent = null;
            for(var i=0, len=features.length; i<len; i++) {
                geometry = features[i].geometry;
                if (geometry) {
                    if (maxExtent === null) {
                        maxExtent = new OpenLayers.Bounds();
                    }
                    maxExtent.extend(geometry.getBounds());
                }

                // FIXME: workaround: type should already be available
                // in the WFS response
                if (!features[i].type) {
                    features[i].type = this.layername;
                }
            }
            if (maxExtent) {
                this.target.mapPanel.map.zoomToExtent(maxExtent);
            }

            if (this.pointRecenterZoom && features.length == 1 &&
                features[0].geometry instanceof OpenLayers.Geometry.Point) {
                this.target.mapPanel.map.zoomTo(this.pointRecenterZoom);
            }

            this.events.fireEvent('queryresults', features, true);
        }
    }
});
