/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/*
 * @requires OpenLayers/Layer/WMTS.js
 */

/**
 * Class: OpenLayers.Layer.SwitchableWMTS
 * Extend the standard <OpenLayers.Layer.WMTS> class, adding support of two
 *     new configuration parameters that make the service base URL switch to
 *     the ``secondaryUrl`` when the current zoomlevel is greater than
 *     ``zoomThreshold``.
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.WMTS>
 */
OpenLayers.Layer.SwitchableWMTS = OpenLayers.Class(OpenLayers.Layer.WMTS, {

    /** 
     * Property: url
     * {String|Array(String)} The base URL or request URL template for the WMTS
     * service when zoomlevel threshold is reached.
     */
    secondaryUrl: null,

    /** 
     * Property: zoomThreshold
     * Max zoomlevel for using standard base url. Above this zoomlevel, the
     * secondaryUrl is used as base url.
     */
    zoomThreshold: null,

    getURL: function(bounds) {
        if (this.secondaryUrl && this.zoomThreshold &&
            this.map.getZoom() > this.zoomThreshold) {
            var standardUrl = this.url;
            this.url = this.secondaryUrl;
            var url = OpenLayers.Layer.WMTS.prototype.getURL.apply(this, [bounds]);
            this.url = standardUrl;
            return url;
        }

        return OpenLayers.Layer.WMTS.prototype.getURL.apply(this, [bounds]);
    }
});
