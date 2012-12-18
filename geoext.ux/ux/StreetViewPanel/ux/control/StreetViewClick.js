/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = StreetViewClick
 */

Ext.namespace('GeoExt.ux');

/** api: constructor
 *  .. class:: StreetViewClick(options)
 *
 *      Create a click control
 *      Extends ``OpenLayers.Control``
 */
GeoExt.ux.StreetViewClick = OpenLayers.Class(OpenLayers.Control, {

    /** api: property[defaultHandlerOptions]
     *  Default options.
     */
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': true,
        'stopDouble': false
    },

    /** private: method[initialize]
     *  Initializes the control
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        OpenLayers.Util.extend(this.handlerOptions, this.defaultHandlerOptions);
        this.handler = new OpenLayers.Handler.Click(this, {
            'click': this.onClick,
            'dblclick': this.onDblclick},
                this.handlerOptions
                );
    },

    /** private: method[onClick]
     *  Update the Street View Panorama according to the clicked position
     */
    onClick: function(evt) {
        var lonlat = this.map.getLonLatFromViewPortPx(evt.xy);
        lonlat.transform(this.map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
        var clickedPosition = new GLatLng(lonlat.lat, lonlat.lon);
        this.streetviewclient.getNearestPanorama(clickedPosition, this.panorama.callback.createDelegate(this));
    },

    /** private: method[onDblclick]
     *  Not implemented
     */
    onDblclick: function(evt) {
        alert('doubleClick');
    }

});
