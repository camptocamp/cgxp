/*
 * @requires OpenLayers/Layer/WMTS.js
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
