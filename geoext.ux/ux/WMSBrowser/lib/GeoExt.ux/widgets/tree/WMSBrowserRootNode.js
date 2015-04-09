/**
 * Copyright (c) 2008-2010 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux.tree");

/*
 * @requires GeoExt.ux/widgets/WMSBrowser.js
 * @requires GeoExt/widgets/tree/WMSCapabilitiesLoader.js
 */

/** api: (define)
 *  module = GeoExt.ux.tree
 *  class = WMSBrowserRootNode
 */

/** api: constructor
 *  .. class:: WMSBrowserRootNode
 */
GeoExt.ux.tree.WMSBrowserRootNode = Ext.extend(Ext.tree.AsyncTreeNode, {

    /** private: property[INIT_URL]
     *  ``String`` The url used on first load.  This is a hack to allow the tree
     *  to be rendered.
     */
    INIT_URL: "__foo__",

    /** api: config[wmsbrowser]
     * :class:`GeoExt.ux.data.WMSBrowser` A reference to the main browser object
     */
    wmsbrowser: null,

    /** private: config[loader]
     * :class:`GeoExt.tree.WMSCapabilitiesLoader`
     */
    loader: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        Ext.apply(this, config);

        var self = this;
        var wmsBrowserTreeNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
            renderElements: function(n, a, targetNode, bulkRender) {
                Ext.tree.TreeNodeUI.prototype.renderElements.apply(this, arguments);
                if (n.childNodes.length === 0) {
                    this.onIconClsChange(n);
                }
            },
            onIconClsChange: function(node, cls, oldCls) {
                if (this.rendered) {
                    var iconCls = 'x-tree-node-noicon';
                    var elem = Ext.fly(this.iconNode);
                    elem.dom.title = '';

                    var compatible = self.wmsbrowser.treePanel.isLayerCompatible(
                        node.attributes.layer, true);
                    if (!compatible.compatible) {
                        iconCls = 'x-tree-node-icon-unsupported';
                        var message =
                            self.wmsbrowser.layerCantBeAddedText + '\n' +
                            compatible.reasons.join(',\n');
                        elem.dom.title = message;
                    }
                    else if (node.attributes.layer.queryable) {
                        iconCls = 'x-tree-node-icon-queryable';
                        elem.dom.title = self.wmsbrowser.queryableTooltip;
                    }

                    elem.replaceClass(this.iconCls, iconCls);
                    this.iconCls = iconCls;
                }
            }
        });
        this.loader = new GeoExt.tree.WMSCapabilitiesLoader({
            url: this.INIT_URL,
            layerOptions: {buffer: 0, ratio: 1},
            layerParams: {'TRANSPARENT': 'TRUE'},
            // customize the createNode method to add a checkbox to nodes
            createNode: function(attr) {
                attr.checked = attr.leaf ? false : undefined;
                attr.uiProvider = 'wmsbrowser';
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            },
            uiProviders: {
                wmsbrowser: wmsBrowserTreeNodeUI
            },
            listeners: {
                beforeload: function(loader, node, callback) {
                    return loader.url != this.INIT_URL;
                },
                scope: this
            }
        });

        arguments.callee.superclass.constructor.call(this, config);

        // events registration
        this.on('load', this.onWMSCapabilitiesLoad, this);
        this.on('loadexception', this.onWMSCapabilitiesLoadException, this);
    },

    /** private: method[setLoaderURL]
     *  :param url: ``String``
     *
     *  Set the loader url to the given url and reload.
     */
    setLoaderURL: function(url) {
        this.loader.url = url;
        this.reload();
    },

    /** private: method[onWMSCapabilitiesLoad]
     *  Called on "load" event.  Fires any "success" or "failure" events/methods
     */
    onWMSCapabilitiesLoad: function(store) {
        if (this.hasChildNodes()) {
            // Expand WMS services
            Ext.each(this.childNodes, function(node) {
                node.expanded = true;
            });
            this.wmsbrowser.fireEvent('getcapabilitiessuccess');
        }
        else if (store.loader.url != this.INIT_URL) {
            this.onWMSCapabilitiesLoadException();
        }
    },

    /** private: method[onWMSCapabilitiesLoadException]
     *  Called on load failure.  Fires the according event.
     */
    onWMSCapabilitiesLoadException: function() {
        this.wmsbrowser.fireEvent('getcapabilitiesfail');
    },

    /** private: method[getLayerNameFromCheckedNodes]
     *  :return:  ``String``
     *  Collect and return all checked node layer title or name into a single
     *  string separated by ','.
     */
    getLayerNameFromCheckedNodes: function() {
        var layerName = [];

        this.cascade(function(){
            var layer = this.attributes.layer;

            // skip nodes without layers or not checked
            if (!layer || !this.getUI().isChecked()) {
                return;
            }

            if (layer.metadata.title !== "") {
                layerName.push(layer.metadata.title);
            } else if (layer.metadata.name !== "") {
                layerName.push(layer.metadata.name);
            }
        });

        return layerName.join(', ');
    },

    /** private: method[getNewLayerFromCheckedNodes]
     *  :return:  :class:`OpenLayers.Layer.WMS`
     *
     *  From all currently checked nodes, create and return a new
     *  :class:`OpenLayers.Layer.WMS` object.  All 'layers' parameters are
     *  merged together.
     *
     *  Note: this method doesn't set the layer name using the textbox.
     */
    getNewLayerFromCheckedNodes: function() {
        var newLayer;

        this.cascade(function(){
            var layer = this.attributes.layer;

            // skip nodes without layers or not checked
            if (!layer || !this.getUI().isChecked()) {
                return;
            }

            if (!newLayer) {
                newLayer = layer.clone();

                // this is hardcoded
                newLayer.mergeNewParams({
                    format: "image/png",
                    transparent: "true"
                });

                newLayer.mergeNewParams(
                    {'LAYERS': [newLayer.params.LAYERS]}
                );
            } else {
                newLayer.params.LAYERS.push(
                    layer.params.LAYERS
                );
                newLayer.mergeNewParams(
                    {'LAYERS': newLayer.params.LAYERS}
                );
            }
        });

        return newLayer;
    }
});
