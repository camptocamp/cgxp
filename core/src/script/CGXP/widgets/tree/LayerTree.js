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

cgxp.tree.LayerParamNode = Ext.extend(GeoExt.tree.LayerParamNode, {
    createParams: function(items) {
        var items2 = items.slice(0);
        // reverse the items list order so that mapserver layers are drawn
        // on the map in the same order than in the layertree
        items2.reverse();
        return cgxp.tree.LayerParamNode.superclass.createParams.apply(this, [items2]);
    }
});
Ext.tree.TreePanel.nodeTypes.cgxp_layerparam = cgxp.tree.LayerParamNode;

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
     * ``Boolean``
     * True to have only one theme on the layer tree, default to false.
     */
    uniqueTheme: false,

    /**
     * Property: mapPanel
     */
    mapPanel: null,

    /**
     * Property: themes
     * The initialConfig of themes
     */
    themes: null,

    /**
     * Property: defaultThemes
     * The themes to load on start up 
     */
    defaultThemes: null,

    /**
     * Property: wmsURL
     * The url to the WMS service
     */
    wmsURL: null,

    moveupText: "Raise",
    movedownText: "Move down",
    moreinfoText: "More information",
    deleteText: "Remove layer",
    opacityText: "Modify layer opacity",
    zoomtoscaleText: "This layer is not visible at this zoom level.",
    opacitylabelText: "Opacity",
    showhidelegendText: "Show/hide legend",

    /** private: property[stateEvents]
     *  ``Array(String)`` Array of state events
     */
    stateEvents: ["addgroup", "ordergroup", "removegroup", "themeopacitychange", "layervisibilitychange"],

    // used for the permalink
    stateId: 'tree',

    /** private: property[recordType]
     *  ``GeoExt.data.LayerRecord`` Custom record type based on
     *      GeoExt.data.LayerRecord
     */
    recordType: GeoExt.data.LayerRecord.create([{name: "disclaimer"}]),

    /**
     * Property: actionsPlugin
     */
    initComponent: function() {
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
                action: this.onAction
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

        this.on('click', function(node) {
            node.getUI().toggleCheck(!node.getUI().isChecked());
        });

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

    /**
     * Method: addGroup
     * Adds a layer group and its layers
     *
     * Parameters:
     * {Object} The group config object
     */
    addGroup: function(group) {
        function addNodes(children, parentNode, level) {
            if (!level) {
                level = 1;
            }
            var checkedNodes = group.layer.params.LAYERS;
            Ext.each(children, function(item) {
                var nodeConfig = {
                    text: item.displayName,
                    name: item.name,
                    iconCls: 'no-icon',
                    loaded: true,
                    checked: checkedNodes.indexOf(item.name) != -1,
                    uiProvider: 'default',
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
                var node = parentNode.appendChild(nodeConfig);
                if (item.children) {
                    addNodes.call(this, item.children, node, level+1);
                }
            }, this);
        }
        
        function updateMoveUp(el) { 
            var isFirst = this.isFirst();
            if (isFirst && !this._updating &&
            this.nextSibling &&
            this.nextSibling.hidden === false) {
                this._updating = true; // avoid recursion
                var next = this.nextSibling;
                if (next) {
                    this.ownerTree.actionsPlugin.updateActions(next);
                }
                delete this._updating;
            }
            if (isFirst) {
                el.addClass('disabled');
            } else {
                el.removeClass('disabled'); 
            }
        }

        function updateMoveDown(el) { 
            var isLast = this.isLast();
            if (isLast && !this._updating &&
            this.previousSibling &&
            this.previousSibling.hidden === false) {
                this._updating = true; // avoid recursion
                var previous = this.previousSibling;
                if (previous) {
                    this.ownerTree.actionsPlugin.updateActions(previous);
                }
                delete this._updating;
            }
            if (isLast) {
                el.addClass('disabled'); 
            } else {
                el.removeClass('disabled'); 
            }
        }

        var groupNode = this.root.insertBefore({
            text: group.displayName,
            groupId: group.name,
            nodeType: 'cgxp_layer',
            iconCls: 'no-icon',
            cls: 'x-tree-node-theme',
            loaded: true,
            uiProvider: 'layer', 
            checked: false,
            layer: group.layer,
            component: this.getOpacitySlider(group),
            actions: [{
                action: "opacity",
                qtip: this.opacityText
            }, {
                action: "up",
                qtip: this.moveupText,
                update: updateMoveUp
            }, {
                action: "down",
                qtip: this.movedownText,
                update: updateMoveDown
            }, {
                action: "delete",
                qtip: this.deleteText
            }]
        }, this.root.firstChild);
        addNodes.call(this, group.children, groupNode, 1);
        this.fireEvent('addgroup');
        groupNode.expand(true, false);
        groupNode.collapse(true, false);
        if (group.isExpanded) {
            groupNode.expand(false, false); 
        }
        groupNode.cascade(this.checkInRange);
    },

    /**
     * Method: addLegend
     * Adds the action and the legend component to a node config
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
        if (item.legend) {
            if (item.legendRule) { // there is only one class in the mapfile layer
                // we use a rule so that legend shows the icon only (no label) 
                config.icon = this.getLegendGraphicUrl(item.layer, item.name, item.legendRule);
            } else  {
                var src = (item.legendImage) ?
                    item.legendImage :
                    this.getLegendGraphicUrl(item.layer, item.name); 

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

    /**
     * Method: getLegendGraphicUrl
     * Helper to build the getLegendGraphic request URL
     */
    getLegendGraphicUrl: function(layer, layerName, rule) {
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

    /**
     * Method: addMetadata
     * Adds the action for the metadata
     */
    addMetadata: function(item, nodeConfig) {
        var metadataUrl;
        if (Ext.isString(item.metadataURL)) {
            metadataUrl = item.metadataURL;
        }
        else if(Ext.isArray(item.metadataUrls)) {
            metadataUrl = item.metadataUrls[0].url;
        }
        if (metadataUrl) {
            nodeConfig.actions = nodeConfig.actions || [];
            nodeConfig.actions.push({
                action: "metadata",
                qtip: this.moreinfoText
            });
            nodeConfig.metadataUrl = metadataUrl;
        }
    },

    /**
     * Method: addScaleAction
     * Adds the "zoom to scale" action
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

    /**
     * Method: addShowIn3DAction
     * Adds the action to show in 3D
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

    /**
     * Method: getOpacitySlider
     * Adds the opacity slider block
     *
     * Parameters:
     * theme {Object}
     */
    getOpacitySlider: function(theme) {
        var slider = new GeoExt.LayerOpacitySlider({
            layer: theme.layer,
            isFormField: true,
            hideLabel: true,
            aggressive: true,
            anchor: '95%',
            plugins: new GeoExt.LayerOpacitySliderTip({
                template: '<div>' + this.opacitylabelText + ' {opacity}%</div>'
            })
        });
        slider.on('changecomplete', function() {
            this.fireEvent('themeopacitychange');
        }, this);
        return new Ext.Container({
            layout: 'form',
            items: [slider],
            listeners: {
                render: function(cmp) {
                    cmp.getEl().setVisibilityMode(Ext.Element.DISPLAY);
                    cmp.getEl().hide.defer(1, cmp.getEl(), [false]);
                }
            }
        });
    },

    /**
     * Method: onAction
     * Called when a action image is clicked
     */
    onAction: function(node, action, evt) {
        var layer = node.layer,
            key;
        if (action.indexOf('legend') != -1) {
            action = 'legend';
        }
        switch (action) {
            case 'metadata':
                window.open(node.attributes.metadataUrl);
                break;
            case 'delete':
                var tree = node.getOwnerTree();
                node.remove();
                node.layer.destroy();
                tree.fireEvent('removegroup');
                break;
            case 'opacity':
                var slider = node.component;
                if (!slider.getEl().isVisible()) {
                    slider.el.setVisibilityMode(Ext.Element.DISPLAY);
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
                layer.map.raiseLayer(layer, -1);
                node.parentNode.insertBefore(node, node.nextSibling.nextSibling);
                node.ownerTree.actionsPlugin.updateActions(node);
                node.ui.removeClass('x-tree-node-over');
                if(Ext.enableFx){
                    node.ui.highlight(); 
                }
                node.getOwnerTree().fireEvent('ordergroup');
                break;
            case 'up':
                layer.map.raiseLayer(layer, +1);
                node.parentNode.insertBefore(node, node.previousSibling);
                node.ownerTree.actionsPlugin.updateActions(node);
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

    /**
     * Method: checkVisibility
     * Checks layer visibility for the node (in case the node was previously hidden)
     */
    checkVisibility: function(node) {
        // if node is LayerParamNode, set the node check correctly
        if (node.attributes.nodeType == 'gx_layerparam') {
            //node.attributes.checked =
                //node.layer.getVisibility() &&
                //node.getItemsFromLayer().indexOf(node.item) >= 0;
        }
    },

    /**
     * Method: parseChildren
     * Parses recursively the children of a theme node.
     * 
     * Parameters:
     * child {Object} the node to parse
     * layer {<OpenLayers.Layer.WMS>} The reference to the OL Layer
     * result {Object} The result object of the parsed children, it contains
     *     - allLayers {Array(String)} The list of WMS subLayers for this layer.
     *     - checkedLayers {Array(String)} The list of checked subLayers.
     *     - disclaimer {Object} The list layers disclaimers.
     */
    parseChildren: function(child, layer, result) {
        if (child.children) {
            for (var j = 0; j < child.children.length; j++) {
                this.parseChildren(child.children[j], layer, result);
            }
        } else {
            if (child.disclaimer) {
                result.disclaimer[child.disclaimer] = true;
            }
            result.allLayers.push(child.name);
            if (child.isChecked) {
                result.checkedLayers.push(child.name);
            }
            // put a reference to ol layer in the config object
            child.layer = layer;
        }
    },

    /**
     * Method: loadTheme
     * Loads a theme from the config.
     *
     * Parameters:
     * theme {Object} the theme config
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

        // reverse to have the first layer in the list at the top
        Ext.each(theme.children.concat().reverse(), function(group) {
            this.loadGroup(group);
        }, this);
    },

    /**
     * Method: loadGroup
     * Loads a layer group from the config.
     *
     * Parameters:
     * group {Object} the group config
     * layers {Array} the sub layers displayed at once. optional.
     * opacity {Float} the OL layer opacity. optional
     * visibility {Boolean} the OL layer visibility. optional
     */
    loadGroup: function(group, layers, opacity, visibility) {
        var existingGroup = this.root.findChild('groupId', group.name);
        if (!existingGroup) {

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
                this.wmsURL, params, {
                    ref: group.name,
                    visibility: false,
                    singleTile: true,
                    isBaseLayer: false
                }
            );

            var result = {
                allLayers: [],
                checkedLayers: [],
                disclaimer: {}
            };
            this.parseChildren(group, layer, result);
            group.layer = layer;
            group.allLayers = result.allLayers;
            layer.params.LAYERS = layers || result.checkedLayers;
            this.mapPanel.layers.add(
                new this.recordType({
                    disclaimer: result.disclaimer,
                    layer: layer
                }, layer.id));
            this.addGroup(group);
        }
        else {
            layer = existingGroup.attributes.layer;
            if (layers) {
                Ext.each(layers, function(l) {
                    node = existingGroup.findChild('name', l, true);
                    this.fireEvent('checkchange', node, true);
                }, this);
            }
        }

        layer.setOpacity(opacity || 1);
        if (layer.params.LAYERS.length > 0) {
            layer.setVisibility(visibility !== false);
        }
    },

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

    applyState: function(state) {
        // actual state is loaded later in delayedApplyState to prevent 
        // the layer from being displayed under the baselayers
        this.initialState = state;
    },

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
    },

    getState: function() {
        var state = {};

        var groups = [];
        Ext.each(this.root.childNodes, function(group) {
            var id = group.attributes.groupId;
            groups.push(id);
            var layer = group.layer;
            if (layer.opacity !== null && layer.opacity != 1) {
                state['group_opacity_' + id] = layer.opacity;
            }
            if (layer.params.LAYERS.length > 0) {
                state['group_layers_' + id] = [layer.params.LAYERS].join(',');
            }
        }, this);
        state.groups = groups.join(',');

        return state;
    },

    /**
     * Method: findGroupByName
     * Finds the group config using its name
     *
     * Parameters:
     * name {String}
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

    /**
     * Method: findThemeByName
     * Finds the theme config using its name
     *
     * Parameters:
     * name {String}
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

    /**
     * Method: checkInRange
     * Checks if a layer is in range (correct scale) and modifies node
     * rendering consequently
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

    /**
     * Method: loadDefaultThemes
     * load the default Theme
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
