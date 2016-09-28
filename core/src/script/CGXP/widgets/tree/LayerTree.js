/**
 * Copyright (c) 2011-2014 by Camptocamp SA
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
 * @include OpenLayers/Format/KML.js
 * @include OpenLayers/Protocol/HTTP.js
 * @include OpenLayers/Strategy/Fixed.js
 * @requires GeoExt/widgets/tree/LayerParamNode.js
 * @include GeoExt/widgets/tree/TreeNodeUIEventMixin.js
 * @include GeoExt/plugins/TreeNodeActions.js
 * @include GeoExt/plugins/TreeNodeComponent.js
 * @include GeoExt/widgets/LayerOpacitySlider.js
 * @include CGXP/widgets/tree/TreeNodeLoading.js
 * @include CGXP/widgets/tree/TreeNodeComponent.js
 * @include CGXP/widgets/tree/TreeNodeTriStateUI.js
 * @include CGXP/widgets/slider/WMSTimeSlider.js
 * @include CGXP/widgets/slider/WMSTimeSliderTip.js
 * @include CGXP/widgets/WMSDatePicker.js
 * @include CGXP/tools/tools.js
 */

/** api: (define)
 *  module = cgxp.tree
 *  class = LayerTree
 */
Ext.namespace("cgxp.tree");

/** api: constructor
 *
 *  Used state :
 *
 *  ``tree_group_opacity_[my_group]``:
 *   - Opacity of the given group (number between 0 an 1).
 *   - Example: ``&tree_group_opacity_myAlmostInvisibleGroup=0.1``
 *
 *  ``tree_groups``:
 *   - Open and display the given theme. Use commas (%2c) to specify more than one theme.
 *     The first theme will be on the top, the second will be at the second position, and so on.
 *   - Example: (%20 is space char.): ``&tree_groups=MyTopTheme%2cMy%20second%20theme``
 *
 *  ``tree_group_layers_[my_group]``:
 *   - Open and display the given group. Use commas (%2c) to specify more than one group.
 *   - Example: ``&tree_group_opacity_myGroup=a_Layer%2can_another_layer``
 *
 *  ``tree_Layers``:
 *   - Display the given layers. Use commas (%2c) to specify more than one layer.
 *   - Example: ``&layers=a_layer%2can_another_layer``
 *
 *  ``tree_time_[my_group]``:
 *   - Set the default min and max values of a time range or a single value.
 *   - Only set the min value: ``&tree_time_myGroupA=2006-01-01/``
 *   - Only set the max value: ``&tree_time_myGroupA=/2013-12-31``
 *   - Set both the min and max values: ``&tree_time_myGroupA=2006-01-01/2013-12-31``
 *   - Set the value: ``&tree_time_myGroupA=2008-05-05``
 *
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

    /** api: config[autoExpand]
     *  ``Boolean``
     *  True to expand the tree node when we check it, default to true.
     */
    autoExpand: true,

    /** api: config[friendlyUrl]
     *  ``Boolean``
     *  True to enable friendly URL support (HTML5 browsers only), default to true.
     */
    friendlyUrl: true,

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
     *  ``Array(String)``
     *  The default themes to load at init time.
     */
    defaultThemes: null,

    /** api: config[permalinkThemes]
     *  ``Array(String)``
     *  The themes to load at init time. Automatically set.
     */
    permalinkThemes: null,

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

    /** api: config[wmtsOptions]
     *  ``Object``
     *  Optional global configuration for WMTS layers
     */
    wmtsOptions: null,

    /** api: config[updateLegendDelay]
     *  ``Number``
     *  The number of milliseconds the update of legends is deferred by.
     *  Defaults to 2000.
     */
    updateLegendDelay: 2000,

    /** private: property[messageTaskCreate]
     *  ``Ext.util.DelayedTask``
     *  The task that creates the message
     */
    /** private: property[messageTaskHide]
     *  ``Ext.util.DelayedTask``
     *  The task that hides the message
     */
    /** private: property[messageTaskRemove]
     *  ``Ext.util.DelayedTask``
     *  The task that removes the message
     */
    /** private: property[messageElement]
     *  ``Ext.Element``
     *  The Ext element that contains the message
     */

    /* i18n */
    moveupText: "Raise",
    movedownText: "Move down",
    moreinfoText: "More information",
    deleteText: "Remove layer",
    opacityText: "Modify layer opacity",
    zoomtoscaleText: "This layer is not visible at this zoom level.",
    opacitylabelText: "Opacity",
    dateyearlabelText: 'Y',
    datemonthlabelText: 'Y-m',
    datelabelText: "Y-m-d",
    datetimelabelText: 'Y-m-d H:i:s',
    datepickerrangeText: 'Please select a start and end date in <br>' +
        'the period {from} to {to}.',
    datepickersingleText: 'Please select a date in the period ' +
        '{from} to {to}.',
    showhidelegendText: "Show/hide legend",
    themealreadyloadedText: "This theme is already loaded",
    showIn3dText: 'Show in 3D',

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
    recordType: GeoExt.data.LayerRecord.create([{name: "disclaimer"}]),

    /** private: property[nodeLoadingPlugin]
     *  ``cgxp.tree.TreeNodeLoading`` A reference to the the ``TreeNodeLoading``
     *  plugin  added to the tree.
     */
    nodeLoadingPlugin: null,

    /** private: property[wmtsInfos]
     *  ``Object`` An object to store information on WMTS layers while waiting
     *  for WMTS Capabilities responses, than also store the capabilities
     *  object. Keyed by WMTS URL.
     */
    wmtsInfos: null,

    /** private: property[wmtsCapsFormat]
     *  ``OpenLayers.Format.WMTSCapabilities`` WMTS Capabilities format.
     */
    wmtsCapsFormat: null,

    /** private: property[orderIndex]
     *  ``Number`` An index incremented as parseChildren is called.
     *  Represents the relative position of the WMTS layers.
     */
    orderIndex: 0,

    /** private: property[lastLoadedTheme]
     *  ``Object``
     *  Theme that was loaded last.
     */
    lastLoadedTheme: null,

    /** private: property[layerGroupChanged]
     */
    layerGroupChanged: false,

    /** private: property[layerChanged]
     */
    layerChanged: false,

    /** private: property[restrictedContent]
     */
    restrictedContent: false,

    /**
     * Property: actionsPlugin
     */
    initComponent: function() {
        this.themes = this.themes || {};
        this.wmtsInfos = {};

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
        this.nodeLoadingPlugin = new cgxp.tree.TreeNodeLoading();
        this.plugins = [
            this.nodeLoadingPlugin,
            this.actionsPlugin,
            new GeoExt.plugins.TreeNodeComponent(),
            new cgxp.tree.TreeNodeComponent({
                configKey: "timeWidget"
            }),
            new cgxp.tree.TreeNodeComponent({
                divCls: "legend-component",
                configKey: "legend"
            })
        ];
        var layerNodeUI = Ext.extend(cgxp.tree.TreeNodeTriStateUI, new GeoExt.tree.TreeNodeUIEventMixin());
        this.loader = new Ext.tree.TreeLoader({
            uiProviders: {
                layer: layerNodeUI,
                'default': cgxp.tree.TreeNodeTriStateUI
            }
        });
        cgxp.tree.LayerTree.superclass.initComponent.call(this, arguments);
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
            "ordergroup",

            /** private: event[loadtheme]
             *  Fires after a theme is loaded.
             */
            "loadtheme",

            /** private: event[togglekml]
             *  Fires when a "showin3d" action is triggered.
             */
            "togglekml"
        );
        this.on('checkchange', function(node, checked) {
            this.layerChanged = true;
            this.fireEvent("layervisibilitychange");
            if (!this.changing) {
                if (checked && this.autoExpand) {
                    node.expand();
                }
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
                this.requestUpdateLegends();
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
     *  :arg visibility: ``Boolean``
     *  :arg styles: ``Array`` The styles object of the LayerRecord. Useful
     *      when dealing with custom legend urls. Optional.
     *  :returns: ``Ext.tree.TreeNode``
     */
    addGroup: function(group, internalWMS, visibility, styles) {
        var checkedNodes = internalWMS ? group.layer.params.LAYERS : group.layers;
        function addNodes(children, parentNode, level) {
            if (!level) {
                level = 1;
            }
            Ext.each(children, function(item) {
                var actions = !internalWMS ? [{
                    action: "opacity",
                    qtip: this.opacityText
                }] : [];
                var nodeConfig = {
                    text: item.displayName,
                    name: item.name,
                    layer_id: item.id, // layer_id is the id of the layer in database
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

                var timeWidget;
                if (item.time) {
                    if (this.initialState && this.initialState['time_' + item.name]) {
                        var times = this.initialState['time_' + item.name].split('/');
                        if (!item.time.minDefValue) {
                          item.time.minDefValue = times[0];
                        }
                        if (times.length === 2) {
                            if (!item.time.maxDefValue) {
                                item.time.maxDefValue = times[1];
                            }
                        }
                    }
                    timeWidget = this.getTimeWidget(item);
                }

                if (!item.children) {
                    this.addShowIn3DAction(item, nodeConfig);
                    this.addLegend(item, nodeConfig, level);
                    this.addScaleAction(item, nodeConfig);
                    // FIXME We create a cgxp_layerparam node for a WMTS layer.
                    // That doesn't make sense, but cgxp_layerparam does work
                    // for us.
                    Ext.apply(nodeConfig, {
                        nodeType: 'cgxp_layerparam',
                        leaf: true,
                        layer: item.layer,
                        allItems: group.allLayers,
                        item: item.name,
                        param: 'LAYERS',
                        editable: item.editable,
                        timeWidget: timeWidget,
                        uiProvider: 'layer',
                        metadata: item.metadata
                    });
                    if (item.legendImage && styles) {
                        styles.push({
                            layerName: item.name,
                            legend: {
                                href: item.legendImage
                            }
                        });
                    }
                }
                item.node = parentNode.appendChild(nodeConfig);

                // time widget may need to be redrawn in case it's in a
                // collapsed node
                item.node.parentNode.on('expand', function() {
                    item.node.cascade(function(node) {
                        var timeWidget = node.timeWidget;
                        if (timeWidget) {
                            timeWidget.doLayout();
                            if (Ext.isIE) {
                                // redo the doLayout to force display in IE11
                                setTimeout(function(){
                                    timeWidget.doLayout();
                                }, 100);
                            }
                            if (timeWidget.timeType === 'slider') {
                                var slider = timeWidget.items.get(1);
                                // compute thumb half size manually to prevent
                                // rendering issues
                                var thumb = slider.innerEl.child('.x-slider-thumb');
                                slider.halfThumb = thumb.getWidth() / 2;
                                slider.syncThumb();
                            }
                        }
                    }, this);
                }, this);
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

        // internalWMS or layer leaf
        var actions = [];
        var timeWidget;
        if (internalWMS || group.type) {
            actions = [{
                action: "opacity",
                qtip: this.opacityText
            }];
            if (group.time) {
                timeWidget = this.getTimeWidget(group);
            }
        }
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
            checked: visibility !== undefined ? visibility : !!group.isChecked,
            expanded: group.isExpanded,
            layer: group.layer,
            group_id: group.id, // id of the layer group in the database
            allOlLayers: group.allOlLayers,
            component: internalWMS || group.type ? this.getOpacitySlider(group) : null,
            timeWidget: timeWidget,
            hasOpacity: internalWMS || group.type,
            actions: actions
        };
        // internalWMS or layer leaf
        if (internalWMS || group.type) {
            groupNodeConfig.nodeType = 'cgxp_layer';
        }
        this.addMetadata(group, groupNodeConfig, true);
        var groupNode = this.root.insertBefore(groupNodeConfig,
                                               this.root.firstChild);
        addNodes.call(this, group.children, groupNode, 1);
        this.layerGroupChanged = true;
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
            config.iconUrl = item.icon;
        }
        if (item.legendRule) {
            config.legendRule = item.legendRule;
        }
        if (item.icon || item.legendRule) {
            config.iconCls = "x-tree-node-icon-wms";
        }
        if (item.legendImage) {
            config.legendImage = item.legendImage;
        }

        if (item.legend) {
            config.legend = new Ext.Container({
                items: [{
                    xtype: 'box',
                    html: '<img/>',
                    cls: 'legend_level_' + level.toString()
                }],
                listeners: {
                    render: function(cmp) {
                        cmp.getEl().setVisibilityMode(Ext.Element.DISPLAY);
                        if (!item.isLegendExpanded) {
                            cmp.getEl().hide.defer(1, cmp.getEl(), [false]);
                        }
                    }
                }
            });
            nodeConfig.actions.push({
                action: "legend" + (item.isLegendExpanded ? " legend-on" : ''),
                qtip: this.showhidelegendText
            });
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

        return layer.getFullRequestString({
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
            RULE: rule,
            SCALE: layer.map.getScale()
        });
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
                qtip: this.showIn3dText
            });
            nodeConfig.kml = item.kml;
        }
    },

    /** private: method[getOpacitySlider]
     *  Adds the opacity slider block.
     *
     * :arg node: ``Object``
     * :arg anchor: ``String``
     */
    getOpacitySlider: function(node, anchor) {
        node.slider = new GeoExt.LayerOpacitySlider({
            layer: node.layer,
            isFormField: true,
            hideLabel: true,
            aggressive: true,
            anchor: anchor || '95%',
            plugins: new GeoExt.LayerOpacitySliderTip({
                template: '<div>' + this.opacitylabelText + ' {opacity}%</div>'
            })
        });
        node.slider.on('changecomplete', function() {
            this.fireEvent('themeopacitychange');
        }, this);
        return new Ext.Container({
            layout: 'form',
            items: [node.slider],
            listeners: {
                render: function(cmp) {
                    cmp.getEl().setVisibilityMode(Ext.Element.DISPLAY);
                    cmp.getEl().hide.defer(1, cmp.getEl(), [false]);
                }
            }
        });
    },

    /** private: method[getTimeWidget]
     *  Adds the time slider block.
     *
     * :arg node: ``Object``
     * :arg anchor: ``String``
     */
    getTimeWidget: function(node, anchor) {
        if (node.time.mode == 'disabled') {
            return null;
        }
        if (node.time.widget === 'slider') {
            return this.getTimeSlider(node, anchor);
        } else {
            return this.getDatePicker(node, anchor);
        }
    },

    /** private: method[getTimeSlider]
     *  Adds the time slider block.
     *
     * :arg node: ``Object``
     * :arg anchor: ``String``
     */
    getTimeSlider: function(node, anchor) {
        var labelFormat;

        switch (node.time.resolution) {
            case 'year':
                labelFormat = this.dateyearlabelText;
                break;
            case 'month':
                labelFormat = this.datemonthlabelText;
                break;
            case 'day':
                labelFormat = this.datelabelText;
                break;
            //case 'second':
            default:
                labelFormat = this.datetimelabelText;
        }

        var slider = new cgxp.slider.WMSTimeSlider({
            dateLabelFormat: labelFormat,
            layer: node.layer,
            wmsTime: node.time,
            plugins: new cgxp.slider.WMSTimeSliderTip(),
            flex: 1,
            style: {
                marginLeft: 0
            }
        });

        var tooltip = slider.formatLayerTimeLabel(new Date(slider.minValue)) +
            '<br/>' +
            slider.formatLayerTimeLabel(new Date(slider.maxValue));

        return new Ext.Container({
            layout: 'hbox',
            cls: 'gx-tree-timeslider-container',
            items: [
                {
                    xtype: 'box',
                    html: '<div class="gx-tree-timeslider-icon"></div>',
                    listeners: {
                        render: function(cmp) {
                            new Ext.ToolTip({
                                target: cmp.el,
                                html: tooltip
                            });
                            cmp.ownerCt.doLayout.defer(
                                1, cmp.ownerCt, [true, true]
                            );
                        }
                    }
                },
                slider
            ],
            timeType: 'slider'
        });
    },

    /** private: method[getDatePicker]
     *  Adds the time slider block.
     *
     * :arg node: ``Object``
     * :arg anchor: ``String``
     */
    getDatePicker: function(node, anchor) {
        var datePicker = new cgxp.datepicker.WMSDatePicker({
            layer: node.layer,
            wmsTime: node.time,
            dateLabelFormat: this.datelabelText,
            flex: 1
        });

        var labelFrom = cgxp.tools.formatDate(
            datePicker.minDate, this.datelabelText);
        var labelTo = cgxp.tools.formatDate(
            datePicker.maxDate, this.datelabelText);
        var tooltip = datePicker.isModeRange() ?
            this.datepickerrangeText : this.datepickersingleText;
        tooltip = tooltip
                .replace('{from}', labelFrom)
                .replace('{to}', labelTo);

        return new Ext.Container({
            layout: 'hbox',
            cls: 'gx-tree-timeslider-container',
            items: [
                {
                    xtype: 'box',
                    html: '<div class="gx-tree-timeslider-icon"></div>',
                    listeners: {
                        render: function(cmp) {
                            new Ext.ToolTip({
                                target: cmp.el,
                                html: tooltip
                            });
                            cmp.ownerCt.doLayout.defer(
                                1, cmp.ownerCt, [true, true]
                            );
                        }
                    }
                },
                datePicker
            ],
            timeType: 'datepicker'
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
        var key,
            index;
        if (action.indexOf('legend') != -1) {
            action = 'legend';
        }
        switch (action) {
            case 'metadata':
                this.onMetadataAction(node);
                break;
            case 'delete':
                this.removeGroup(node);
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
                    // place the thumb at the right place...
                    real_slider = slider.findByType('slider')[0];
                    real_slider.moveThumb(
                        0,
                        real_slider.translateValue(real_slider.getValue()),
                        false
                    );
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
                index = -next.attributes.allOlLayers.length;
                Ext.each(node.attributes.allOlLayers, function(layer) {
                    layer.map.raiseLayer(layer, index);
                });
                node.parentNode.insertBefore(node, node.nextSibling.nextSibling);
                this.getRootNode().eachChild(function(n) {
                    n.ownerTree.actionsPlugin.updateActions(n);
                });
                node.ui.removeClass('x-tree-node-over');
                if (Ext.enableFx) {
                    node.ui.highlight();
                }
                this.layerGroupChanged = true;
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
                index = previous.attributes.allOlLayers.length;
                var layers = [].concat(node.attributes.allOlLayers);
                Ext.each(layers.reverse(), function(layer) {
                    layer.map.raiseLayer(layer, index);
                });
                node.parentNode.insertBefore(node, node.previousSibling);
                this.getRootNode().eachChild(function(n) {
                    n.ownerTree.actionsPlugin.updateActions(n);
                });
                node.ui.removeClass('x-tree-node-over');
                if (Ext.enableFx) {
                    node.ui.highlight();
                }
                this.layerGroupChanged = true;
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
                this.fireEvent('togglekml', {
                    url: node.attributes.kml,
                    layerName: node.text + '_kml'
                });
                break;
        }

        if (key) {
            var actionImg = evt.getTarget('.' + action, 10, true);
            var cls = action + "-on";
            function show() {
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
            }
            if (!node[key].getEl().isVisible()) {
                if (key == 'legend') {
                    var img = this.updateComponentLegend(node, true);
                    if (img.loaded) {
                        show();
                    }
                    else {
                        img.on('load', function _show() {
                            show();
                            img.un('load', _show, this);
                        }, this);
                    }
                }
                else {
                    show();
                }
            }
            else {
                actionImg.removeClass(cls);
                node[key].el.setVisibilityMode(Ext.Element.DISPLAY);
                node[key].el.slideOut('t', {
                    useDisplay: true,
                    duration: 0.2
                });
            }
        }
    },

    /** private: method[parseChildren]
     *  Parses recursively the children of a group node.
     *
     *  :arg child: ``Object`` the node to parse
     *  :arg layer: ``<OpenLayers.Layer.WMS>`` The reference to the OL Layer,
     *      present only for internal WMS.
     *  :arg result: ``Object`` The result object of the parsed children, contains:
     *     - allLayers ``Array(String)`` The list of WMS subLayers for this layer.
     *     - checkedLayers ``Array(String)`` The list of checked subLayers.
     *     - disclaimer ``Object`` The list layers disclaimers.
     *     - allOlLayers ``Array(OpenLayers.Layer)`` The list of children layers
     *       (for non internal WMS).
     *  :arg currentIndex: ``Number`` The index at which to insert a new layer
     *          in the layer store.
     */
    parseChildren: function(child, layer, result, currentIndex, layers) {
        if (child.children) {
            for (var j = child.children.length - 1; j >= 0; j--) {
                currentIndex += this.parseChildren(child.children[j], layer, result,
                        currentIndex, layers);
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
            if (layer) {
                child.layer = layer;
            } else {
                if (child.type == "external WMS") {
                    var tree = this;
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
                            isBaseLayer: false,
                            visibilityTimeout: null,
                            setVisibility: this.delayedSetVisibilityTrue,
                            tree: tree
                        }
                    );
                    result.allOlLayers.push(child.layer);
                    this.mapPanel.layers.insert(currentIndex, [
                        new this.recordType({
                            disclaimer: result.disclaimer,
                            legendURL: child.legendImage,
                            layer: child.layer
                        }, child.layer.id)]);
                    return 1;
                } else if (child.type == "WMTS") {
                    var wmtsInfo = this.wmtsInfos[child.url];
                    if (!wmtsInfo) {
                        wmtsInfo = {
                            capabilities: null,
                            layersInfo: []
                        };
                        this.wmtsInfos[child.url] = wmtsInfo;
                        OpenLayers.Request.GET({
                            url: child.url,
                            success: this.onWmtsCapsReceive.createDelegate(
                                this, [wmtsInfo, layers], true)
                        });
                    }
                    // The layerInfo object includes the necessary information
                    // for creating and inserting the WMTS layer. The creation
                    // and insertion of the layer will occur when the WMTS
                    // GetCapabilities response is received.
                    var layerInfo = {
                        node: child,
                        currentIndex: currentIndex,
                        orderIndex: this.orderIndex++,
                        allOlLayers: result.allOlLayers,
                        allOlLayersIndex: result.allOlLayers.length
                    };
                    wmtsInfo.layersInfo.push(layerInfo);
                    result.allOlLayers.push(null);
                }
            }
        }
        return 0;
    },

    /** private: method[olWmtsCapsReceive]
     *  :param request: ``Object`` The XHR object.
     *  :param wmtsInfo: ``Object`` Contains the layer info objects.
     *  :param visibleLayers: ``Array`` The names of the layers to make
     *      visible immediately.
     */
    onWmtsCapsReceive: function(request, wmtsInfo, visibleLayers) {
        var doc = request.responseXML;
        if (!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        if (!this.wmtsCapsFormat) {
            this.wmtsCapsFormat = new OpenLayers.Format.WMTSCapabilities();
        }
        wmtsInfo.capabilities = this.wmtsCapsFormat.read(doc);
        this.insertWmtsLayers(wmtsInfo, visibleLayers);
    },

    /** private: method[insertWmtsLayers]
     *  :param wmtsInfo: ``Object`` Contains the layer info objects.
     *  :param visibleLayers: ``Array`` The names of the layers to make
     *      visible immediately.
     */
    insertWmtsLayers: function(wmtsInfo, visibleLayers) {
        var capabilitiesLayers = wmtsInfo.capabilities.contents.layers;
        var layersInfo = wmtsInfo.layersInfo;

        for (var i = 0, ii = layersInfo.length; i < ii; ++i) {
            var layerInfo = layersInfo[i];

            var capabilitiesLayer;
            for (var j = 0, jj = capabilitiesLayers.length; j < jj; ++j) {
                if (capabilitiesLayers[j].identifier == layerInfo.node.name) {
                    capabilitiesLayer = capabilitiesLayers[j];
                }
            }
            if (!capabilitiesLayer) {
                continue;
            }

            this.insertWmtsLayer(wmtsInfo.capabilities,
                    capabilitiesLayer, layerInfo, visibleLayers);
        }
        wmtsInfo.layersInfo = [];
    },


    /** private: method[insertWmtsLayer]
     *  :param capabilities: ``Object`` The WMTS capabilities object.
     *  :param capabilitiesLayer: ``Object`` The object representing the
     *      layer in the WMTS capabilities.
     *  :param layerInfo: ``Object`` The layer info object.
     *  :param visibleLayers: ``Array`` The names of the layers to make
     *      visible immediately.
     */
    insertWmtsLayer: function(capabilities, capabilitiesLayer, layerInfo,
            visibleLayers) {

        var layerNode = layerInfo.node;
        var layerName = layerNode.name;

        var layer = this.wmtsCapsFormat.createLayer(capabilities, Ext.apply({
            ref: layerName,
            layer: layerName,
            maxExtent: capabilitiesLayer.bounds ?
                capabilitiesLayer.bounds.clone().transform(
                    "EPSG:4326",
                    this.mapPanel.map.getProjectionObject()) : undefined,
            style: layerNode.style,
            matrixSet: layerNode.matrixSet,
            params: layerNode.dimensions,
            visibility: layerNode.isChecked,
            isBaseLayer: false,
            mapserverURL: layerNode.wmsUrl,
            mapserverLayers: layerNode.wmsLayers,
            queryLayers: layerNode.queryLayers
        }, this.wmtsOptions || {}));

        // Big hack to make createLayer respect the OGC standards.
        layer.minScale = null;
        layer.maxScale = null;
        layer.options.minScale = null;
        layer.options.maxScale = null;

        var treeNode = layerNode.node;
        treeNode.layer = layer;
        treeNode.attributes.layer = layer;

        if (this.initialState && this.initialState['opacity_' + layerName]) {
            layer.setOpacity(this.initialState['opacity_' + layerName]);
        }
        if (visibleLayers && visibleLayers.indexOf(layerName) >= 0) {
            this.fireEvent('checkchange', treeNode, true);
            layer.setVisibility(true);
        } else {
            layer.setVisibility(treeNode.attributes.checked);
        }

        layerInfo.allOlLayers[layerInfo.allOlLayersIndex] = layer;

        var disclaimer = {};
        if (layerInfo.node.disclaimer) {
            disclaimer[layerInfo.node.disclaimer] = true;
        }
        this.mapPanel.layers.insert(layerInfo.currentIndex, [
            new this.recordType({
                disclaimer: disclaimer,
                legendURL: layerNode.legendImage,
                layer: layer
            }, layer.id)]);

        this.updateIndicesInWmtsInfo(layerInfo.orderIndex);
        this.checkInRange(treeNode);

        layerNode.slider.setLayer(layer);

        layer.events.on({
            "visibilitychanged": treeNode.onLayerVisibilityChanged,
            scope: treeNode
        });
        treeNode.on({
            "checkchange": treeNode.onCheckChange,
            scope: treeNode
        });

        var groupNode;
        treeNode.bubble(function(n) {
            if (n.parentNode == this.root) {
                groupNode = n;
                return false;
            }
        }, this);
        this.nodeLoadingPlugin.registerLoadListeners(groupNode);
    },

    /** private: method[updateIndicesInWmtsInfo]
     *  :param index: ``Number`` The index after which indices need updating.
     */
    updateIndicesInWmtsInfo: function(index) {
        var wmtsInfo = this.wmtsInfos;
        for (var k in wmtsInfo) {
            if (wmtsInfo.hasOwnProperty(k)) {
                for (var i = 0; i < wmtsInfo[k].layersInfo.length; ++i) {
                    var layerInfo = wmtsInfo[k].layersInfo[i];
                    if (layerInfo.orderIndex > index) {
                        layerInfo.currentIndex++;
                    }
                }
            }
        }
    },

    /** private :method[loadTheme]
     *  Loads a theme from the config.
     *
     *  :arg theme: ``Object`` the theme config
     */
    loadTheme: function(theme) {
        this.orderIndex = 0;

        var node;
        if (this.uniqueTheme) {
            for (var i = this.root.childNodes.length-1 ; i >= 0 ; i--) {
                node = this.root.childNodes[i];
                this.removeGroup(node);
            }
        }

        var groupNodes = [];
        // reverse to have the first layer in the list at the top
        Ext.each(theme.children.concat().reverse(), function(group) {
            groupNodes.push(this.loadGroup(group, undefined, undefined,
                    undefined, undefined, false));
        }, this);

        var minPosition = 9999;
        Ext.each(groupNodes, function(groupNode) {
            var pos = this.root.indexOf(groupNode);
            if (pos >= 0 && pos < minPosition) {
                minPosition = pos;
                node = groupNode;
            }
        }, this);
        node.getUI().getEl().scrollIntoView();

        // change them in url
        if (this.uniqueTheme && this.friendlyUrl && history.replaceState) {
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

        this.lastLoadedTheme = theme;
        this.layerGroupChanged = false;
        this.layerChanged = false;
        this.fireEvent('loadtheme', theme);
    },

    /** private: method[getLastLoadedTheme]
     */
    getLastLoadedTheme: function() {
        return this.lastLoadedTheme;
    },

    /** private: method[loadGroup]
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
        var layer;
        if (!groupNode) {
            var index = this.mapPanel.layers.getCount();
            while (this.mapPanel.map.layers[index-1] instanceof OpenLayers.Layer.Vector && index > 0) { index--; }
            var result;
            if (group.isInternalWMS || group.type == 'internal WMS') {
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
                if (this.themes.external !== undefined &&
                    isExternalgroup(group.name, this.themes)) {
                    params.external = true;
                }
                var tree = this;
                layer = new OpenLayers.Layer.WMS(
                    group.displayName,
                    this.wmsURL, params, Ext.apply({
                        ref: group.name,
                        visibility: false,
                        singleTile: true,
                        isBaseLayer: false,
                        visibilityTimeout: null,
                        setVisibility: this.delayedSetVisibilityTrue,
                        tree: tree
                    }, this.wmsOptions || {})
                );

                result = {
                    allLayers: [],
                    checkedLayers: [],
                    disclaimer: {}
                };
                this.parseChildren(group, layer, result);
                group.layer = layer;
                group.allLayers = result.allLayers.reverse();
                group.allOlLayers = [layer];
                // on first level layer we only use the opacity
                if (!group.children) {
                    layer.params.LAYERS = result.allLayers;
                }
                else {
                    if (layers) {
                        this.layerChanged = true;
                        for (var i=0, l=layers.length; i<l; i++) {
                            if (result.allLayers.indexOf(layers[i]) < 0) {
                                // this layer is not in the list of allowed layers,
                                // trigger private content warning
                                this.restrictedContent = true;
                                break;
                            }
                        }
                    }
                    layer.params.LAYERS = layers || result.checkedLayers;
                }
                var styles = [];
                var layerRecord = new this.recordType({
                    disclaimer: result.disclaimer,
                    layer: layer
                }, layer.id);
                this.mapPanel.layers.insert(index, layerRecord);
                groupNode = this.addGroup(group, true, visibility, styles);
                layerRecord.set('styles', styles);
            }
            else {
                result = {
                    allLayers: [],
                    checkedLayers: [],
                    disclaimer: {},
                    allOlLayers: []
                };
                this.parseChildren(group, null, result, index, layers);
                group.layers = result.checkedLayers;
                group.allLayers = result.allLayers;
                group.allOlLayers = result.allOlLayers;
                groupNode = this.addGroup(group, false, visibility);

                for (var url in this.wmtsInfos) {
                    if (this.wmtsInfos.hasOwnProperty(url)) {
                        var wmtsInfo = this.wmtsInfos[url];
                        if (wmtsInfo.capabilities && wmtsInfo.layersInfo.length > 0) {
                            this.insertWmtsLayers(wmtsInfo);
                        }
                    }
                }
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
                groupNode.getUI().getEl().scrollIntoView();
            }
            if (!nowarning) {
                if (this.messageTaskCreate) {
                    this.messageTaskCreate.cancel();
                    this.messageTaskCreate = null;
                }
                if (this.messageTaskRemove) {
                    this.messageTaskRemove.cancel();
                    this.messageTaskRemove = null;
                }
                if (this.messageTaskHide) {
                    this.messageTaskHide.cancel();
                    this.messageTaskHide = null;
                }
                if (this.messageElement) {
                    this.messageElement.remove();
                    this.messageElement = null;
                }
                // delayed to solved conflict with scroll
                this.messageTaskCreate = new Ext.util.DelayedTask(function() {
                    var html = [
                        '<div class="layertree-msg">',
                            this.themealreadyloadedText,
                        '</div>'
                    ].join('');
                    this.messageElement = Ext.DomHelper.insertBefore(
                        this.body,
                        {
                            html: html,
                            xtype: 'container'
                        },
                        true
                    ).fadeIn();
                    this.messageTaskHide = new Ext.util.DelayedTask(function() {
                        this.messageTaskHide = null;
                        var duration = 1;
                        this.messageElement.fadeOut({ duration: duration });
                        this.messageTaskRemove = new Ext.util.DelayedTask(function() {
                            this.messageTaskRemove = null;
                            // make sure that the message is actually removed
                            // ("remove" option of fadeOut() doesn't seem to work)
                            this.messageElement.remove();
                            this.messageElement = null;
                        }, this);
                        this.messageTaskRemove.delay(duration * 1000);
                    }, this);
                    this.messageTaskHide.delay(3000);
                }, this);
                this.messageTaskCreate.delay(10);
            }
        }

        if (layer) {
            layer.setOpacity(opacity || 1);
            if (visibility !== undefined) {
                layer.setVisibility(visibility);
            }
            else if (groupNode.childNodes.length === 0) {
                layer.setVisibility(groupNode.attributes.checked);
            }
            else if (layer.params.LAYERS.length > 0) {
                layer.setVisibility(true);
            }
        }

        this.requestUpdateLegends();

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
        if (this.themes.external !== undefined && !isAllowed) {
            isAllowed = checkGroup(group, this.themes.external);
        }
        return isAllowed;
    },

    /** private: method[applyState]
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
        // handle layer groups from permalinkThemes and initialState
        var groups = [];
        var i, l;
        // get groups from permalinkThemes
        var themes = this.permalinkThemes || this.defaultThemes;
        if (themes && !this.initialState.groups) {
            // recovering all the first level groups from the selected themes
            for (i = 0, l = themes.length; i < l; i++) {
                var theme = this.findThemeByName(themes[i]);
                Ext.each(theme.children, function(child) {
                    this.push(child.name);
                }, groups);
            }
        }
        if (this.initialState.groups) {
            // get groups from initialState
            var initialStateGroups = Ext.isArray(this.initialState.groups) ?
                this.initialState.groups : [this.initialState.groups];
            // merge permalinkThemes's groups and initialState groups
            var groupsAsString = groups.join(',');
            for (i = 0, l = initialStateGroups.length; i < l; i++) {
                if (groupsAsString.indexOf(initialStateGroups[i]) < 0) {
                    groups.push(initialStateGroups[i]);
                }
            }
        }
        // this.initialState.layers is used from the mobile app
        else if (this.initialState.layers) {
            // Gets the more pertinent groups for the layers set.
            var asked_groups = {};
            var layers = this.initialState.layers;
            if (!OpenLayers.Util.isArray(layers)) {
                layers = [layers];
            }
            Ext.each(layers, function(layer) {
                var layer_groups = this.findGroupByLayerName(layer, true);
                Ext.each(layer_groups, function(group) {
                    if (!(group.name in asked_groups)) {
                        asked_groups[group.name] = [];
                    }
                    asked_groups[group.name].push(layer);
                });
            }, this);
            var asked_groups_array = [];
            for (var group in asked_groups) {
                if (asked_groups.hasOwnProperty(group)) {
                    asked_groups_array.push({
                        group: group,
                        layers: asked_groups[group]
                    });
                }
            }

            while (asked_groups_array.length > 0) {
                asked_groups_array.sort(function(group1, group2) {
                    return group2.layers.length - group1.layers.length;
                });
                if (asked_groups_array[0].layers.length === 0) {
                    break;
                }
                groups.push(asked_groups_array[0].group);
                var group_layers = [];
                Ext.each([].concat(asked_groups_array[0].layers),
                    function(layer) {
                        group_layers.push(layer);
                        Ext.each(asked_groups_array, function(group) {
                            group.layers.remove(layer);
                        });
                    }
                );
                this.initialState['group_layers_' +
                    asked_groups_array[0].group] =
                    group_layers;
            }
        }
        // Test if we try to see restricted content from an unchanged theme's groups
        else {
            for (var key in this.initialState) {
                if (key.indexOf("group_layers_") === 0) {
                    var groupName = key.substring("group_layers_".length);
                    if (groups.indexOf(groupName) < 0) {
                        this.restrictedContent = true;
                    }
                }
            }
        }
        Ext.each(groups.reverse(), function(t) {
            if (!this.checkGroupIsAllowed(t)) {
                // this group is not in the list of allowed groups,
                // trigger private content warning
                this.restrictedContent = true;
                return;
            }
            var opacity = this.initialState['group_opacity_' + t] ?
                this.initialState['group_opacity_' + t] : 1;
            var layers;
            if ('group_layers_' + t in this.initialState) {
                layers = this.initialState['group_layers_' + t];
                if (layers === '') {
                    layers = [];
                }
                else if (!OpenLayers.Util.isArray(layers)) {
                    layers = [layers];
                }
            }
            var group = this.findGroupByName(t);
            this.loadGroup(group, layers, opacity);
        }, this);
        this.layerGroupChanged = this.initialState.groups || this.initialState.layers;
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

    /** private: method[getState]
     *  :returns: ``Object``
     */
    getState: function() {
        var state = {};

        var groups = [];
        var useFriendlyUrl = this.uniqueTheme && this.friendlyUrl && history.replaceState;
        Ext.each(this.root.childNodes, function(group) {
            var id = group.attributes.groupId;
            groups.push(id);
            var layer = group.layer;
            if (group.attributes.hasOpacity) {
                if (layer.opacity !== null && layer.opacity != 1) {
                    state['group_opacity_' + id] = layer.opacity;
                }
            }
            if (group.attributes.internalWMS) {
                if ((!useFriendlyUrl || this.layerChanged)) {
                    state['group_layers_' + id] = [layer.params.LAYERS].join(',');
                }
            }
            else {
                group.cascade(function(node) {
                    var layer = node.attributes.layer;
                    if (layer && layer.opacity !== null && layer.opacity != 1) {
                        state['opacity_' + node.attributes.name] = layer.opacity;
                    }
                    if ((!useFriendlyUrl || this.layerChanged) && layer) {
                        state['enable_' + node.attributes.name] = layer.visibility;
                    }
                }, this);
            }
        }, this);
        if (!useFriendlyUrl || this.layerGroupChanged) {
            state.groups = groups.join(',');
        }

        return state;
    },

    /** private: method[findGroupByLayerName]
     *  Finds the group config for a specific layer using its name.
     *
     *  :arg name: ``String``
     */
    findGroupByLayerName: function(name, all) {
        var result = [];
        var parseChildren = function(node, group) {
            group = group || node;
            if (node.name && node.name == name) {
                result.push(group);
                return false;
            }
            if (node.children) {
                Ext.each(node.children, function(n) {
                    return parseChildren(n, group);
                });
            }
            return true;
        };
        Ext.each(['local', 'external'], function(location) {
            Ext.each(this.themes[location], function(t) {
                Ext.each(t.children, function(n) {
                    // recurse on all children
                    return parseChildren(n) || all;
                });
            });
            return all || result.length !== 0;
        }, this);

        return all ? result : result[0];
    },

    /** private: method[findGroupByName]
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

    /** private: method[findThemeByName]
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

    /** private: method[checkInRange]
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

        }
    },

    /** private: method[loadDefaultThemes]
     *  Load the default Theme.
     */
    loadDefaultThemes: function() {
        if (this.permalinkThemes) {
            this.defaultThemes = this.permalinkThemes;
        }
        if (this.initialState) {
            this.defaultThemes = null;
        }
        if (this.defaultThemes) {
            // reverse to have the first theme in the list at the top
            Ext.each(this.defaultThemes.concat().reverse(), function(themeName) {
                theme = this.findThemeByName(themeName);
                // if found
                if (theme) {
                    this.loadTheme(theme);
                } else {
                    // this theme is not in the list of allowed themes,
                    // trigger private content warning
                    this.restrictedContent = true;
                }
            }, this);
        }
    },

    /** private: method[removeGroup]
     *  Removes a layer group.
     *  :arg node: ``Ext.tree.TreeNode``
     */
    removeGroup: function(node) {
        node.remove();
        if (node.attributes.layer) {
            node.layer.destroy();
        } else {
            Ext.each(node.attributes.allOlLayers, function(layer) {
                // If the group is removed while WMTS Capabilities are
                // loading then we have null items in the allOlLayers
                // array.
                if (layer !== null) {
                    layer.destroy();
                }
            });
        }
        this.layerGroupChanged = true;
        this.fireEvent('removegroup');
    },

    /** private: method[requestUpdateLegends]
     *  Use setTimeout to request the update of legends.
     */
    requestUpdateLegends: function() {
        if (this.updateLegendsTimeoutId) {
            window.clearTimeout(this.updateLegendsTimeoutId);
        }
        this.updateLegendsTimeoutId = window.setTimeout(function() {
            delete this.updateLegendsTimeoutId;
            this.updateLegends(this.getRootNode());
        }.createDelegate(this), this.updateLegendDelay);
    },

    /** private: method[updateLegends]
     *  Update legends in the tree.
     *  :arg node: ``Ext.tree.TreeNode`` The code from which to cascade down
     *  the tree.
     */
    updateLegends: function(node) {
        node.cascade(function(n) {
            if (!n.isExpanded() && !n.isLeaf()) {
                n.on('expand', function() {
                    this.updateLegends(n);
                }, this, {single: true});
                return false;
            }
            if (n.isLeaf()) {
                this.updateNodeLegends(n);
            }
        }, this);
    },

    /** private: method[updateNodeLegends]
     *  Update the WMS legend images of a given tree node.
     *  :arg node: ``Ext.tree.TreeNode``
     */
    updateNodeLegends: function(node) {
        var attr = node.attributes;
        // there is only one class in the mapfile layer
        // we use a rule so that legend shows the icon only (no label)
        if (attr.legendRule) {
            node.setIcon(this.getLegendGraphicUrl(attr.layer,
                attr.name, attr.legendRule));
        }
        if (attr.iconUrl) {
            node.setIcon(attr.iconUrl);
        }
        if (attr.legend) {
            this.updateComponentLegend(node);
        }
    },

    /** private: method[updateComponentLegend]
     *  Sets the legend image src (for component element only)
     * :arg node: ``Ext.tree.TreeNode``
     * :arg force: ``Boolean`` Tells whether to set it even if not visible
     */
    updateComponentLegend: function(node, force) {
        var attr = node.attributes;
        var selector = '.legend-component img';
        var img = Ext.select(selector, false, node.getUI().elNode).item(0);
        if (force || img.isVisible(true)) {
            var src = (attr.legendImage) ?
                attr.legendImage :
                this.getLegendGraphicUrl(attr.layer, attr.name);
            img.loaded = img.dom.src == src;
            img.dom.src = src;
        }
        return img;
    },

    // Delay `setVisibility(true)` to save unneeded getMap request
    delayedSetVisibilityTrue: function(visible) {
        if (this.visibilityTimeout) {
            clearTimeout(this.visibilityTimeout);
            this.visibilityTimeout = null;
        }
        if (visible) {
            var layer = this;
            this.visibilityTimeout = setTimeout(function() {
                OpenLayers.Layer.WMS.prototype.
                    setVisibility.call(layer, true);
                layer.tree.fireEvent("layervisibilitychange");
                return;
            }, 0);
        }
        else {
            // force to set the visibility, because we
            // set it to false before we merge the params
            this.visibility = true;
            return OpenLayers.Layer.WMS.prototype.
                setVisibility.call(this, false);
        }
    }
});

/** api: xtype = cgxp_layertree */
Ext.reg('cgxp_layertree', cgxp.tree.LayerTree);

cgxp.tree.LayerNode = Ext.extend(GeoExt.tree.LayerNode, {
    // we don't want the layer to manage the checkbox to avoid conflicts with the tristate manager
    onLayerVisibilityChanged: Ext.emptyFn,
    // Let the LayerParamNode manage the layer visibility
    onCheckChange: Ext.emptyFn
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

    /** private: method[onCheckChange]
     * :arg node: ``GeoExt.tree.LayerParamNode``
     * :arg checked: ``Boolean``
     *
     * Handler for checkchange events.
     */
    onCheckChange: function(node, checked) {
        var layer = this.layer;
        var newItems = [];
        var curItems = this.getItemsFromLayer();
        Ext.each(this.allItems, function(item) {
            if ((item !== this.item && curItems.indexOf(item) !== -1) ||
                    (checked === true && item === this.item)) {
                newItems.push(item);
            }
        }, this);

        var visible = (newItems.length > 0);
        // if there is something to display, we want to update the params
        // before the layer is turned on
        if (visible) {
            // Temporary set layer visibility property to false in order
            // to avoid a GetMap request on each intermediate layer remove,
            // use the visible property to avoid a flash effect.
            layer.visibility = false;
            layer.mergeNewParams(this.createParams(newItems));
        }
        layer.setVisibility(visible);
        // if there is nothing to display, we want to update the params
        // when the layer is turned off, so we don't fire illegal requests
        // (i.e. param value being empty)
        if (!visible) {
            layer.mergeNewParams(this.createParams([]));
        }
    },

    // we don't want the layer to manage the checkbox to avoid conflicts with the tristate manager
    onLayerVisibilityChanged: Ext.emptyFn
});
Ext.tree.TreePanel.nodeTypes.cgxp_layerparam = cgxp.tree.LayerParamNode;
