/**
 * @requires widgets/GoogleEarthPanel.js
 */

/** api: (define)
 *  module = cgxp
 *  class = GoogleEarthPanel
 *
 *  This class extends gxp.GoogleEarthPanel to add support for KML URL layers.
 *  gxp.GoogleEarthPanel uses the map's layers directly, which is not
 *  appropriate for us.  The map's layers are an GeoExt.data.LayerStore
 *  containing GeoExt.data.LayerRecords, which correspond to the high-level
 *  nodes in the layer tree, not the individual layer tree nodes (which we
 *  require).  Furthermore, OpenLayers only supports parsing KML files to
 *  extract features, it does not support the concept of a KML layer
 *  represented simply by a URL.  Therefore, we cannot use
 *  OpenLayers.Format.KML or OpenLayers.Layer.Vector.
 *
 *  Consequently we use a totally separate mechanism to manage KML URL layers
 *  in the GoogleEarthPanel.  KML URLs must first be converted to NetworkLinks,
 *  which can then be added as Features to the Google Earth plugin.  We
 *  maintain a feature cache of these network links, but we test for visibility
 *  by checking whether the feature has been added to the Google Earth plugin
 *  or not.  The visible/not visible state of the layers is effectively
 *  maintained by the Google Earth plugin.
 *
 *  We never clear or expire items from our feature cache because it is assumed
 *  that the NetworkLink features are small objects and in any case become
 *  invalid when the Google Earth plugin is destroyed.  Note that the Google
 *  Earth plugin is destroyed whenever the panel is hidden, see the comments in
 *  gxp.GoogleEarthPanel for an explanation.  Therefore, hiding the Google
 *  Earth panel destroys all state about which KML URL layers are visible or
 *  not, and when a new Google Earth Panel is created in its place it starts
 *  with no visible KML URL layers and an empty feature cache.
 *
 */
Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: GoogleEarthPanel(config)
 */
cgxp.GoogleEarthPanel = Ext.extend(gxp.GoogleEarthPanel, {

    /** private: property[featureCache]
     */
    featureCache: null,

    /** private: method[initComponent]
     */
    initComponent: function() {
        gxp.GoogleEarthPanel.prototype.initComponent.call(this);
        this.featureCache = {};
    },

    /** private: method[addKmlUrl]
     */
    addKmlUrl: function(kmlUrl) {
        if (!this.earth) {
            return;
        }
        var feature = this.findKmlUrlFeature(kmlUrl);
        if (!feature) {
            if (kmlUrl in this.featureCache) {
                feature = this.featureCache[kmlUrl];
            } else {
                var link = this.earth.createLink("");
                link.setHref(kmlUrl);
                feature = this.earth.createNetworkLink("");
                feature.set(link, false, false);
                this.featureCache[kmlUrl] = feature;
            }
            this.earth.getFeatures().appendChild(feature);
        }
    },

    /** private: findKmlUrlFeature
     */
    findKmlUrlFeature: function(kmlUrl) {
        if (kmlUrl in this.featureCache) {
            var feature = this.featureCache[kmlUrl];
            var childNodes = this.earth.getFeatures().getChildNodes();
            var i, n = childNodes.getLength();
            for (i = 0; i < n; ++i) {
                if (childNodes.item(i) === feature) {
                    return feature;
                }
            }
        }
        return null;
    },

    /** private: removeKmlUrl
     */
    removeKmlUrl: function(kmlUrl, feature) {
        if (!this.earth) {
            return;
        }
        feature = feature || this.findKmlUrlFeature(kmlUrl);
        if (feature) {
            this.earth.getFeatures().removeChild(feature);
        }
    },

    /** private: toggleKmlUrl
     */
    toggleKmlUrl: function(kmlUrl) {
        if (!this.earth) {
            return;
        }
        var feature = this.findKmlUrlFeature(kmlUrl);
        if (feature) {
            this.removeKmlUrl(kmlUrl, feature);
        } else {
            this.addKmlUrl(kmlUrl);
        }
    },

    /** private: method[addLayer]
     *  Adds a layer to the 3D visualization.
     *  Adds support for KML layers to the inherited GXP GoogleEarthPanel.
     */
    addLayer: function(layer, order) {
        gxp.GoogleEarthPanel.prototype.addLayer.apply(this, arguments);
        var lyr = layer.getLayer();
        if (lyr instanceof OpenLayers.Layer.Vector &&
            lyr.protocol instanceof OpenLayers.Protocol.HTTP &&
            typeof lyr.protocol.url == 'string' &&
            lyr.protocol.format instanceof OpenLayers.Format.KML) {
            this.addKmlUrl(lyr.protocol.url);
        }
    }
});

/** api: xtype = cgxp_googleearthpanel */
Ext.reg("cgxp_googleearthpanel", cgxp.GoogleEarthPanel);
