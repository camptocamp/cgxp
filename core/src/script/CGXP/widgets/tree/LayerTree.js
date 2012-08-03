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
 * @requires GeoExt/widgets/tree/LayerNode.js
 * @requires GeoExt/data/LayerRecord.js
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Format/WMTSCapabilities/v1_0_0.js
 * @requires GeoExt/widgets/tree/LayerParamNode.js
 * @include GeoExt/widgets/tree/TreeNodeUIEventMixin.js
 * @include GeoExt/plugins/TreeNodeActions.js
 * @include GeoExt/plugins/TreeNodeComponent.js
 * @include GeoExt/widgets/LayerOpacitySlider.js
 * @include CGXP/widgets/tree/TreeNodeLoading.js
 * @include CGXP/widgets/tree/TreeNodeComponent.js
 * @include CGXP/widgets/tree/TreeNodeTriStateUI.js
 */

Ext.namespace("cgxp.tree");

/** api: (define)
 *  module = cgxp.tree
 *  class = LayerTree
 */
cgxp.tree.LayerTree = Ext.extend(Ext.tree.TreePanel, {

    baseCls: 'layertree',
    enableDD: false,
    rootVisible: false,
    useArrows: true,

    /** api: config[uniqueTheme]
     *  ``Boolean``
     *  True to have only one theme on the layer tree, default to false.
     */
    uniqueTheme: false,

    /** api: config[frienlyUrl]
     *  ``Boolean``
     *  True to enable friendly URL support (HTML5 browsers only), default to true.
     */
    frienlyUrl: true,

    /** api: config[mapPanel]
     *  ``GeoExt.MapPanel``
     */
    mapPanel: null,

    /** api: config[themes]
     *  ``Object``
     *  The initialConfig of themes
     */
    themes: null,

    /** api: config[defaultThemes]
     *  ``Array of strings``
     *  The themes to load on start up
     */
    defaultThemes: null,

    /** api: config[wmsURL]
     *  ``String``
     *  The URL of the WMS service
     */
    wmsURL: null,

    /** api: config[wmsOptions]
     *  ``Object``
     *  Optional global configuration for WMS layers
     */
    wmsOptions: null,

    moveupText: "Raise",
    movedownText: "Move down",
    moreinfoText: "More information",
    deleteText: "Remove layer",
    opacityText: "Modify layer opacity",
    zoomtoscaleText: "This layer is not visible at this zoom level.",
    opacitylabelText: "Opacity",
    showhidelegendText: "Show/hide legend",
    themealreadyloadedText: "This theme is already loaded",

    /** private: property[stateEvents]
     *  ``Array(String)`` Array of state events
     */
    stateEvents: ["addgroup", "ordergroup", "removegroup", "themeopacitychange", "layervisibilitychange"],

    /** api: config[stateId]
     *  ``String``
     *  Prefix of parameters in the permalinks
     */
    stateId: 'tree',

    /** private: property[recordType]
     *  ``GeoExt.data.LayerRecord`` Custom record type based on
     *      GeoExt.data.LayerRecord
     */
    recordType: GeoExt.data.LayerRecord.create([{name: "disclaimer", name: "childLayers"}]),

    /** private: property[indexesToAdd]
     *  ``Array`` of ``Object`` with one 'index' attribute.
     */

    /**
     * Property: actionsPlugin
     */
    initComponent: function() {
        this.themes = this.themes || {};

        // fill displaynames one time for everybody
        function fillDisplayNames(nodes) {
            Ext.each(nodes, function(node) {
                node.displayName = OpenLayers.i18n(node.name);
                if (node.children) {
                    fillDisplayNames(node.children);
                }
            });
        }
        fillDisplayNames(this.themes.local);
        if (this.themes.external) {
            fillDisplayNames(this.themes.external);
        }

        this.root = {
            nodeType: 'async',
            children: [],
            expanded: true
        };

        this.actionsPlugin = new GeoExt.plugins.TreeNodeActions({
            listeners: {
                action: this.onAction,
                scope: this
            }
        });
        this.plugins = [
            this.actionsPlugin,
            new GeoExt.plugins.TreeNodeComponent(),
            new cgxp.tree.TreeNodeComponent({
                divCls: "legend-component",
                configKey: "legend"
            }),
            new cgxp.tree.TreeNodeLoading()
        ];
        var layerNodeUI = Ext.extend(cgxp.tree.TreeNodeTriStateUI, new GeoExt.tree.TreeNodeUIEventMixin());
        this.loader = new Ext.tree.TreeLoader({
            uiProviders: {
                layer: layerNodeUI,
                'default': cgxp.tree.TreeNodeTriStateUI
            }
        });
        cgxp.tree.LayerTree.superclass.initComponent.call(this, arguments);
        this.on({
            "beforeexpandnode": function(node) {
                node.eachChild(this.checkVisibility);
            },
            scope: this
        });
        this.getSelectionModel().on({
            "beforeselect": function() {
                return false;
            }
        });

        this.addEvents(
            /** private: event[addgroup]
             *  Fires after a theme is added.
             */
            "addgroup",

            /** private: event[removegroup]
             *  Fires after a theme is removed.
             */
            "removegroup",

            /** private: event[layervisibilitychange]
             *  Fires after a checkbox state changes
             */
            "layervisibilitychange",

            /** private: event[themeopacitychange]
             *  Fires after the theme opacity changes.
             */
            "themeopacitychange",

            /** private: event[ordergroup]
             *  Fires after the themes order is changed.
             */
            "ordergroup"
        );
        this.on('checkchange', function(node, checked) {
            this.fireEvent("layervisibilitychange");
            if (!this.changing) {
                this.changing = true;
                node.cascade(function(node){
                    node.getUI().toggleCheck(checked);
                });
                node.bubble(function(node){
                    if (node.parentNode) {
                        node.getUI().updateCheck();
                    }
                });
                this.changing = false;
            }
        }, this);
        this.changing = false;

        this.mapPanel.map.events.on({
            'zoomend': function() {
                this.getRootNode().cascade(this.checkInRange);
            },
            scope: this
        });

        this.on({
            "expandnode": function(node) {
                node.eachChild(this.checkInRange);
            }
        });
    },

    /** private: method[addGroup]
     *  Adds a layer group and its layers
     *
     *  :arg group: ``Object`` The group config object
     *  :arg internalWMS: ``Boolean``
     *  :arg scroll: ``Boolean``
     *  :returns: ``Ext.tree.TreeNode``
     */
    addGroup: function(group, internalWMS) {
        function addNodes(children, parentNode, level) {
            if (!level) {
                level = 1;
            }
            var checkedNodes = internalWMS ? group.layer.params.LAYERS : group.layers;
            Ext.each(children, function(item) {
                var actions = !internalWMS ? [{
                    action: "opacity",
                    qtip: this.opacityText
                }] : [];
                var nodeConfig = {
                    text: item.displayName,
                    name: item.name,
                    iconCls: 'no-icon',
                    loaded: true,
                    checked: checkedNodes.indexOf(item.name) != -1,
                    uiProvider: 'default',
                    component: !internalWMS ? this.getOpacitySlider(item, '90%') : null,
                    actions: actions,
                    expanded: item.isExpanded,
                    minResolutionHint: item.minResolutionHint,
                    maxResolutionHint: item.maxResolutionHint
                };
                this.addMetadata(item, nodeConfig);
                if (!item.children) {
                    this.addShowIn3DAction(item, nodeConfig);
                    this.addLegend(item, nodeConfig, level);
                    this.addScaleAction(item, nodeConfig);
                    Ext.apply(nodeConfig, {
                        nodeType: 'cgxp_layerparam',
                        leaf: true,
                        layer: item.layer,
                        allItems: group.allLayers,
                        item: item.name,
                        param: 'LAYERS',
                        layer_id: item.id, // layer_id is the id of the layer in database
                        editable: item.editable,
                        uiProvider: 'layer'
                    });
                }
                item.node = parentNode.appendChild(nodeConfig);
                if (item.children) {
                    addNodes.call(this, item.children, item.node, level+1);
                }
            }, this);
        }

        function updateMoveUp(el) {
            var isFirst = this.isFirst();
            if (isFirst) {
                el.addClass('disabled');
            } else {
                el.removeClass('disabled');
            }
        }

        function updateMoveDown(el) {
            var isLast = this.isLast();
            if (isLast) {
                el.addClass('disabled');
            } else {
                el.removeClass('disabled');
            }
        }

        var actions = internalWMS ? [{
            action: "opacity",
            qtip: this.opacityText
        }] : [];
        actions.push({
            action: "up",
            qtip: this.moveupText,
            update: updateMoveUp
        });
        actions.push({
            action: "down",
            qtip: this.movedownText,
            update: updateMoveDown
        });
        actions.push({
            action: "delete",
            qtip: this.deleteText
        });
        var groupNodeConfig = {
            text: group.displayName,
            groupId: group.name,
            internalWMS: internalWMS,
            iconCls: 'no-icon',
            cls: 'x-tree-node-theme',
            loaded: true,
            uiProvider: 'layer',
            checked: false,
            expanded: group.isExpanded,
            layer: group.layer,
            allOlLayers: group.allOlLayers,
            component: internalWMS ? this.getOpacitySlider(group) : null,
            actions: actions
        };
        if (internalWMS) {
            groupNodeConfig.nodeType = 'cgxp_layer';
        }
        this.addMetadata(group, groupNodeConfig, true);
        var groupNode = this.root.insertBefore(groupNodeConfig,
                                               this.root.firstChild);
        addNodes.call(this, group.children, groupNode, 1);
        this.fireEvent('addgroup');
        groupNode.expand(true, false);
        groupNode.collapse(true, false);

        groupNode.cascade(function(node) {
            if (node.attributes.expanded) {
                node.expand(false, false);
            }
        });

        groupNode.ui.show();
        groupNode.cascade(this.checkInRange);
        this.getRootNode().eachChild(function(n) {
            n.ownerTree.actionsPlugin.updateActions(n);
        });
        return groupNode;
    },

    /** private: method[addLegend]
     *  Adds the action and the legend component to a node config.
     */
    addLegend: function(item, nodeConfig, level) {
        if (!level) {
          level = 1;
        }
        var config = {};
        nodeConfig.actions = nodeConfig.actions || [];
        if (item.icon) {
            config.icon = item.icon;
        }
        else if (item.legendRule) {
            // there is only one class in the mapfile layer
            // we use a rule so that legend shows the icon only (no label)
            config.icon = this.getLegendGraphicUrl(item.layer, item.name, item.legendRule);
        }

        if (item.legend) {
            var src = (item.legendImage) ?
                item.legendImage :
                this.getLegendGraphicUrl(item.layer, item.name);

            if (src) {
                config.legend = new Ext.Container({
                    items: [{
                        xtype: 'box',
                        html: '<img src="' + src + '" />',
                        cls: 'legend_level_' + level.toString()
                    }],
                    listeners: {
                        render: function(cmp) {
                            cmp.getEl().setVisibilityMode(Ext.Element.DISPLAY);
                            cmp.getEl().hide.defer(1, cmp.getEl(), [false]);
                        }
                    }
                });

                nodeConfig.actions.push({
                    action: "legend",
                    qtip: this.showhidelegendText
                });
            }
        }
        if (config.icon) {
            config.iconCls = "x-tree-node-icon-wms";
        }
        Ext.apply(nodeConfig, config);
    },

    /** private: method[getLegendGraphicUrl]
     *  Helper to build the getLegendGraphic request URL.
     *  :arg layer: ``OpenLayers.Layer``
     *  :arg layerName: ``String``
     *  :arg rule: ``String`` the class name
     */
    getLegendGraphicUrl: function(layer, layerName, rule) {
        if (!layer) {
            return false;
        }
        var layerNames = [layer.params.LAYERS].join(",").split(",");

        var styleNames = layer.params.STYLES &&
                             [layer.params.STYLES].join(",").split(",");
        var idx = layerNames.indexOf(layerName);
        var styleName = styleNames && styleNames[idx];

        var url = layer.getFullRequestString({
            REQUEST: "GetLegendGraphic",
            WIDTH: null,
            HEIGHT: null,
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            LAYER: layerName,
            LAYERS: null,
            STYLE: (styleName !== '') ? styleName: null,
            STYLES: null,
            SRS: null,
            FORMAT: layer.format,
            RULE: rule
        });

        // add scale parameter - also if we have the url from the record's
        // styles data field and it is actually a GetLegendGraphic request.
        if(this.useScaleParameter === true &&
                url.toLowerCase().indexOf("request=getlegendgraphic") != -1) {
            var scale = layer.map.getScale();
            url = Ext.urlAppend(url, "SCALE=" + scale);
        }

        return url;
    },

    /** private method[addMetadata]
     *  Adds the action for the metadata.
     *  :arg item: ``Object``
     *  :arg nodeConfig ``Object``
     *  :arg prepend: ``Boolean``
     */
    addMetadata: function(item, nodeConfig, prepend) {
        var metadataUrl;
        if (Ext.isString(item.metadataURL)) {
            metadataUrl = item.metadataURL;
        }
        else if(Ext.isArray(item.metadataUrls)) {
            metadataUrl = item.metadataUrls[0].url;
        }
        if (metadataUrl) {
            nodeConfig.actions = nodeConfig.actions || [];
            var metadataAction = {
                action: "metadata",
                qtip: this.moreinfoText
            };
            if (prepend) {
                nodeConfig.actions.unshift(metadataAction);
            } else {
                nodeConfig.actions.push(metadataAction);
            }
            nodeConfig.metadataUrl = metadataUrl;
        }
    },

    /** private: method[addScaleAction]
     *  Adds the "zoom to scale" action.
     *  :arg item: ``Object``
     *  :arg nodeConfig: ``Object``
     */
    addScaleAction: function(item, nodeConfig) {
        var maxResolutionHint = item.maxResolutionHint,
            minResolutionHint = item.minResolutionHint;
        if (maxResolutionHint || minResolutionHint) {
            nodeConfig.actions = nodeConfig.actions || [];
            nodeConfig.actions.push({
                action: "zoomtoscale",
                qtip: this.zoomtoscaleText
            });
        }
    },

    /** private: method[addShowIn3DAction]
     *  Adds the action to show in 3D.
     *  :arg item: ``Object``
     *  :arg nodeConfig: ``Object``
     */
    addShowIn3DAction: function(item, nodeConfig) {
        if (item.kml) {
            nodeConfig.actions = nodeConfig.actions || [];
            nodeConfig.actions.push({
                action: "showin3d",
                qtip: OpenLayers.i18n("Tree.showin3d")
            });
            nodeConfig.kml = item.kml;
        }
    },

    /** private: method[getOpacitySlider]
     *  Adds the opacity slider block.
     *
     * :arg theme: ``Object``
     * :arg anchor: ``String``
     */
    getOpacitySlider: function(theme, anchor) {
        theme.slider = new GeoExt.LayerOpacitySlider({
            layer: theme.layer,
            isFormField: true,
            hideLabel: true,
            aggressive: true,
            anchor: anchor || '95%',
            plugins: new GeoExt.LayerOpacitySliderTip({
                template: '<div>' + this.opacitylabelText + ' {opacity}%</div>'
            })
        });
        theme.slider.on('changecomplete', function() {
            this.fireEvent('themeopacitychange');
        }, this);
        return new Ext.Container({
            layout: 'form',
            items: [theme.slider],
            listeners: {
                render: function(cmp) {
                    cmp.getEl().setVisibilityMode(Ext.Element.DISPLAY);
                    cmp.getEl().hide.defer(1, cmp.getEl(), [false]);
                }
            }
        });
    },

    /** private: method[onMetadataAction]
     *  Handles a click on the metadata icon.
     *
     *  :arg node: ``Object``
     */
    onMetadataAction: function(node) {
        window.open(node.attributes.metadataUrl);
    },

    /** private method[onAction]
     *  Called when a action image is clicked.
     *
     *  :arg node: ``Ext.tree.TreeNode``
     *  :arg action: ``String``
     *  :arg evt: ``Ext.EventObject``
     */
    onAction: function(node, action, evt) {
        var key;
        if (action.indexOf('legend') != -1) {
            action = 'legend';
        }
        switch (action) {
            case 'metadata':
                this.onMetadataAction(node);
                break;
            case 'delete':
                var tree = node.getOwnerTree();
                node.remove();
                if (node.attributes.layer) {
                    node.layer.destroy();
                }
                else {
                    Ext.each(node.attributes.allOlLayers, function(layer) {
                        layer.destroy();
                    });
                }
                tree.fireEvent('removegroup');
                this.getRootNode().eachChild(function(n) {
                    n.ownerTree.actionsPlugin.updateActions(n);
                });
                break;
            case 'opacity':
                var slider = node.component;
                if (!slider.getEl().isVisible()) {
                    slider.el.setVisibilityMode(Ext.Element.DISPLAY);
                    // calculate the size
                    slider.el.show();
                    slider.doLayout();
                    slider.el.hide();
                    slider.el.slideIn('t', {
                        useDisplay: true,
                        duration: 0.2,
                        callback: function(el) {
                            if (Ext.isIE) {
                                el.show({
                                    duration: 0.01
                                });
                            }
                        }
                    });
                } else {
                    slider.el.setVisibilityMode(Ext.Element.DISPLAY);
                    slider.el.slideOut('t', {
                        useDisplay: true,
                        duration: 0.2
                    });
                }
                break;
            case 'down':
                var next;
                var current = false;
                this.getRootNode().eachChild(function(n) {
                    if (n == node) {
                        current = true;
                    }
                    else if (current) {
                        next = n;
                        current = false;
                    }
                });
                var index = -next.attributes.allOlLayers.length;
                Ext.each(node.attributes.allOlLayers, function(layer) {
                    layer.map.raiseLayer(layer, index);
                });
                node.parentNode.insertBefore(node, node.nextSibling.nextSibling);
                this.getRootNode().eachChild(function(n) {
                    n.ownerTree.actionsPlugin.updateActions(n);
                });
                node.ui.removeClass('x-tree-node-over');
                if (Ext.enableFx){
                    node.ui.highlight();
                }
                node.getOwnerTree().fireEvent('ordergroup');
                break;
            case 'up':
                var previous;
                var find = false;
                this.getRootNode().eachChild(function(n) {
                    if (n == node) {
                        find = true;
                    }
                    else if (!find) {
                        previous = n;
                    }
                });
                var index = previous.attributes.allOlLayers.length;
                var layers = [].concat(node.attributes.allOlLayers);
                Ext.each(layers.reverse(), function(layer) {
                    layer.map.raiseLayer(layer, index);
                });
                node.parentNode.insertBefore(node, node.previousSibling);
                this.getRootNode().eachChild(function(n) {
                    n.ownerTree.actionsPlugin.updateActions(n);
                });
                node.ui.removeClass('x-tree-node-over');
                if(Ext.enableFx){
                    node.ui.highlight();
                }
                node.getOwnerTree().fireEvent('ordergroup');
                break;
            case 'legend':
                key = 'legend';
                break;
            case 'zoomtoscale':
                    var n = node,
                    map = n.layer.map,
                    res = map.getResolution(),
                    zoom,
                    center = map.getCenter(),
                    minResolutionHint = n.attributes.minResolutionHint,
                    maxResolutionHint = n.attributes.maxResolutionHint;
                if (maxResolutionHint && maxResolutionHint < res) {
                    zoom = map.getZoomForResolution(maxResolutionHint) + 1;
                } else if (minResolutionHint && minResolutionHint > res) {
                    zoom = map.getZoomForResolution(minResolutionHint);
                }
                map.setCenter(center, zoom);
                break;
            case 'showin3d':
                var googleEarthPanel = Ext.getCmp("googleearthpanel");
                if (googleEarthPanel) {
                    googleEarthPanel.toggleKmlUrl(node.attributes.kml);
                }
                break;
        }

        if (key) {
            var actionImg = evt.getTarget('.' + action, 10, true);
            var cls = action + "-on";
            if (!node[key].getEl().isVisible()) {
                actionImg.addClass(cls);
                node[key].el.setVisibilityMode(Ext.Element.DISPLAY);
                node[key].el.slideIn('t', {
                    useDisplay: true,
                    duration: 0.2,
                    callback: function(el) {
                        if (Ext.isIE) {
                            el.show({
                                duration: 0.01
                            });
                        }
                    }
                });
            } else {
                actionImg.removeClass(cls);
                node[key].el.setVisibilityMode(Ext.Element.DISPLAY);
                node[key].el.slideOut('t', {
                    useDisplay: true,
                    duration: 0.2
                });
            }
        }
    },

    /** private: method[checkVisibility]
     *  Checks layer visibility for the node (in case the node was previously hidden).
     *
     *  :arg node: ``Ext.tree.TreeNode``
     */
    checkVisibility: function(node) {
        // if node is LayerParamNode, set the node check correctly
        if (node.attributes.nodeType == 'gx_layerparam') {
            //node.attributes.checked =
                //node.layer.getVisibility() &&
                //node.getItemsFromLayer().indexOf(node.item) >= 0;
        }
    },

    /** private: method[parseChildren}
     *  Parses recursively the children of a group node.
     * 
     *  :arg child: ``Object`` the node to parse
     *  :arg layer: ``<OpenLayers.Layer.WMS>`` The reference to the OL Layer, 
     *      present only for internal WMS.
     *  :arg result: ``Object`` The result object of the parsed children, it contains
     *     - allLayers ``Array(String)`` The list of WMS subLayers for this layer.
     *     - checkedLayers ``Array(String)`` The list of checked subLayers.
     *     - disclaimer ``Object`` The list layers disclaimers.
     *     - allOlLayers ``Array(OpenLayers.Layer)`` The list of children layers (for non internal WMS).
     *  :arg currentIndex: ``int`` index there to add the layers on non 
     *          internal WMS (to have the right order).
     *  :arg realIndex: ``int`` the deference with ``currentIndex`` is that is 
     *          current index is where the layer should be added in the actual 
     *          configuration, the ``realIndex`` is the position where the 
     *          layer should be in the final configuration.
     */
    parseChildren: function(child, layer, result, currentIndex, realIndex) {
        if (child.children) {
            for (var j = child.children.length - 1; j >= 0; j--) {
                currentIndex += this.parseChildren(child.children[j], layer, result, currentIndex, realIndex);
                realIndex++;
            }
        }
        else {
            if (child.disclaimer) {
                result.disclaimer[child.disclaimer] = true;
            }
            result.allLayers.push(child.name);
            if (child.childLayers) {
                result.childLayers = result.childLayers || {};
                result.childLayers[child.name] = child.childLayers;
            }
            if (child.isChecked) {
                result.checkedLayers.push(child.name);
            }

            // put a reference to ol layer in the config object
            if (layer) {
                child.layer = layer;
            }
            else {
                if (child.type == "external WMS") {
                    child.layer = new OpenLayers.Layer.WMS(
                        child.name, child.url, {
                            STYLE: child.style,
                            LAYER: child.name,
                            FORMAT: child.imageType,
                            TRANSPARENT: child.imageType == 'image/png'
                        }, {
                            ref: child.name,
                            visibility: child.isChecked,
                            singleTile: true,
                            isBaseLayer: false
                        }
                    );
                    result.allOlLayers.push(child.layer);
                    this.mapPanel.layers.insert(currentIndex, [
                        new this.recordType({
                            disclaimer: child.disclaimer,
                            legendURL: child.legendImage,
                            layer: child.layer
                        }, child.layer.id)]);
                    return 1;
                }
                else if (child.type == "WMTS") {
                    var format = new OpenLayers.Format.WMTSCapabilities();
                    var allOlLayerIndex = result.allOlLayers.length;
                    var indexToAdd = {
                        currentIndex: currentIndex,
                        realIndex: realIndex
                    };
                    this.indexesToAdd.push(indexToAdd);
                    result.allOlLayers.push(null);
                    OpenLayers.Request.GET({
                        url: child.url,
                        scope: this,
                        success: function(request) {
                            var doc = request.responseXML;
                            if (!doc || !doc.documentElement) {
                                doc = request.responseText;
                            }
                            var capabilities = format.read(doc);
                            var capabilities_layers = capabilities.contents.layers
                            var capabilities_layer = null;
                            for (i = 0, ii = capabilities_layers.length;
                                    i < ii ; i++) {
                                if (capabilities_layers[i].identifier == child.name) {
                                    capabilities_layer = capabilities_layers[i];
                                }
                            }
                            var layer = format.createLayer(capabilities, {
                                ref: child.name,
                                layer: child.name,
                                maxExtent: capabilities_layer.bounds ?
                                    capabilities_layer.bounds.transform(
                                        "EPSG:4326",
                                        this.mapPanel.map.getProjectionObject()) :
                                    undefined,
                                style: child.style,
                                matrixSet: child.matrixSet,
                                dimension: child.dimension,
                                visibility: child.isChecked,
                                isBaseLayer: false,
                                mapserverURL: child.mapserverURL,
                                mapserverLayers: child.mapserverLayers
                            });
                            child.node.attributes.layer = layer;
                            name = child.name;
                            if (this.initialState && this.initialState['opacity_' + name]) {
                                layer.setOpacity(this.initialState['opacity_' + name]);
                            }
                            layer.setVisibility(child.node.attributes.checked);
                            result.allOlLayers[allOlLayerIndex] = layer;
                            this.mapPanel.layers.insert(indexToAdd.currentIndex, [
                                new this.recordType({
                                    disclaimer: child.disclaimer,
                                    legendURL: child.legendImage,
                                    layer: layer
                                }, layer.id)]);
                            Ext.each(this.indexesToAdd, function(idx) {
                                if (indexToAdd.realIndex < idx.realIndex) {
                                    idx.currentIndex++;
                                }
                            });
                            child.slider.setLayer(layer);
                            child.node.layer = layer;
                            layer.events.on({
                                "visibilitychanged": child.node.onLayerVisibilityChanged,
                                scope: child.node
                            });
                            child.node.on({
                                "checkchange": child.node.onCheckChange,
                                scope: child.node
                            });

                        }
                    });
                }
            }
        }
        return 0;
    },

    /** private :method[loadTheme]
     *  Loads a theme from the config.
     *
     *  :arg theme: ``Object`` the theme config
     */
    loadTheme: function(theme) {
        if (this.uniqueTheme) {
            for (var i = this.root.childNodes.length-1 ; i >= 0 ; i--) {
                node = this.root.childNodes[i];
                node.remove();
                node.layer.destroy();
                this.fireEvent('removegroup');
            }
        }

        var groupNodes = [];
        // reverse to have the first layer in the list at the top
        Ext.each(theme.children.concat().reverse(), function(group) {
            groupNodes.push(this.loadGroup(group, undefined, undefined, 
                    undefined, undefined, false));
        }, this);

        var minPosition = 9999;
        var node;
        Ext.each(groupNodes, function(groupNode) {
            var pos = this.root.indexOf(groupNode);
            if (pos >= 0 && pos < minPosition) {
                minPosition = pos;
                node = groupNode;
            }
        }, this);
        node.getUI().getEl().scrollIntoView(this.body, false);

        // change them in url
        if (this.uniqueTheme && this.frienlyUrl && history.replaceState) {
            var url = location.href;
            var tpos = url.indexOf('/theme/');
            var qpos = url.indexOf('?');
            var query = '';
            var th = '';
            var end = url.length;
            if (tpos > -1) {
                end = tpos + 7;
            } else {
                if (qpos > -1) {
                    end = qpos;
                }
                th = url.substr(end-1, 1) != '/' ? '/theme/' : 'theme/';
            }
            if (qpos > -1) {
                query = url.substr(qpos);
            }
            var newUrl = url.substr(0, end) + th + theme.name + query;
            history.replaceState({}, OpenLayers.i18n(theme.name), newUrl);
        }
    },

    /** api: method[loadGroup]
     *  Loads a layer group from the config.
     *
     *  :arg group: ``Object`` the group config
     *  :arg layers: ``Array`` the sub layers displayed at once. optional.
     *  :arg opacity: ``Float`` the OL layer opacity. optional.
     *  :arg visibility: ``Boolean`` the OL layer visibility. optional.
     *  :arg scroll: ``Boolean`` scroll on the element. optional, default to true.
     *  :returns: ``Ext.tree.TreeNode``
     */
    loadGroup: function(group, layers, opacity, visibility, nowarning, scroll) {
        scroll = scroll === undefined || scroll;

        var groupNode = this.root.findChild('groupId', group.name);
        nowarning = nowarning || false;
        if (!groupNode) {
            var index = this.mapPanel.layers.getCount();
            while (this.mapPanel.map.layers[index-1] instanceof OpenLayers.Layer.Vector && index > 0) { index-- }
            if (group.isInternalWMS !== false) {
                var params = {
                    layers: [],
                    format: 'image/png',
                    transparent: true
                };

                var isExternalgroup = function(name, themes) {
                    for (var i = 0, len = themes.external.length; i < len; i++) {
                        for (var j = 0, len2 = themes.external[i].children.length; j<len2; j++) {
                            if (themes.external[i].children[j].name == name) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                if (this.themes.external != undefined &&
                    isExternalgroup(group.name, this.themes)) {
                    params.external = true;
                }

                var layer = new OpenLayers.Layer.WMS(
                    group.displayName,
                    this.wmsURL, params, Ext.apply({
                        ref: group.name,
                        visibility: false,
                        singleTile: true,
                        isBaseLayer: false
                    }, this.wmsOptions || {})
                );

                var result = {
                    allLayers: [],
                    checkedLayers: [],
                    childLayers: null,
                    disclaimer: {}
                };
                this.parseChildren(group, layer, result);
                group.layer = layer;
                group.allLayers = result.allLayers;
                group.allOlLayers = [layer];
                layer.params.LAYERS = layers || result.checkedLayers;
                this.mapPanel.layers.insert(index,
                    new this.recordType({
                        disclaimer: result.disclaimer,
                        childLayers: result.childLayers,
                        layer: layer
                    }, layer.id));
                groupNode = this.addGroup(group, true);
            }
            else {
                var result = {
                    allLayers: [],
                    checkedLayers: [],
                    disclaimer: {},
                    childLayers: null,
                    allOlLayers: []
                };
                this.indexesToAdd = [];
                this.parseChildren(group, null, result, index, index);
                group.layers = result.checkedLayers;
                group.allLayers = result.allLayers;
                group.allOlLayers = result.allOlLayers;
                groupNode = this.addGroup(group, false);
            }
            if (scroll) {
                this.body.scrollTo('top', 0);
            }
        }
        else {
            layer = groupNode.attributes.layer;
            if (layers) {
                Ext.each(layers, function(l) {
                    node = groupNode.findChild('name', l, true);
                    this.fireEvent('checkchange', node, true);
                }, this);
            }
            if (scroll) {
                groupNode.getUI().getEl().scrollIntoView(this.innerCt, false);
            }
            if (!nowarning) {
                // delayed to solved conflict with scroll
                new Ext.util.DelayedTask(function() {
                    var html = [ 
                        '<div class="layertree-msg">',
                            this.themealreadyloadedText,
                        '</div>'
                    ].join('');
                    var msg = Ext.DomHelper.insertBefore(
                        this.body,
                        {
                            html: html,
                            xtype: 'container'
                        },
                        true
                    ).fadeIn();
                    new Ext.util.DelayedTask(function() {
                        var duration = 1;
                        msg.fadeOut({ duration: duration });
                        new Ext.util.DelayedTask(function() {
                            // make sure that the message is actually removed
                            // ("remove" option of fadeOut() doesn't seem to work)
                            msg.remove();
                        }).delay(duration * 1000);
                    }).delay(3000);
                }, this).delay(10);
            }
        }

        if (layer) {
            layer.setOpacity(opacity || 1);
            if (layer.params.LAYERS.length > 0) {
                layer.setVisibility(visibility !== false);
            }
        }

        return groupNode;
    },

    /** private: method[checkGroupIsAllowed]
     *  :arg group: ``Object``
     */
    checkGroupIsAllowed: function(group) {
        var checkGroup = function(group, themes) {
            for (var i = 0, len = themes.length; i < len; i++) {
                for (var j = 0, len2 = themes[i].children.length; j < len2; j++) {
                    if (themes[i].children[j].name == group) {
                        return true;
                    }
                }
            }
            return false;
        };

        var isAllowed = checkGroup(group, this.themes.local);
        if (this.themes.external != undefined && !isAllowed) {
            isAllowed = checkGroup(group, this.themes.external);
        }
        return isAllowed;
    },

    /** api: method[applyState]
     *  :arg state: ``Object``
     */
    applyState: function(state) {
        // actual state is loaded later in delayedApplyState to prevent
        // the layer from being displayed under the baselayers
        this.initialState = state;
    },

    /** private: method[delayedApplyState]
     */
    delayedApplyState: function() {
        if (!this.initialState) {
            return;
        }
        if (this.initialState.groups !== undefined) {
            this.defaultThemes = null;
        }
        var groups = Ext.isArray(this.initialState.groups) ?
            this.initialState.groups : [this.initialState.groups];
        Ext.each(groups.reverse(), function(t) {
            if (!this.checkGroupIsAllowed(t)) {
                return;
            }
            var opacity = this.initialState['group_opacity_' + t] ?
                this.initialState['group_opacity_' + t] : 1;
            var layers = this.initialState['group_layers_' + t] ?
                this.initialState['group_layers_' + t] : [];
            var visibility = layers != '' ? true : false;
            var group = this.findGroupByName(t);
            this.loadGroup(group, layers, opacity, visibility);
        }, this);
        this.root.cascade(function(node) {
            var layer = node.attributes.layer;
            var name = node.attributes.name;
            if (layer && ('opacity_' + name) in this.initialState) {
                layer.setOpacity(this.initialState['opacity_' + name]);
            }
            if (name && ('enable_' + name) in this.initialState) {
                node.getUI().toggleCheck(this.initialState['enable_' + name] != 'false');
            }
        }, this);
    },

    /** api: method[getState]
     *  :returns: ``Object``
     */
    getState: function() {
        var state = {};

        var groups = [];
        Ext.each(this.root.childNodes, function(group) {
            var id = group.attributes.groupId;
            groups.push(id);
            var layer = group.layer;
            if (group.attributes.internalWMS) {
                if (layer.opacity !== null && layer.opacity != 1) {
                    state['group_opacity_' + id] = layer.opacity;
                }
                if (layer.params.LAYERS.length > 0) {
                    state['group_layers_' + id] = [layer.params.LAYERS].join(',');
                }
            }
            else {
                group.cascade(function(node) {
                    var layer = node.attributes.layer;
                    if (layer && layer.opacity !== null && layer.opacity != 1) {
                        state['opacity_' + node.attributes.name] = layer.opacity;
                    }
                    if (layer) {
                        state['enable_' + node.attributes.name] = layer.visibility;
                    }
                });
            }
        }, this);
        state.groups = groups.join(',');

        return state;
    },

    /** api: method[findGroupByLayerName]
     *  Finds the group config for a specific layer using its name.
     *
     *  :arg name: ``String``
     */
    findGroupByLayerName: function(name) {
       var result = null;
       var parseChildren = function(node, group) {
           group = group || node;
           if (node.name && node.name == name) {
               result = group;
               return false;
           }
           if (node.children) {
               Ext.each(node.children, function(n) {
                   return parseChildren(n, group);
               });
           }
           return true;
       }
       Ext.each(['local', 'external'], function(location) {
            Ext.each(this.themes[location], function(t) {
                Ext.each(t.children, function(n) {
                    // recurse on all children
                    return parseChildren(n);
                });
            });
           return !result;
       }, this);
       return result;
    },

    /** api: method[findGroupByName]
     *  Finds the group config using its name.
     *
     *  :arg name: ``String``
     */
    findGroupByName: function(name) {
        var group = false;
        Ext.each(['local', 'external'], function(location) {
            Ext.each(this.themes[location], function(t) {
                Ext.each(t.children, function(g) {
                    if (g.name == name) {
                        group = g;
                        return false;
                    }
                }, this);
                if (group) {
                    return false;
                }
            }, this);
            if (group) {
                return false;
            }
        }, this);
        return group;
    },

    /** api: method[findThemeByName]
     *  Finds the theme config using its name.
     *
     *  :arg name: ``String``
     */
    findThemeByName: function(name) {
        var theme = false;
        Ext.each(['local', 'external'], function(location) {
            Ext.each(this.themes[location], function(t) {
                if (t.name == name) {
                    theme = t;
                    return false;
                }
            }, this);
            if (theme) {
                return false;
            }
        }, this);
        return theme;
    },

    /** api :method[checkInRange]
     *  Checks if a layer is in range (correct scale) and modifies node.
     *  rendering consequently
     *  :arg node: ``Ext.tree.TreeNode``
     */
    checkInRange: function(node) {
        if (!node.layer) {
            return;
        }
        var n = node,
            map = n.layer.map,
            resolution = map.getResolution(),
            minResolutionHint = n.attributes.minResolutionHint,
            maxResolutionHint = n.attributes.maxResolutionHint;
        if (n.getUI().rendered) {
            var legend = Ext.select(".gx-tree-layer-actions img.legend", true, n.getUI().elNode);
            legend.setVisibilityMode(Ext.Element.DISPLAY);
            var zoomToScale = Ext.select(".gx-tree-layer-actions img.zoomtoscale", true, n.getUI().elNode);
            zoomToScale.setVisibilityMode(Ext.Element.DISPLAY);
            var legendCmp = Ext.select(".legend-component", null, n.getUI().elNode);
            legendCmp.setVisibilityMode(Ext.Element.DISPLAY);

            if ((minResolutionHint && minResolutionHint > resolution) || (maxResolutionHint && maxResolutionHint < resolution)) {
                n.getUI().addClass("gx-tree-layer-outofrange");
                legend.hide();
                legendCmp.hide();
                zoomToScale.show();
            } else if (minResolutionHint || maxResolutionHint) {
                n.getUI().removeClass("gx-tree-layer-outofrange");
                legend.show();
                legendCmp.show();
                zoomToScale.hide();
            }

            Ext.select('img', false, n.getUI().elNode).each(function(image) {
                image = image.dom;
                if (image.src.indexOf('GetLegendGraphic') != -1) {
                    var url = image.src.split('?');
                    var params = Ext.urlDecode(url[1]);
                    params.scale = n.layer.map.getScale();
                    image.src = url[0] + '?' + Ext.urlEncode(params);
                }
            });
        }
    },

    /** api: ethod[loadDefaultThemes]
     *  Load the default Theme.
     */
    loadDefaultThemes: function() {
        if (this.defaultThemes) {
            // reverse to have the first theme in the list at the top
            Ext.each(this.defaultThemes.concat().reverse(), function(themeName) {
                theme = this.findThemeByName(themeName);
                // if found
                if (theme) {
                    this.loadTheme(theme);
                }
            }, this);
        }
    }
});

/** api: xtype = cgxp_layertree */
Ext.reg('cgxp_layertree', cgxp.tree.LayerTree);

cgxp.tree.LayerNode = Ext.extend(GeoExt.tree.LayerNode, {
    // we don't want the layer to manage the checkbox to avoid conflicts with the tristate manager
    onLayerVisibilityChanged: Ext.emptyFn
});
Ext.tree.TreePanel.nodeTypes.cgxp_layer = cgxp.tree.LayerNode;

cgxp.tree.LayerParamNode = Ext.extend(GeoExt.tree.LayerParamNode, {
    createParams: function(items) {
        var items2 = items.slice(0);
        // reverse the items list order so that mapserver layers are drawn
        // on the map in the same order than in the layertree
        items2.reverse();
        return cgxp.tree.LayerParamNode.superclass.createParams.apply(this, [items2]);
    },

    // we don't want the layer to manage the checkbox to avoid conflicts with the tristate manager
    onLayerVisibilityChanged: Ext.emptyFn
});
Ext.tree.TreePanel.nodeTypes.cgxp_layerparam = cgxp.tree.LayerParamNode;
