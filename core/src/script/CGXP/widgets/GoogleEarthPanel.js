/**
 * @requires widgets/GoogleEarthPanel.js
 */

/** api: (define)
 *  module = cgxp
 *  class = GoogleEarthPanel
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
            feature = this.featureCache[kmlUrl];
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
    }

});

/** api: xtype = cgxp_googleearthpanel */
Ext.reg("cgxp_googleearthpanel", cgxp.GoogleEarthPanel);
