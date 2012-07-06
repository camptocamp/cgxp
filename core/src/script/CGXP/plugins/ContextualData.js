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
 *    Options:
 *    * events - ``Ext.util.Observable`` The application events manager.
 */
cgxp.plugins.ContextualData = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_contextualdata */
    ptype: "cgxp_contextualdata",

    /**
     * APIProperty: url
     *  ``String`` URL of the text search service. Typically set to
     *  ``"${request.route_url('fulltextsearch', path='')}"``.
     */
    url: null,

    /**
     * APIProperty: enabledAction
     *  ``String`` the type of action triggering the context data query and 
     *  display.
     *  possible values are: 'all', 'mouseover', 'rightclick'.
     *  'mouseover' enable a tool in the toolbar which allow to display the 
     *  context data popup on mouseover on the map.
     *  'rightclick' allow to display the context data popup on right-click on 
     *  the map.
     *  'all' enable both behavior.
     *  default is 'all'
     *  
     */
    enabledAction: 'all',

    /**
     * APIProperty: streetViewLink
     *  ``Boolean`` enable or disable the streeView link in right-click context
     * menu.
     * true to enable, 
     * false to disable, 
     * default is true.
     */
    streetViewLink: true,

    /**
     * APIProperty: tpls
     *  ``Object`` Allow to override the Ext.Template used for mouseover, 
     *  rightclick or both window content.
     *  The variable between curly brackets are automaticaly replaced with the 
     *  values recovered from server side.
     *  Example:
     *  tpls: {
     *      all: "{swiss_coord_label} : {swiss_x} {swiss_y}<br />" + 
     *          "{wsg_coord_label} : {wsg_x} {wsg_y}<br />" +
     *          "{elevation_label} (Terrain) : {elevation_dtm} [m]<br />" + 
     *          "{elevation_label} (Surface) : {elevation_dsm} [m]<br />" +
     *          "Hauteur (Surface-Terrain) : {elevation_dhm} [m]<br />"
     *  }
     *  or
     *  tpls: {
     *      mouseoverTpl: "...some text/html...",
     *      rightclickTpl: "...some text/html..."
     *  }
     */
    tpls: null,

    /**
     * APIMethod: handleServerData
     *  Method intended to be overriden at config level, so users dans specify
     *  specific treatments on server data
     *
     *  Parameters:
     *  data {Object} an Ext.Ajax.request responseText
     *  
     *  Return:
     *  {Object}
     *
     *  Full config example:
     *  {
     *     ptype: "cgxp_contextualdata",
     *     url: "${request.route_url('raster', path='')}",
     *     actionTarget: "center.tbar",
     *     tpls: {
     *         allTpl: "{swiss_coord_label} : {swiss_x} {swiss_y}<br />" + 
     *                 "{wsg_coord_label} : {wsg_x} {wsg_y}<br />" + 
     *                 "{elevation_label} (Terrain) : {elevation_dtm} [m]<br />" + 
     *                 "{elevation_label} (Surface) : {elevation_dsm} [m]<br />" +
     *                 "Hauteur (Surface-Terrain) : {elevation_dhm} [m]<br />" + 
     *                 "{custom_data_label} : {custom_data_value}"
     *     },
     *     handleServerData: function(data) {
     *         if (data.some_data) {
     *             // do some treatments ....
     *
     *             return {
     *                 'custom_data_value': data.some_data,
     *                 'custom_data_label': OpenLayers.i18n('custom_data_label')
     *             };
     *         }
     *     }
     *  }
     *  
     */
    handleServerData: function(data) {
        return {}
    },

    /**
     * Property: mouseoverTpl
     *  ``String`` text/html used for the Ext Template for the mouseover tooltips 
     *  window content.
     */
    mouseoverTpl: null,

    /**
     * Property: rightclickTpl
     *  ``String`` text/html used for the Ext Template for the rightclick context 
     *  window content.
     */
    rightclickTpl: null,

    /** api: method[addActions]
     */
    addActions: function() {

        if (this.tpls) {
            if (this.tpls.allTpl) {
                this.mouseoverTpl = this.rightclickTpl = this.tpls.allTpl;
            } else {
                if (this.tpls.mouseoverTpl) {
                    this.mouseoverTpl = this.tpls.mouseoverTpl;
                }
                if (this.tpls.rightclickTpl) {
                    this.rightclickTpl = this.tpls.rightclickTpl;
                }
            }
        }
        
        if (this.enabledAction == 'all' || this.enabledAction == 'rightclick') {
            // Rigth Clic-context menu
            var control = new cgxp.plugins.ContextualData.ContextPopup({
                handleRightClicks:true,
                map: this.target.mapPanel.map,
                serviceUrl: this.url,
                zoomWheelEnabled:false,
                tpl: this.rightclickTpl,
                handleServerData: this.handleServerData,
                streetViewLink: this.streetViewLink
            });
            this.target.mapPanel.map.addControl(control);
        }

        if (this.enabledAction == 'all' || this.enabledAction == 'mouseover') {
            // Tooltip
            var control = new cgxp.plugins.ContextualData.Tooltip({
                serviceUrl: this.url,
                tpl: this.mouseoverTpl,
                handleServerData: this.handleServerData
            });
            this.target.mapPanel.map.addControl(control);
            var action = new GeoExt.Action(Ext.applyIf({
                allowDepress: true,
                enableToggle: true,
                iconCls: 'infotooltip',
                tooltip: OpenLayers.i18n("ContextualData.actiontooltip"),
                toggleGroup: this.toggleGroup,
                control: control
            }, this.options));
            return cgxp.plugins.ContextualData.superclass.addActions.apply(this, [[action]]);
        } else {
            return null;
        }
    }
});

Ext.preg(cgxp.plugins.ContextualData.prototype.ptype, cgxp.plugins.ContextualData);

/**
 * Class: cgxp.plugins.ContextualData.Control
 * Allows mouseover with server query
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.ContextualData.Control = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: serviceUrl
     * URL to access the profile service
     */
    serviceUrl: null,

    /**
     * Method getContent
     * Treat server response and generate the popup html content
     * 
     * Parameters:
     * response (Object) Ext.Ajax.request response
     */
    getContent: function(response) {
        // Set popup content
        var swiss_x = (Math.round(this.lonLat.lon * 10) / 10).toFixed(1);
        var swiss_y = (Math.round(this.lonLat.lat * 10) / 10).toFixed(1);
        this.lonLat.transform(this.map.getProjectionObject(), 
                              new OpenLayers.Projection("EPSG:4326"));
        // Set popup content
        var values = {
            'swiss_coord_label': OpenLayers.i18n('Swiss Coordinate'), 
            'swiss_x': swiss_x, 
            'swiss_y': swiss_y, 
            'wsg_coord_label': OpenLayers.i18n('WGS 84'), 
            'wsg_x': Math.round(this.lonLat.lon * 100000) / 100000, 
            'wsg_y': Math.round(this.lonLat.lat * 100000) / 100000
        };

        // Set streetView popup content
        if (this.streetViewLink) {
            Ext.apply(values, {
                'streetviewlabel': OpenLayers.i18n('StreetView Link'),
                //'streetviewlonlat': this.lonLat.toShortString().replace(' ','') 
                'streetviewlat': this.lonLat.lat, 
                'streetviewlon': this.lonLat.lon
            });
        }

        if (response) {
            var data = Ext.decode(response.responseText);

            // default server data handling
            var serverValues = {}
            // specific elevation treatments
            if (data.mns && data.mnt) {
                var Dh=Math.round((data.mns-data.mnt)*10)/10;
                if (Dh<0) {
                    Dh=0;
                }
                Ext.apply(serverValues, {
                    'elevation_label': OpenLayers.i18n('Elevation'),
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
                    cgxp.tools.openWindow({html: OpenLayers.i18n('The value' + 
                        'returned by the handleServerData methode must be an ' + 
                        'object. See the example in the API.')},
                        OpenLayers.i18n('Error notice'), 600, 200);
                } else {
                    Ext.apply(values, userValues);
                }
            }
        }

        var tpl = new Ext.Template(this.tpl);
        tpl.compile();
        return tpl.apply(values);
    },

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

    success: function(response, scope, clientX, clientY) {
        // pass
    },

    failure: function(response, scope, clientX, clientY) {
        // pass
    }
});

/**
 * Class: cgxp.plugins.ContextualData.Tooltip
 * Allows mouseover with server query
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.ContextualData.Tooltip = OpenLayers.Class(cgxp.plugins.ContextualData.Control, {

    /**
     * Property: defaultTpl
     * Default Ext.Template used for popup content
     */
    defaultTpl: "{swiss_coord_label} : {swiss_x} {swiss_y}<br />" + 
        "{wsg_coord_label} : {wsg_x} {wsg_y}<br />",

    /**
     * Property: defaultTplElevation
     * Default Ext.Template used for popup content with server elevation data
     */
    defaultTplElevation: "{elevation_label} (Terrain) : {elevation_dtm} [m]<br />" + 
        "{elevation_label} (Surface) : {elevation_dsm} [m]<br />" +
        "Hauteur (Surface-Terrain) : {elevation_dhm} [m]<br />",

    /**
     * Property: showLocationInMapRequestOngoing
     * {Boolean} Tells if a request is currently waiting for a response
     */
    showLocationInMapRequestOngoing: false,

    /**
     * Property: wait
     * {Boolean} Delay to prevent too close update (set to 200ms)
     *  Help attenuating a flickering effect of the window.
     */
    wait: false,

    /**
     * Property: serviceUrl
     * URL to access the profile service
     */
    serviceUrl: null,

    /**
     * Property: popupId
     * {String} id if the right click popup window
     */
    popupId: 'contextualDataPopup',

    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0, //tolerance
        'stopSingle': false,
        'stopDouble': false
    },

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

        this.win = new Ext.Window({
            layout:'fit',
            width:225,
            closable:false,
            plain: false,
            draggable: false,
            title: 'Position et altitude',
            bodyStyle: 'padding:3px;',
            html: '<div style="background-color: rgb(255, 255, 208);" id="' + 
                  this.popupId + '"></div>'
        });
        this.win.render(Ext.getBody());
    },

    hideMouseOver: function(ev) {
        var popup = Ext.get(this.popupId).dom;
        popup.innerHTML = "";
        this.win.hide(this);
    },

    updateTooltip: function(response, clientX, clientY) {
          
        var popup = Ext.get(this.popupId).dom;
        var content = this.getContent(response);

        popup.innerHTML = content
        var topPixel = clientY + 10;
        var leftPixel = clientX + 10;
        this.win.hide(this);
        this.win.x = leftPixel;
        this.win.y = topPixel;
        this.win.show(this);

        this.showLocationInMapRequestOngoing = false;
    },

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

    success: function(response, scope, clientX, clientY) {
        this.updateTooltip(response, clientX, clientY);
    },

    failure: function(response, scope, clientX, clientY) {
        this.showLocationInMapRequestOngoing = false;
    },

    activate: function() {
        this.map.events.register('mousemove', this, this.showLocationTooltip);
        this.map.events.register('mouseout', this, this.hideMouseOver);
    },

    deactivate: function() {
        this.hideMouseOver();
        this.map.events.unregister('mousemove', this, this.showLocationTooltip);
        this.map.events.unregister('mouseout', this, this.hideMouseOver);
    },

    clearWait: function() {
        this.wait = false;
    },

    CLASS_NAME: "cgxp.plugins.ContextualData.Tooltip"
});

/**
 * Class: cgxp.plugins.ContextualData.ContextPopup
 * Allows right-clic popup with server query
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
cgxp.plugins.ContextualData.ContextPopup = OpenLayers.Class(cgxp.plugins.ContextualData.Control, {

    /**
     * Property: mainTpl
     * Base Ext.Template used for default popup content
     */
    mainTpl: "<table>{0}</table>",

    /**
     * Property: coordTpl
     * Ext.Template used for coordinate in popup content
     */
    coordTpl: "<tr><td width=\"150\">{swiss_coord_label}</td>" + 
        "<td>{swiss_x} {swiss_y}</td></tr>" + 
        "<tr><td>{wsg_coord_label}</td><td>{wsg_x} {wsg_y}</td></tr>",

    /**
     * Property: elevationTpl
     * Ext.Template used for elevation in popup content
     */
    elevationTpl: "<tr><td>{elevation_label} (Terrain)</td><td>{elevation_dtm} [m] </td></tr>" + 
        "<tr><td>{elevation_label} (Surface)</td><td>{elevation_dsm} [m] </td></tr>" +
        "<tr><td>Hauteur (Surface-Terrain)</td><td>{elevation_dhm} [m] </td></tr>" +
        "<tr><td>Pente du terrain</td><td>{elevation_slope} [° dég.] </td></tr>",

    /**
     * Property: streetViewTpl
     * Ext.Template used for streetview link in popup content
     *
     * for reference:
     * ll: lonlat map
     * cbll: lonlat streetview
     * cbp: Street View/map arrangement,
     *      Rotation angle/bearing (in degrees),
     *      Tilt angle,
     *      Zoom level,
     *      Pitch (in degrees)
     * layer: Turns overlays on and off. 
     *      t for traffic, c for street view, or tc for both at the same time.
     * http://mapki.com/wiki/Google_Map_Parameters#Street_View
     */
    streetViewTpl: "<tr><td><a href='http://maps.google.ch/?ie=UTF8" +
        "&ll={streetviewlat},{streetviewlon}&layer=c" +
        "&cbll={streetviewlat},{streetviewlon}&cbp=12,57.78,,0,8.1' " + 
        "target='_blank'><font color='#990000'>{streetviewlabel}</font></a></td></tr>",

    /**
     * Property: streetViewLink
     * {Boolean} enable or disable the streeView link in the right click popup
     */
    streetViewLink: true,

    /**
     * Property: map
     * map ref
     */
    map: null,

    /**
     * Property: serviceUrl
     * URL to access the profile service
     */
    serviceUrl: null,

    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    /**
     * OLProperty: handleRightClicks
     *  ``Boolean`` Whether or not to handle right clicks. 
     */
    handleRightClicks: true,

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

    updateTooltip: function(response, clientX, clientY) {
        // Set popup content
        var content = this.getContent(response);
        if (this.popup) {
            this.popup.destroy();
        }
        this.popup = new GeoExt.Popup({
            cls: 'positionPopup',
            title: OpenLayers.i18n('Position'),
            location: this.map.getLonLatFromPixel(this.xy),
            //location: new OpenLayers.Pixel(500,500),
            width:300,
            map: this.map,
            html: content,
            maximizable: false,
            collapsible: false,
            unpinnable: false
        }); 
        this.popup.show();
    },

    success: function(response, scope, clientX, clientY) {
        this.updateTooltip(response, clientX, clientY);
    },

    CLASS_NAME: "cgxp.plugins.ContextualData.ContextPopup"
});