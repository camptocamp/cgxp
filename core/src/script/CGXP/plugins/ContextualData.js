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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @requires plugins/Tool.js
 * @requires OpenLayers/Control.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = ContextualData
 *
 *  display a popup with data related to the current coordinate,
 *  either through right-clic or through mouseover with the activation
 *  of the tool in the toolbar
 */

Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: ContextualData(config)
 *
 *    Contextual Data Display
 *
 *    Add right-click popup and/or mouse-over popup with contextual data
 *    corresponding to current cursor coordinates.
 *
 *    This plugin may works with web service to retrieve additional data.
 */
cgxp.plugins.ContextualData = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_contextualdata */
    ptype: "cgxp_contextualdata",

    /** api: config[url]
     *  ``String`` URL of the text search service. Typically set to
     *  ``"${request.route_url('raster', path='')}"``.
     */
    url: null,

    /** api: config[enabledAction]
     *  ``String`` the type of action triggering the context data query and
     *  display.
     *  possible values are: 'all', 'mouseover', 'rightclick'.
     *  'mouseover' enable a tool in the toolbar which allow to display the
     *  context data popup on mouseover on the map.
     *  'rightclick' allow to display the context data popup on right-click on
     *  the map.
     *  'all' enable both behavior.
     *  default is 'all'
     */
    enabledAction: 'all',

    /** api: config[streetViewLink]
     *  ``Boolean`` enable or disable the streeView link in right-click context
     *  menu.
     *  true to enable,
     *  false to disable,
     *  default is true.
     */
    streetViewLink: true,

    /** api: config[tpls]
     *  ``Object`` Allow to override the Ext.Template used for mouseover,
     *  rightclick or both window content.
     *  The variable between curly brackets are automaticaly replaced with the
     *  values recovered from server side.
     *  Example:
     *
     *  .. code-block:: javascript
     *
     *      tpls: {
     *          all: "Local Coord. Label : {coord_x} {coord_y}<br />" +
     *              "Wsg Coord. Label : {wsg_x} {wsg_y}<br />" +
     *              "Elevation Label (Terrain) : {elevation_dtm} [m]<br />" +
     *              "Elevation Label (Surface) : {elevation_dsm} [m]<br />" +
     *              "Height (Surface-Terrain) : {elevation_dhm} [m]<br />"
     *      }
     *
     *  or
     *
     *  .. code-block:: javascript
     *
     *      tpls: {
     *          mouseoverTpl: "...some text/html...",
     *          rightclickTpl: "...some text/html..."
     *      }
     */
    tpls: {
        mouseoverTpl: null,
        rightclickTpl: null
    },

    /** api: config[actionConfig]
     *  ``Object``
     *  Configuration object for the action created by this plugin.
     */

    /** api: method[handleServerData]
     *  Method intended to be overriden at config level, so users can specify
     *  specific treatments on server data
     *
     *  By default, all parameters other than ``mnt`` and ``mns`` are
     *  automatically  set as ``<parameter_name>_value`` with the label
     *  ``<parameter_name>_label``.
     *
     *  :arg data: ``Object`` JavaScript literal created from the JSON response.
     *  :return: ``Object``
     *
     *  Full config example:
     *
     *  .. code-block:: javascript
     *
     *      {
     *         ptype: "cgxp_contextualdata",
     *         url: "${request.route_url('raster', path='')}",
     *         actionTarget: "center.tbar",
     *         tpls: {
     *             allTpl: "Local Coord. Label : {coord_x} {coord_y}<br />" +
     *                     "Wsg Coord. Label : {wsg_x} {wsg_y}<br />" +
     *                     "Elevation Label (Terrain) : {elevation_dtm} [m]<br />" +
     *                     "Elevation Label (Surface) : {elevation_dsm} [m]<br />" +
     *                     "Height (Surface-Terrain) : {elevation_dhm} [m]<br />" +
     *                     "{custom_data_label} : {custom_data_value}"
     *         },
     *         handleServerData: function(data) {
     *             if (data.some_data) {
     *                 // do some treatments ....
     *
     *                 return {
     *                     'custom_data_value': data.some_data,
     *                     'custom_data_label': OpenLayers.i18n('custom_data_label')
     *                 };
     *             }
     *         }
     *      }
     */
    handleServerData: function(data) {
        var result = {};
        Ext.each(data, function(key) {
            if (['mnt', 'mns'].indexOf(key) < 0) {
                result[key + '_value'] = data[key];
                result[key + '_label'] = OpenLayers.i18n(key);
            }
        });
        return result;
    },

    /** api: config[actionTooltipText]
     *  ``String``
     *  The text displayed as qtips on the tool button (i18n).
     */
    actionTooltipText: 'Contextual Information Tooltips',

    /** api: config[mouseoverWindowConfig]
     *  ``Object``
     *  Allow to override the default values of the mouseover window
     *  mouseoverWindowConfig: {
     *    width: 245
     *  }
     */
    mouseoverWindowConfig: {},

    /** api: config[rightclickWindowConfig]
     *  ``Object``
     *  Allow to override the default values of the rightclick window
     *  rightclickWindowConfig: {
     *    width: 500
     *  }
     */
    rightclickWindowConfig: {},

    /** i18n */
    menuText: 'Contextual data',

    /** api: method[addActions]
     */
    addActions: function() {

        if (this.tpls.allTpl) {
            this.tpls.mouseoverTpl = this.tpls.rightclickTpl = this.tpls.allTpl;
        }

        var control;
        if (this.enabledAction == 'all' || this.enabledAction == 'rightclick') {
            // Right Click-context menu
            control = new cgxp.plugins.ContextualData.ContextPopup({
                handleRightClicks:true,
                map: this.target.mapPanel.map,
                serviceUrl: this.url,
                zoomWheelEnabled:false,
                tpl: this.tpls.rightclickTpl,
                handleServerData: this.handleServerData,
                streetViewLink: this.streetViewLink,
                rightclickWindowConfig: this.rightclickWindowConfig
            });
            this.target.mapPanel.map.addControl(control);
        }

        if (this.enabledAction == 'all' || this.enabledAction == 'mouseover') {
            // Tooltip
            control = new cgxp.plugins.ContextualData.Tooltip({
                serviceUrl: this.url,
                tpl: this.tpls.mouseoverTpl,
                handleServerData: this.handleServerData,
                mouseoverWindowConfig: this.mouseoverWindowConfig
            });
            this.target.mapPanel.map.addControl(control);
            var action = new GeoExt.Action(Ext.applyIf({
                allowDepress: true,
                enableToggle: true,
                iconCls: 'infotooltip',
                tooltip: this.actionTooltipText,
                menuText: this.menuText,
                toggleGroup: this.toggleGroup,
                control: control
            }, this.actionConfig));
            return cgxp.plugins.ContextualData.superclass.addActions.apply(this, [[action]]);
        } else {
            return null;
        }
    }
});

Ext.preg(cgxp.plugins.ContextualData.prototype.ptype, cgxp.plugins.ContextualData);

/** private: constructor
 *  .. class:: ContextualData.Control(config)
 *
 *    Shared Main Control Class.
 *    Used by ContextualData.Tooltip and ContextualData.ContextPopup
 *
 *    Handle variables replacement in popup content and, if needed, server
 *    query to fetch data.
 *
 */
cgxp.plugins.ContextualData.Control = OpenLayers.Class(OpenLayers.Control, {

    /** private: config[serviceUrl]
     *  ``String`` URL to access the server web service
     */
    serviceUrl: null,

    /** private: config[streetviewLabelText]
     *  ``String``
     *  Text for the Streeview link (i18n).
     */
    streetviewLabelText: 'StreetView Link',

    /** private: config[userValueErrorText]
     *  ``String``
     *  Text for the error in case of wrong type of variable for custom data (i18n).
     */
    userValueErrorText: 'The value returned by the handleServerData methode ' +
        'must be an object. See the example in the API.',

    /** private: config[userValueErrorTitleText]
     *  ``String``
     *  Text for the error title for userValueErrorText (i18n).
     */
    userValueErrorTitleText: 'Error',

    /** private: method[getContent]
     *  Process server response and generate the popup html content
     *
     *  :arg response: ``Object`` Ext.Ajax.request response
     *  :returns: ``String`` popup content
     */
    getContent: function(response) {
        // Set popup content
        var coord_x = (Math.round(this.lonLat.lon * 10) / 10).toFixed(1);
        var coord_y = (Math.round(this.lonLat.lat * 10) / 10).toFixed(1);
        this.lonLat.transform(this.map.getProjectionObject(),
                              new OpenLayers.Projection("EPSG:4326"));
        // Set popup content
        var values = {
            'coord_x': coord_x,
            'coord_y': coord_y,
            'wsg_x': Math.round(this.lonLat.lon * 100000) / 100000,
            'wsg_y': Math.round(this.lonLat.lat * 100000) / 100000
        };

        // Set streetView popup content
        if (this.streetViewLink) {
            Ext.apply(values, {
                'streetviewlabel': this.streetviewLabelText,
                'streetviewlat': this.lonLat.lat,
                'streetviewlon': this.lonLat.lon
            });
        }

        if (response) {
            var data = Ext.decode(response.responseText);

            // default server data handling
            var serverValues = {};
            // specific elevation treatments
            if (data.mns && data.mnt) {
                var Dh=Math.round((data.mns-data.mnt)*10)/10;
                if (Dh<0) {
                    Dh=0;
                }
                Ext.apply(serverValues, {
                    'elevation_dtm': data.mnt,
                    'elevation_dsm': data.mns,
                    'elevation_dhm': Dh
                });
            }
            // merge serverValues with values
            Ext.apply(values, serverValues);

            // user specific server data handling
            userValues = this.handleServerData(data);
            // merge serverValues override with values
            if (userValues) {
                if (typeof(userValues) != 'object') {
                    cgxp.tools.openWindow({html: this.userValueErrorText},
                        this.userValueErrorTitleText, 600, 200);
                } else {
                    Ext.apply(values, userValues);
                }
            }
        }

        var tpl = new Ext.Template(this.tpl);
        tpl.compile();
        return tpl.apply(values);
    },

    /** private: method[request]
     *  Execute a server side request to fetch data
     *
     *  :arg ev: ``Object`` DOM Event Object
     */
    request: function(ev) {

        Ext.Ajax.request({
            url: this.serviceUrl,
            success: this.success.createDelegate(this, [ev.clientX, ev.clientY], true),
            failure: this.failure.createDelegate(this, [ev.clientX, ev.clientY], true),
            method: 'GET',
            params: {
                lon: this.lonLat.lon,
                lat: this.lonLat.lat
            },
            scope: this
        });
    },

    /** private: method[success]
     *  Callback used if the server side request is successful
     *
     *  :arg response: ``Object`` Ext.Ajax.request response
     *  :arg scope: ``Object`` request context
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    success: function(response, scope, clientX, clientY) {
        // pass
    },

    /** private: method[failure]
     *  Callback used if the server side request fails
     *
     *  :arg response: ``Object`` Ext.Ajax.request response
     *  :arg scope: ``Object`` request context
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    failure: function(response, scope, clientX, clientY) {
        // pass
    }
});

/** private: constructor
 *  .. class:: ContextualData.Tooltip(config)
 *
 *    Mouseover Control
 *
 *    Handle activation and display of a mouseover tooltips with contextual
 *    data.
 */
cgxp.plugins.ContextualData.Tooltip = OpenLayers.Class(cgxp.plugins.ContextualData.Control, {

    /** private: config[defaultTpl]
     *  ``String`` Used to generate the Ext.Template for popup content
     */
    defaultTpl: "Swiss coordinates: {coord_x} {coord_y}<br />" +
        "WGS 84 : {wsg_x} {wsg_y}<br />",

    /** private: config[defaultTplElevation]
     *  ``String`` Used to generate the Ext.Template for popup content with
     *  server elevation data
     */
    defaultTplElevation: "Elevation (Terrain): {elevation_dtm} [m]<br />" +
        "Elevation (Surface): {elevation_dsm} [m]<br />" +
        "Height (Surface-Terrain): {elevation_dhm} [m]<br />",

    /** private: config[serviceUrl]
     *  ``String`` URL to access the profile service
     */
    serviceUrl: null,

    /** private: config[popupTitleText]
     *  ``String``
     *  Text for the right click popup window (i18n).
     */
    popupTitleText: 'Location',

    /** private: config[treeNodeUI]
     *  ``Boolean`` Tells if a request is currently waiting for a response
     */
    showLocationInMapRequestOngoing: false,

    /** private: config[wait]
     *  ``Boolean`` Delay to prevent too close update (set to 200ms)
     *  Help attenuating a flickering effect of the window.
     */
    wait: false,

    /** private: config[popupId]
     *  ``String`` Id of the right click popup window
     */
    popupId: 'contextualDataPopup',

    /** private: config[defaultHandlerOptions]
     *  ``Object`` Handler default config
     */
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0, //tolerance
        'stopSingle': false,
        'stopDouble': false
    },

    /** private: method[initialize]
     *  :arg options: ``Object``
     */
    initialize: function(options) {
        if (!options) {
            options = {};
        }
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );

        // handle user template or use default
        if (!this.tpl) {
            this.tpl = this.defaultTpl;
            if (this.serviceUrl) {
                this.tpl += this.defaultTplElevation;
            }
        }

        this.tpl = OpenLayers.i18n(this.tpl);

        this.win = new Ext.Window(Ext.apply({
            layout:'fit',
            width:225,
            closable:false,
            plain: false,
            draggable: false,
            title: this.popupTitleText,
            bodyStyle: 'padding:3px;',
            html: '<div style="background-color: rgb(255, 255, 208);" id="' +
                  this.popupId + '"></div>'
        }, options.mouseoverWindowConfig));
        this.win.render(Ext.getBody());
    },

    /** private: method[hideMouseOver]
     *  Hide popup window
     *
     *  :arg ev: ``Object`` DOM Event Object
     */
    hideMouseOver: function(ev) {
        var popup = Ext.get(this.popupId).dom;
        popup.innerHTML = "";
        this.win.hide(this);
    },

    /** private: method[hideMouseOver]
     *  Update popup
     *
     *  :arg response: ``String`` Popup content
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    updateTooltip: function(response, clientX, clientY) {

        var popup = Ext.get(this.popupId).dom;
        var content = this.getContent(response);

        popup.innerHTML = content;
        var topPixel = clientY + 10;
        var leftPixel = clientX + 10;
        this.win.hide(this);
        this.win.x = leftPixel;
        this.win.y = topPixel;
        this.win.show(this);

        this.showLocationInMapRequestOngoing = false;
    },

    /** private: method[showLocationTooltip]
     *  Trigger popup display/refresh
     *
     *  :arg ev: ``Object`` DOM Event Object
     */
    showLocationTooltip: function(ev) {
        if (this.showLocationInMapRequestOngoing) {
            return;
        };

        this.lonLat = this.map.getLonLatFromPixel(ev.xy);

        if (this.serviceUrl) {
            // use server service to get data
            if (!this.wait) {
                this.request.call(this, ev);
                // start a timer to prevent too short updates/calls
                this.wait = true;
                this.clearWait.defer(100, this);
                this.showLocationInMapRequestOngoing = true;
            }
        } else {
            // no server request
            this.updateTooltip(null, ev.clientX, ev.clientY);
        }
    },

    /** private: method[success]
     *  Callback used if the server side request is successful
     *  Trigger popup update
     *
     *  :arg response: ``Object`` Ext.Ajax.request response
     *  :arg scope: ``Object`` request context
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    success: function(response, scope, clientX, clientY) {
        this.updateTooltip(response, clientX, clientY);
    },

    /** private: method[failure]
     *  Callback used if the server side request fails
     *  Reset popup state
     *
     *  :arg response: ``Object`` Ext.Ajax.request response
     *  :arg scope: ``Object`` request context
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    failure: function(response, scope, clientX, clientY) {
        this.showLocationInMapRequestOngoing = false;
    },

    /** private: method[activate]
     *  Activate Control
     */
    activate: function() {
        this.map.events.register('mousemove', this, this.showLocationTooltip);
        this.map.events.register('mouseout', this, this.hideMouseOver);
    },

    /** private: method[activate]
     *  Deactivate Control
     */
    deactivate: function() {
        this.hideMouseOver();
        this.map.events.unregister('mousemove', this, this.showLocationTooltip);
        this.map.events.unregister('mouseout', this, this.hideMouseOver);
    },

    /** private: method[clearWait]
     *  Reset timer on popup refresh
     */
    clearWait: function() {
        this.wait = false;
    },

    CLASS_NAME: "cgxp.plugins.ContextualData.Tooltip"
});

/** private: constructor
 *  .. class:: ContextualData.ContextPopup(config)
 *
 *    Right-click Control
 *
 *    Handle activation and display of a tooltips with contextual
 *    data on right-click on the map.
 */
cgxp.plugins.ContextualData.ContextPopup = OpenLayers.Class(cgxp.plugins.ContextualData.Control, {

    /** private: config[mainTpl]
     *  ``String`` Used to generate the base Ext.Template used for default popup
     *  content
     */
    mainTpl: "<table>{0}</table>",

    /** private: config[coordTpl]
     *  ``String`` Used to generate the base Ext.Template used for coordinates in
     *  popup content
     */
    coordTpl: "<tr><td width=\"150\">Swiss coordinate</td>" +
        "<td>{coord_x} {coord_y}</td></tr>" +
        "<tr><td>WGS 84</td><td>{wsg_x} {wsg_y}</td></tr>",

    /** private: config[elevationTpl]
     *  ``String`` Used to generate the base Ext.Template used for elevation in
     *  popup content
     */
    elevationTpl: "<tr><td>Elevation (Terrain)</td><td>{elevation_dtm} [m]</td></tr>" +
        "<tr><td>Elevation (Surface)</td><td>{elevation_dsm} [m]</td></tr>" +
        "<tr><td>Height (Surface-Terrain)</td><td>{elevation_dhm} [m]</td></tr>" +
        "<tr><td>Slope</td><td>{elevation_slope} [°]</td></tr>",

    /** private: config[streetViewTpl]
     *  ``String`` Used to generate the base Ext.Template used streetview link in
     *  popup content
     *
     *  For reference:
     *
     *  - ll: lonlat map
     *  - cbll: lonlat streetview
     *  - cbp:
     *    - Street View/map arrangement,
     *    - Rotation angle/bearing (in degrees),
     *    - Tilt angle,
     *    - Zoom level,
     *    - Pitch (in degrees)
     *  - layer: Turns overlays on and off:
     *    t for traffic, c for street view, or tc for both at the same time.
     *
     *  `More info <http://mapki.com/wiki/Google_Map_Parameters#Street_View>`_
     */
    streetViewTpl: "<tr><td><a href='http://maps.google.ch/?ie=UTF8" +
        "&ll={streetviewlat},{streetviewlon}&layer=c" +
        "&cbll={streetviewlat},{streetviewlon}&cbp=12,57.78,,0,8.1' " +
        "target='_blank'><font color='#990000'>{streetviewlabel}</font></a></td></tr>",

    /** private: config[streetViewLink]
     *  ``Boolean`` Enable or disable the streeView link in the right click popup
     */
    streetViewLink: true,

    /** private: config[map]
     *  ``Object`` Map ref
     */
    map: null,

    /** private: config[serviceUrl]
     *  ``String`` URL to access the profile service
     */
    serviceUrl: null,

    /** private: config[popupTitleText]
     *  ``String``
     *  Text for the popup window title (i18n).
     */
    popupTitleText: 'Location',

    /** private: config[handleRightClicks]
     *  ``Boolean`` Whether or not to handle right clicks (OpenLayers Control).
     */
    handleRightClicks: true,

    /** private: config[defaultHandlerOptions]
     *  ``Object`` Handler default config
     */
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    /** private: config[rightclickWindowConfig]
     *  ``Object`` Override default window config
     */
    rightclickWindowConfig: {},

    /** private: method[initialize]
     *  :arg options: ``Object``
     */
    initialize: function(options) {

        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );

        // handle user template or use default
        if (!this.tpl) {
            // generate main Ext.Template
            var content = this.coordTpl;
            if (this.serviceUrl) {
                content += this.elevationTpl;
            }
            if (this.streetViewLink) {
                content += this.streetViewTpl;
            }
            var tpl = new Ext.Template(this.mainTpl);
            tpl.compile();
            this.tpl = tpl.apply([content]);
        }

        this.tpl = OpenLayers.i18n(this.tpl);

        this.eventMethods = {
            'rightclick': this.handleRightClick
        };

        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );

        this.handler = new OpenLayers.Handler.Click(
            this, this.eventMethods, this.handlerOptions
        );
        this.map.viewPortDiv.oncontextmenu = function(e) {
            e = e ? e : window.event;
            if (e.preventDefault) {
                e.preventDefault(); // For non-IE browsers.
            } else {
                return false; // For IE browsers.
            }
        };
        this.map.addControl(this);
        this.activate();
    },

    /** private: method[handleRightClick]
     *  Trigger popup display/refresh
     *
     *  :arg ev: ``Object`` DOM Event Object
     */
    handleRightClick: function(ev) {
        this.lonLat = this.map.getLonLatFromPixel(ev.xy);
        this.xy = ev.xy;
        if (this.serviceUrl) {
            // use server service to get data
            this.request(ev);
        } else {
            // no server request
            /* using defer because otherwise the updateTooltip is called before
              the oncontextmenu preventDefault both in IE and FF and the
              default right-clic menu is still displayed */
            this.updateTooltip.defer(100, this, [null, ev.clientX, ev.clientY], false);
        }
    },

    /** private: method[hideMouseOver]
     *  Update popup
     *
     *  :arg response: ``String`` Popup content
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    updateTooltip: function(response, clientX, clientY) {
        // Set popup content
        var content = this.getContent(response);
        if (this.popup) {
            this.popup.destroy();
        }
        this.popup = new GeoExt.Popup(Ext.apply({
            cls: 'positionPopup',
            title: this.popupTitleText,
            location: this.map.getLonLatFromPixel(this.xy),
            //location: new OpenLayers.Pixel(500,500),
            width:300,
            map: this.map,
            html: content,
            maximizable: false,
            collapsible: false,
            unpinnable: false
        },this.rightclickWindowConfig));
        this.popup.show();
    },

    /** private: method[success]
     *  Callback used if the server side request is successful
     *  Trigger popup update
     *
     *  :arg response: ``Object`` Ext.Ajax.request response
     *  :arg scope: ``Object`` request context
     *  :arg clientX: ``Int`` Mouse x coordinate
     *  :arg clientY: ``Int`` Mouse y coordinate
     */
    success: function(response, scope, clientX, clientY) {
        this.updateTooltip(response, clientX, clientY);
    },

    CLASS_NAME: "cgxp.plugins.ContextualData.ContextPopup"
});
