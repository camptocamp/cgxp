/**
 * Copyright (c) 2011 Camptocamp
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
 * @include OpenLayers/Protocol/WFS/v1_0_0.js
 * @include OpenLayers/Format/GML.js
 * @include GeoExt/widgets/Action.js
 */


/** api: (define)
 *  module = cgxp.plugins
 *  class = WFSGetFeature
 *
 *  To use this plugin all the layers should support the WFS, and should have 
 *  the same name for the geometry.
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a WFSGetFeature plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_wfsgetfeature',
 *              WFSURL: "${request.route_url('mapserverproxy', path='')}",
 *              actionTarget: 'center.tbar',
 *              events: EVENTS,
 *              themes: THEMES,
 *              WFSTypes: ${WFSTypes | n},
 *              externalWFSTypes: ${externalWFSTypes | n},
 *              enableWMTSLayers: true,
 *              toggleGroup: "maptools"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: WFSGetFeature(config)
 *
 *    Map queries (with WFS GetFeature)
 *
 *    Options:
 *    * events - ``Ext.util.Observable`` The application events manager.
 */
cgxp.plugins.WFSGetFeature = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_wfsgetfeature */
    ptype: "cgxp_wfsgetfeature",

    /** api: config[toggleGroup]
     *  ``String`` If this tool should be radio-button style toggled with other
     *  tools, this string is to identify the toggle group.
     */

    /** api: config[actionTarget]
     *  ``Object`` or ``String`` or ``Array`` Where to place the tool's actions 
     *  (e.g. buttons or menus)? 
     *
     *  In case of a string, this can be any string that references an 
     *  ``Ext.Container`` property on the portal, or a unique id configured on a 
     *  component.
     *
     *  In case of an object, the object has a "target" and an "index" property, 
     *  so that the tool can be inserted at a specified index in the target. 
     *               
     *  actionTarget can also be an array of strings or objects, if the action is 
     *  to be put in more than one place (e.g. a button and a context menu item).
     *
     *  To reference one of the toolbars of an ``Ext.Panel``, ".tbar", ".bbar" or 
     *  ".fbar" has to be appended. The default is "map.tbar". The viewer's main 
     *  MapPanel can always be accessed with "map" as actionTarget. Set to null if 
     *  no actions should be created.
     *
     *  Some tools provide a context menu. To reference this context menu as
     *  actionTarget for other tools, configure an id in the tool's
     *  outputConfig, and use the id with ".contextMenu" appended. In the
     *  snippet below, a layer tree is created, with a "Remove layer" action
     *  as button on the tree's top toolbar, and as menu item in its context
     *  menu:
     *
     *  .. code-block:: javascript
     *
     *     {
     *         xtype: "gxp_layertree",
     *         outputConfig: {
     *             id: "tree",
     *             tbar: []
     *         }
     *     }, {
     *         xtype: "gxp_removelayer",
     *         actionTarget: ["tree.tbar", "tree.contextMenu"]
     *     }
     *
     *  If a tool has both actions and output, and you want to force it to
     *  immediately output to a container, set actionTarget to null. If you
     *  want to hide the actions, set actionTarget to false. In this case, you
     *  should configure a defaultAction to make sure that an action is active.
     */

    /** api: config[options]
     *  ``Object``
     *  Actions options
     */
    options: {},

    /** api: config[events]
     *  ``Object``
     *  An Observer used to send events.
     */
    events: null,

    /** api: config[themes]
     *  ``Object`` List of internal and external themes and layers. (The
     *  same object as that passed to the :class:`cgxp.plugins.LayerTree`).
     */
    themes: null,

    /** api: config[geometryName]
     *  ``String``
     *  The geometry name.
     */
    geometryName: 'geom',

    /** api: config[clickTolerance]
     *  ``Integer``
     *  Buffer around clicked point, in pixels.
     */
    clickTolerance: 8,

    /** api: config[enableWMTSLayers]
     *  ``Boolean``
     *  If true, WMTS layers will be queried as well.
     */
    enableWMTSLayers: false,

    /** api: config[WFSTypes]
     *  ``Array``
     *  The queryable type on the internal server.
     */

    /** api: config[externalWFSTypes]
     *  ``Array``
     *  The queryable type on the parent server.
     */

    /** api: config[WFSURL]
     *  ``String``
     *  The mapserver proxy URL
     */

    /** api: method[addActions]
     */
    addActions: function() {
        var control =  this.createControl();
        this.target.mapPanel.map.addControl(control);
        var action = new GeoExt.Action(Ext.applyIf({
            allowDepress: true,
            enableToggle: true,
            iconCls: 'info',
            tooltip: OpenLayers.i18n("Query.actiontooltip"),
            toggleGroup: this.toggleGroup,
            control: control
        }, this.options));
        return cgxp.plugins.WFSGetFeature.superclass.addActions.apply(this, [[action]]);
    },

    /**
     * Method: createControl
     * Create the WMS GFI control.
     *
     * Returns:
     * {OpenLayers.Control.WFSGetFeature}
     */
    createControl: function() {
        var protocol = new OpenLayers.Protocol.WFS({
            url: this.WFSURL,
            geometryName: this.geometryName,
            srsName: this.target.mapPanel.map.getProjection(),
            formatOptions: {
                featureNS: 'http://mapserver.gis.umn.edu/mapserver',
                autoconfig: false
            }
        });
        var externalProtocol = new OpenLayers.Protocol.WFS({
            url: this.WFSURL + "?EXTERNAL=true",
            geometryName: this.geometryName,
            srsName: this.target.mapPanel.map.getProjection(),
            formatOptions: {
                featureNS: 'http://mapserver.gis.umn.edu/mapserver',
                autoconfig: false
            }
        });

        var self = this;
        // we overload findLayers to avoid sending requests
        // when we have no sub-layers selected
        return new OpenLayers.Control.GetFeature({
            target: this.target,
            box: true, 
            click: true, 
            single: false, 
            clickTolerance: this.clickTolerance, 
            eventListeners: {
                beforefeaturesselected: function() {
                    this.events.fireEvent('querystarts');
                },
                featuresselected: function(e) {
                    this.events.fireEvent('queryresults', e.features);
                },
                activate: function() {
                    this.events.fireEvent('queryopen');
                },
                deactivate: function() {
                    this.events.fireEvent('queryclose');
                },
                scope: this
            },
            request: function() {
                var l = self.getLayers.call(self);
                if (l.internalLayers.length > 0) {
                    protocol.format.featureType = l.internalLayers;
                    this.protocol = protocol;
                    OpenLayers.Control.GetFeature.prototype.request.apply(this, arguments);
                }
                if (l.externalLayers.length > 0) {
                    externalProtocol.format.featureType = l.externalLayers;
                    this.protocol = externalProtocol;
                    OpenLayers.Control.GetFeature.prototype.request.apply(this, arguments);
                }
            }
        });
    },

    /** private: method[getLayers]
     *
     *  Gets the list of layers (internal and external) to build a request
     *  with.
     *  :returns: ``Object`` An object with `internalLayers` and `externalLayers`
     *  properties.
     */
    getLayers: function() {
        var layersConfig = (function browse(node, config) {
            config = config || {};
            for (var i=0, len=node.length; i<len; i++) {
                var child = node[i];
                if (child.children) {
                    browse(child.children, config);
                } else {
                    config[child.name] = child;
                }
            }
            return config;
        })([].concat(this.themes.local || [], this.themes.external || []));

        function inRange(l, res) {
            return (!((l.minResolutionHint && res < l.minResolutionHint) ||
                (l.maxResolutionHint && res > l.maxResolutionHint)));
        }

        var olLayers = this.target.mapPanel.map.getLayersByClass("OpenLayers.Layer.WMS");
        if (this.enableWMTSLayers) {
            olLayers = olLayers.concat(
                this.target.mapPanel.map.getLayersByClass("OpenLayers.Layer.WMTS")
            );
        }
        var internalLayers = [];
        var externalLayers = [];

        var currentRes = this.target.mapPanel.map.getResolution();
        Ext.each(olLayers, function(layer) {
            var j, lenj, l, k;
            if (layer.getVisibility() === true) {
                var layers = layer.params.LAYERS || layer.mapserverLayers;
                if (Ext.isArray(layers)) {
                    layers = layers.join(',');
                }
                if (!layers) {
                    return;
                }
                layers = layers.split(',');

                var filteredLayers = [];
                for (j = 0, lenj = layers.length; j < lenj; j++) {
                    l = layersConfig[layers[j]];
                    if (l) {
                        if (l.childLayers && l.childLayers.length > 0) {
                            // layer is a layergroup (as per Mapserver)
                            for (k = 0, lenk = l.childLayers.length; k < lenk; k++) {
                                var c = l.childLayers[k];
                                if (inRange(c, currentRes)) {
                                    filteredLayers.push(child.name);
                                }
                            }
                        } else {
                            // layer is not a layergroup
                            if (inRange(l, currentRes)) {
                                filteredLayers.push(layers[j]);
                            }
                        }
                    } else {
                        filteredLayers.push(layers[j]);
                    }
                }

                for (j = 0, lenj = filteredLayers.length ; j < lenj ; j++) {
                    for (var i = 0, leni = this.WFSTypes.length ; i < leni ; i++) {
                        if (this.WFSTypes[i] === filteredLayers[j]) {
                            internalLayers.push(this.WFSTypes[i]);
                            break;
                        }
                    }
                    for (k = 0, lenk = this.externalWFSTypes.length ; k < lenk ; k++) {
                        if (this.externalWFSTypes[k] === filteredLayers[j]) {
                            externalLayers.push(this.externalWFSTypes[k]);
                            break;
                        }
                    }
                }
            }
        }, this);

        return {
            internalLayers: internalLayers,
            externalLayers: externalLayers
        };
    }
});

Ext.preg(cgxp.plugins.WFSGetFeature.prototype.ptype, cgxp.plugins.WFSGetFeature);
