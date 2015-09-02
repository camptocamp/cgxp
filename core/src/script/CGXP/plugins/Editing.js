/**
 * Copyright (c) 2012-2014 by Camptocamp SA
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
 * @requires OpenLayers/Control/GetFeature.js
 * @include OpenLayers/Protocol/HTTP.js
 * @include OpenLayers/Format/JSON.js
 * @include OpenLayers/Format/GeoJSON.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/Format/QueryStringFilter.js
 * @include GeoExt/data/AttributeStore.js
 * @include GeoExt.ux/FeatureEditorGrid.js
 * @include OpenLayers/Control/Snapping.js
 * @include OpenLayers/Layer/Vector.js
 * @include OpenLayers/Strategy/BBOX.js
 * @include OpenLayers/Protocol/WFS/v1_0_0.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Editing
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add an Editing plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      // without snapping
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_editing',
 *              layerTreeId: 'layertree',
 *              layersURL: "${request.route_url('layers_root') | n}",
 *              metadataParams: ${dumps(version_role_params) | n}
 *          }, {
 *              ptype: "cgxp_layertree",
 *              id: "layertree",
 *              outputConfig: {
 *                  ...
 *              },
 *              outputTarget: 'left-panel'
 *          }]
 *          ...
 *      });
 *
 *      // with snapping and several other options enabled
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_editing',
 *              layerTreeId: 'layertree',
 *              layersURL: "${request.route_url('layers_root') | n}",
 *              metadataParams: ${dumps(version_role_params) | n},
 *              mapserverUrl: "${request.route_url('mapserverproxy') | n}",
 *              snapLayers: {
 *                  "layer_A": {
 *                      tolerance: 15,
 *                      edge: false,
 *                      ...
 *                  },
 *                  "layer_B": {}
 *              },
 *              snapOptions: {
 *                  defaults: {
 *                      ...
 *                  },
 *                  greedy: false
 *              },
 *              selectionColors: {
 *                  23: '#FF0022'
 *              },
 *              allowDrag: false,
 *              differenceServiceUrl: "${request.route_url('difference') | n}"
 *          }, {
 *              ptype: "cgxp_layertree",
 *              id: "layertree",
 *              outputConfig: {
 *                  ...
 *              },
 *              outputTarget: 'left-panel'
 *          }]
 *          ...
 *      });
 *
 */

/** api: constructor
 *  .. class:: Editing(config)
 *
 *    Plugin to add an editing tool to the map.
 *
 *    This plugin works with the c2cgeoportal "layers" web service. It
 *    requires a :class:`cgxp.plugins.LayerTree` plugin in the viewer.
 *
 */
cgxp.plugins.Editing = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_editing */
    ptype: "cgxp_editing",

    /** api: config[layersURL]
     *  ``String`` URL to the layers web service. Typically set to
     *  ``"${request.route_url('layers_root')}"``.
     */
    layersURL: null,

    /** api: config[metadataParams]
     *  ``Object`` Optional additional params given to metadata request.
     */
    metadataParams: {},

    /** api: config[layerTreeId]
     *  ``String``
     *  Id of the layertree tool.
     */
    layerTreeId: null,

    /** api: config[usedMapParams]
     *  ``Array[String]``
     *  The map params used in the query.
     */
    usedMapParams: [],

    /** api: config[layersWindowOptions]
     * ``Object`` Additional options given to the layer selector window constructor.
     */
    layersWindowOptions: {},

    /** api: config[attributesWindowOptions]
     * ``Object`` Additional options given to the attributes form window constructor.
     */
    attributesWindowOptions: {},

    /** api: config[readParams]
     *  ``Object``
     *  Default params given to the read request
     */
    readParams: {},

    /** private: property[editingLayer]
     *  ``OpenLayers.Layer.Vector``
     *  The vector editing layer
     */
    editingLayer: null,

    /** private: property[attributePopup]
     *  ``Ext.Window``
     *  The attributes editing popup
     */
    attributePopup: null,

    /** private: property[editorGrid]
     *  ``GeoExt.ux.FeatureEditorGrid``
     *  The feature editor grid.
     */
    editorGrid: null,

    /** private: property[mainSelectControl]
     *  ``cgxp.plugins.Editing.GetFeature``
     *  The control with which the feature are selected on the map and can then
     *  be edited;
     */
    mainSelectControl: null,

    /** private: property[win]
     *  ``Ext.Window``
     *  The main window. The one that include the button to create
     *  a new feature.
     */
    win: null,

    /** private: property[newFeatureBtn]
     *  ``Ext.form.SplitButton``
     *  The 'create an new feature' button.
     */
    newFeatureBtn: null,

    /** api: config[helpText]
     *  ``String``
     *  The text to the top of the editing window (i18n).
     */
    helpText: 'Click on the map to <b>edit existing features</b>, or',

    /** api: config[layerMenuText]
     *  ``String``
     *  The text to the top of the layer menu (displayed when the
     *  create button is pressed) (i18n).
     */
    layerMenuText: 'Choose a layer',

    /** api: config[createBtnText]
     *  ``String``
     *  The text for the create button (i18n).
     */
    createBtnText: 'Create a new feature',

    /** api: config[undoButtonText]
     *  ``String``
     *  The text for the undo button (i18n).
     */
    undoButtonText: '',

    /** api: config[undoButtonTooltip]
     *  ``String``
     *  The tooltip text for the undo button (i18n)
     */
    undoButtonTooltip: 'Undo last modification Ctrl+Z',

    /** api: config[copyToBtnText]
     *  ``String``
     *  The text for the copy to another layer button (i18n).
     */
    copyToBtnText: 'Copy to',

    /** api: config[copyToBtnTooltip]
     *  ``String``
     *  The tooltip for the copy to another layer button (i18n).
     */
    copyToBtnTooltip: 'Create new feature in another layer with same geometry',

    /** api: config[forbiddenText]
     *  ``String``
     *  The text displayed when not allowed action is done (i18n).
     */
    forbiddenText: 'You are not allowed to do this action!',

    /** api: config[title]
     *  ``String``
     *  Message display title
     */
    titleText: 'Editing',

    /** api: config[titleValidationError]
     *  ``String``
     *  Message display title for validation error
     */
    titleValidationErrorText: 'Validation Error',

    /** api: config[saveValidationErrorText]
     *  ``String``
     *  Message display when the validation failed
     */
    saveValidationErrorText: 'The validation failed for the geometry. Reason: ',

    /** api: config[saveServerErrorText]
     *  ``String``
     *  Message display when the save failed
     */
    saveServerErrorText: 'Saving failed because of a server error.',

    /** api: config[queryServerErrorText]
     *  ``String``
     *  Message display when the query failed
     */
    queryServerErrorText: 'Query failed because of a server error.',

    /** api: config[cutActionText]
     *  ``String`` i18n
     *  Cut menu item text.
     **/
    cutActionText: 'Cut geometry',

    /** api: config[cutWizardTitle]
     *  ``String`` i18n
     *  Message to show as title in the cut wizard.
     */
    cutWizardTitle: 'Cut the polygon',

    /** api: config[cutWizardSubtitle]
     *  ``String`` i18n
     *  Message to show as subtitle in the cut wizard.
     */
    cutWizardSubtitle: 'Choose polygon B:',

    /** api: config[cutWizardSelectButtonText]
     *  ``String`` i18n
     *  "Select on map" button text in the cut wizard.
     **/
    cutWizardSelectButtonText: 'Select on map',

    /** api: config[cutWizardDrawButtonText]
     *  ``String`` i18n
     *  "Draw a polygon" button text in the cut wizard.
     **/
    cutWizardDrawButtonText: 'Draw a polygon',

    /** api: config[differenceServiceUrl]
     *  ``String``
     *  The URL to the difference service. Used by the cut wizard.
     *  Typically set to ``"${request.route_url('difference')}"``
     */

    /** private: config[pendingRequests]
     *  ``GeoExt.data.AttributeStore``
     *  The list of pendingRequests (actually the attribute stores)
     */
    pendingRequests: null,

    /** api: config[mapserverUrl]
     *  ``String``
     *  The mapserver proxy URL, required when snapping is used. Typically set to
     *  ``"${request.route_url('mapserverproxy')}"``
     */

    /** api: config[snapLayers]
     *  ``Object``
     *  The keys are the layer id and the values are configuration objects. Those
     *  configuration objects are similar to the ``OpenLayers.Control.Snapping``
     *  target properties with two main differences:
     *
     *  * the key *layer* must no be specidied,
     *  * the key *resFactor* is added to specify to  the ``resFactor`` of the
     *    WFS target layer. It defaults to 1 when no value is specified which is
     *    a safe value. It is possible to pass a higher value when the WFS layer
     *    does not contain too many features.
     */

    /** api: config[selectionColors]
     *  ``Object``
     *  The keys are the layer id and the values are the color that will be
     *  used when a feature from the corresponding layer is selected.
     */

    /** api: config[snapOptions]
     *  ``Object``
     *  An object containing the options for the snap control. It might contain
     *  up to 2 keys:
     *
     *  * *defaults*,
     *  * *greedy*.
     */

    /** api: config[allowDrag]
     *  ``Boolean``
     *  Whether or not to allow users to drag the lines or polygons when
     *  editing the geometry. Defaults to true.
     */
    allowDrag: true,

    /** private: property[snapControl]
     * ``OpenLayers.Control.Snapping``
     */
    snapControl: null,

    /** private: property[snapWMSProperties]
     *  ``Object`̀
     *  Store properties about the WMS layers corresponding to the snap targets.
     */
    snapWMSProperties: null,

    /** private: property[snapTreeNodes]
     *  ``Array{String}`̀
     *  List the names of the layer tree node which contain WMS layers
     *  corresponding to the WFS snap targets.
     */
    snapTreeNodes: [],

    /** private: method[constructor]
     */
    constructor: function(config) {
        cgxp.plugins.Editing.superclass.constructor.apply(this, arguments);
        this.pendingRequests = [];
    },

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.Editing.superclass.init.apply(this, arguments);

        this.map = this.target.mapPanel.map;
        this.addEditingLayer();
        this.createGetFeatureControl();

        this.newFeatureBtn = this.createNewFeatureBtn();
        var win = this.win = new Ext.Window(Ext.apply({
            width: 300,
            border: false,
            closable: false,
            plain: true,
            resizable: false,
            disabled: true,
            constrainHeader: true,
            items: [{
                xtype: 'box',
                html: this.helpText,
                style: {
                    padding: '5px'
                }
            }],
            bbar: [
                this.newFeatureBtn,
                '->',
                {
                    xtype: 'button',
                    text: this.undoButtonText,
                    iconCls: 'undo',
                    tooltip: this.undoButtonTooltip,
                    listeners: {
                        click: function(button, pressed) {
                            this.undo();
                        },
                        scope: this
                    }
                }
            ]
        }, this.layersWindowOptions));
        this.target.mapPanel.on({
            'render': function() {
                win.show();
                win.anchorTo.defer(100, win, [this.body, 'tl-tl', [55, 10]]);
            }
        });

        var portal = this.target;
        portal.on({
            ready: function() {
                var tree = portal.tools[this.layerTreeId].tree;
                this.initSnapping();
                tree.on({
                    checkchange: this.manageLayers,
                    addgroup: this.manageLayers,
                    removegroup: this.manageLayers,
                    scope: this
                });
            },
            scope: this
        });

        this.initKeyEvent();
    },

    getActiveDrawControl: function() {
        var draw;
        if (this.newFeatureBtn.activeItem) {
            draw = this.newFeatureBtn.activeItem.control;
            if (draw.active) {
                return draw;
            }
        }
    },

    undo: function() {
        var draw = this.getActiveDrawControl();
        if (draw) {
            draw.undo();
            return true;
        }
        if (this.editorGrid) {
            return this.editorGrid.undo();
        }
    },

    initKeyEvent: function() {
        var editing = this;
        this.onKeyPress = function(evt) {
            // Only for DrawControl, EditorGrid handle keypress itself.
            draw = editing.getActiveDrawControl();
            if (draw) {
                var handled = false;
                switch (evt.keyCode) {
                    case 90: // z
                        if (evt.metaKey || evt.ctrlKey) {
                            handled = draw.undo();
                        }
                        break;
                    case 89: // y
                        if (evt.metaKey || evt.ctrlKey) {
                            handled = draw.redo();
                        }
                        break;
                    case 27: // esc
                        handled = draw.cancel();
                        break;
                }
                if (handled) {
                    OpenLayers.Event.stop(evt);
                }
            }
        };
        OpenLayers.Event.observe(document, "keydown", this.onKeyPress);
    },

    /** private: manageLayers
     *  Checks if there are editable layers, enables or disables the editing
     *  window and updates the editable layers list in the create new feature
     *  button.
     */
    manageLayers: function() {
        if (this.manageLayersTimer) {
            clearTimeout(this.manageLayersTimer);
        }
        var self = this;
        // Add a delay to query the md.xsd because previously we query it,
        // cancel the query, query agane, cancel it again,
        // and finally do the right query ...
        this.manageLayersTimer = setTimeout(function() {
            if (this.snapControl && this.snapControl.active) {
                this.checkSnapLayerVisibility();
            }
            var layers = self.getEditableLayers();
            var size = 0;
            var menu = self.newFeatureBtn.menu;
            self.abortPendingRequests();
            var alreadyAvailableItems = [];
            menu.items.each(function(item) {
                if (!item.layerId) {
                    return;
                }
                // remove items that are not in the layers list anymore
                if (!layers[item.layerId]) {
                    menu.remove(item);
                } else {
                    alreadyAvailableItems.push(item.layerId);
                }
            });
            for (var i in layers) {
                if (layers.hasOwnProperty(i)) {
                    size++;
                    // only add an item for new editable layers
                    if (alreadyAvailableItems.indexOf(parseInt(i, 10)) == -1) {
                        self.getAttributesStore(layers[i].attributes.layer_id, null, (function(store, geometryType, layer) {
                            menu.add(self.createMenuItem(layer, geometryType));
                        }).createDelegate(self, [layers[i]], true));
                    }
                }
            }
            self.win.setDisabled(size === 0);
            if (size === 0) {
                self.newFeatureBtn.toggle(false);
                self.newFeatureBtn.setText(self.createBtnText);
                self.closeEditing();
            }
        }, 200);
    },

    /** private: method[addEditingLayer]
     */
    addEditingLayer: function() {
        var defaultSelectStyle = OpenLayers.Feature.Vector.style.select;
        var self = this;
        var context = {
            getColor: function(feature) {
                return self.selectionColors &&
                    self.selectionColors[feature.attributes.__layer_id__] ||
                    defaultSelectStyle.strokeColor;
            }
        };
        var template = {
            fillColor: "${getColor}",
            strokeColor: "${getColor}"
        };
        OpenLayers.Util.applyDefaults(template, defaultSelectStyle);
        var style = new OpenLayers.Style(template, {context: context});
        var editingStyleMap = new OpenLayers.StyleMap({
            'default': style,
            'select': style,
            'vertices': new OpenLayers.Style({
                pointRadius: 5,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.6,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333"
            })
        });
        this.editingLayer = new OpenLayers.Layer.Vector(
            'editingLayer',
            {
                displayInLayerSwitcher: false,
                styleMap: editingStyleMap
            }
        );
        this.map.addLayer(this.editingLayer);
    },

    /** private: method[createNewFeatureBtn]
     */
    createNewFeatureBtn: function() {
        var menu = new Ext.menu.Menu({
            items: ['<b class="menu-title">' + this.layerMenuText + '</b>'],
            listeners: {
                beforeremove: function(menu, item) {
                    if (newFeatureBtn.activeItem == item) {
                        newFeatureBtn.toggle(false);
                        newFeatureBtn.activeItem = null;
                        newFeatureBtn.setText(newFeatureBtn.initialConfig.text);
                    }
                    if (this.editorGrid &&
                        this.editorGrid.store.feature.attributes.__layer_id__ == item.layerId) {
                        this.closeEditing();
                    }
                },
                scope: this
            }
        });
        var newFeatureBtn = new Ext.SplitButton({
            text: this.createBtnText,
            enableToggle: true,
            allowDepress: true,
            activeItem: null, // the currently active menu item
            menuAlign: 'tr-br',
            listeners: {
                toggle: function(button, pressed) {
                    if (!pressed) {
                        this.deactivateSnap();
                        button.menu.items.each(function(item) {
                            if (item.control) {
                                item.control.deactivate();
                            }
                        });
                    } else if (button.activeItem) {
                        this.activateSnap();
                        this.closeEditing();
                        button.activeItem.control.activate();
                    } else {
                        button.toggle(false);
                        button.showMenu();
                    }
                },
                scope: this
            },
            menu: menu,
            scope: this
        });
        return newFeatureBtn;
    },

    /** private: method[createMenuItem]
     */
    createMenuItem: function(layer, geometryType) {
        // layer is the layer tree node
        var simpleType = geometryType.replace("Multi", "");
        var Handler = {
            "Point": OpenLayers.Handler.Point,
            "Line": OpenLayers.Handler.Path,
            "Curve": OpenLayers.Handler.Path,
            "Polygon": OpenLayers.Handler.Polygon,
            "Surface": OpenLayers.Handler.Polygon
        }[simpleType];
        var control = new OpenLayers.Control.DrawFeature(
            this.editingLayer, Handler, {
                featureAdded: OpenLayers.Function.bind(function(f) {
                    control.deactivate();
                    this.deactivateSnap();
                    this.newFeatureBtn.toggle(false);
                    f.attributes.__layer_id__ =
                        layer.attributes.layer_id;
                    var store = this.getAttributesStore(
                        layer.attributes.layer_id, f,
                        function(store, geometryType) {
                            this.showAttributesEditingWindow(store, geometryType);
                        }
                    );
                }, this),
                handlerOptions: {
                    multi: geometryType != simpleType
                }
            }
        );
        this.map.addControls([control]);
        var prefix = this.createBtnText;
        return new Ext.menu.CheckItem({
            text: layer.attributes.text,
            group: 'create_layer',
            enableToggle: true,
            layerId: layer.attributes.layer_id,
            control: control,
            listeners: {
                checkchange: function(item, checked) {
                    if (!checked) {
                        item.control.deactivate();
                    } else {
                        var btn = item.ownerCt.ownerCt;
                        btn.activeItem = item;
                        btn.toggle(true);
                        item.ownerCt.ownerCt.setText(prefix + ' in <b>' + item.text + '</b>');
                        if (btn.pressed) {
                            item.control.activate();
                        }
                    }
                }
            }
        });
    },

    /** private: method[closeEditing]
     */
    closeEditing: function() {
        // avoid reentrance
        if (!arguments.callee._in) {
            arguments.callee._in = true;
            if (this.attributePopup) {
                this.attributePopup.hide();
                this.attributePopup.removeAll();
            }
            this.editorGrid = null;
            this.editingLayer.removeFeatures(this.editingLayer.features);
            delete arguments.callee._in;
        }
    },

    /** private: method[getEditableLayers]
     *  Returns the list of editable and visible layers
     */
    getEditableLayers: function() {
        // FIXME use cache
        var tree = this.target.tools[this.layerTreeId].tree;
        var layers = {};
        tree.root.cascade(function(node) {
            if (node.attributes.editable && node.attributes.checked) {
                layers[node.attributes.layer_id] = node;
            }
        });
        return layers;
    },

    /** private: method[prepareProtocolOptions]
     *  Add additional parameters to HTTP protocol read options.
     */
    prepareProtocolOptions: function(options) {
        var baseURL = this.layersURL;
        var layerIds = [];
        var editLayers = this.getEditableLayers();

        for (var i in editLayers) {
            if (editLayers.hasOwnProperty(i)) {
                layerIds.push(i);
            }
        }
        if (layerIds.length === 0) {
            // we need to reset the cursor manually
            OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
            return false;
        }
        options.url = baseURL + layerIds.join(',');
        options.params = Ext.apply(options.params || {}, this.readParams);
        var queryable = [];
        Ext.each(this.usedMapParams, function(paramName) {
            var param = this.target.mapPanel.params[paramName];
            if (param !== undefined) {
                options.params[paramName + "__eq"] = param;
                queryable.push(paramName);
            }
        });
        options.params.queryable = queryable;
        return options;
    },

    /** private: method[createGetFeatureControl]
     */
    createGetFeatureControl: function() {
        var self = this;
        var protocol = new OpenLayers.Protocol.HTTP({
            format: new OpenLayers.Format.GeoJSON(),
            read: function(options) {
                options = self.prepareProtocolOptions(options);
                if (!options) {
                    return;
                }

                // ensure that there's no unsaved modification before sending
                // the request.
                function doRead(options) {
                    self.editorGrid && self.editorGrid.cancel();
                    self.closeEditing();
                    OpenLayers.Protocol.HTTP.prototype.read.call(this, options);
                }
                if (self.editorGrid && self.editorGrid.dirty) {
                    Ext.Msg.show({
                        title: self.editorGrid.cancelMsgTitle,
                        msg: self.editorGrid.cancelMsg,
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.MessageBox.QUESTION,
                        fn: function(button) {
                            if (button === "yes") {
                                doRead.call(this, options);
                            } else {
                                // we need to reset the cursor manually
                                OpenLayers.Element.removeClass(self.map.viewPortDiv, "olCursorWait");
                                self.editorGrid.modifyControl.activate();
                                self.editorGrid.modifyControl.selectFeature(self.editorGrid.store.feature);
                            }
                        },
                        scope: this
                    });
                } else {
                    doRead.call(this, options);
                }
            }
        });

        var control = new cgxp.plugins.Editing.GetFeature({
            protocol: protocol
        });
        this.map.addControl(control);
        control.activate();
        control.events.on({
            'featureselected': function(e) {
                this.activateSnap();
                var f = e.feature;
                this.editingLayer.addFeatures([f]);
                var store = this.getAttributesStore(f.attributes.__layer_id__, f, function(store, geometryType) {
                    this.showAttributesEditingWindow(store, geometryType);
                });
            },
            scope: this
        });

        this.mainSelectControl = control;
    },

    /** private: method[getAttributesStore]
     *  Calls the layers service to get metadata (attributes).
     *  Triggers callback when response is received. Callback is called with
     *  the store and the geometryType as arguments.
     */
    getAttributesStore: function(id, feature, callback) {
        var store = new GeoExt.data.AttributeStore({
            autoDestroy: true,
            url: this.layersURL + id + '/md.xsd',
            baseParams: this.metadataParams,
            feature: feature
        });
        store.on({
            load: function() {
                // Remove geometry fields, and add "label" fields for i18n.
                var geometryType;
                var geomRegex = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
                store.each(function(r) {
                    var match = geomRegex.exec(r.get("type"));
                    if (match) {
                        geometryType = match[1];
                        store.remove(r);
                    }
                    r.set('label', OpenLayers.i18n(r.get('name')));
                });
                callback.call(this, store, geometryType);
            },
            beforeload: function(store) {
                this.pendingRequests.push(store);
            },
            scope: this
        });
        store.load();
        return store;
    },

    /** private: method[abortPendingRequests]
     *  Aborts any pending xsd request.
     */
    abortPendingRequests: function() {
        Ext.each(this.pendingRequests, function(store) {
            // destroying the store will destroy the corresponding proxy, and
            // the corresponding active requests
            store.destroy();
        });
        this.pendingRequests = [];
    },

    /** private: method[getLayerNodeById]
     */
    getLayerNodeById: function(layer_id) {
        var tree = this.target.tools[this.layerTreeId].tree;
        var layerNode;
        tree.root.cascade(function(node) {
            if (node.attributes.nodeType == "cgxp_layerparam" &&
                node.attributes.layer_id == layer_id) {
                layerNode = node;
            }
        });
        return layerNode;
    },

    /** private: method[getLayerNodeByName]
     */
    getLayerNodeByName: function(layerName) {
        var tree = this.target.tools[this.layerTreeId].tree;
        var layerNode;
        tree.root.cascade(function(node) {
            if (node.attributes.nodeType == "cgxp_layerparam" &&
                node.attributes.item == layerName) {
                layerNode = node;
            }
        });
        return layerNode;
    },

    /** private: method[getExtraActions]
     *  :param feature: ``OpenLayers.Feature.Vector``
     *  :return: ``Array(Ext.menu.Item)`` List of items to put in the
     *  FeatureEditorGrid actions menu.
     *
     *  Return extra actions for a given feature.
     */
    getExtraActions: function(feature) {
        var layer = this.getLayerNodeById(feature.attributes.__layer_id__);

        var actions = [];
        var metadata = layer.attributes.metadata;
        if (metadata.copy_to !== undefined) {
            var copyToItem = {
                xtype: 'menuitem',
                text: this.copyToBtnText,
                tooltip: this.copyToBtnTooltip,
                menu: []
            };
            Ext.each(metadata.copy_to.split(','), function(layerName) {
                var toLayer = this.getLayerNodeByName(layerName);
                copyToItem.menu.push({
                    xtype: 'menuitem',
                    text: toLayer.attributes.text,
                    name: toLayer.attributes.name,
                    layer_id: toLayer.attributes.layer_id,
                    handler: function(item, evt) {
                        // Create new feature
                        var srcFeature = this.editorGrid.store.feature;
                        var dstFeature = new OpenLayers.Feature.Vector(
                            srcFeature.geometry.clone(),
                            {
                                __layer_id__: item.layer_id
                            }
                        );
                        dstFeature.state = OpenLayers.State.INSERT;

                        // Open editing on new feature
                        this.closeEditing();
                        this.editingLayer.addFeatures([dstFeature]);
                        var store = this.getAttributesStore(
                            item.layer_id, dstFeature,
                            function(store) {
                                this.showAttributesEditingWindow(store);
                            }
                        );
                    },
                    scope: this
                });
            }, this);
            actions.push(copyToItem);
        }
        return actions;
    },

    /** private: method[showAttributesEditingWindow]
     */
    showAttributesEditingWindow: function(store, geometryType) {
        var modifyControlMode = OpenLayers.Control.ModifyFeature.RESHAPE;
        if (this.allowDrag) {
            modifyControlMode = modifyControlMode |
                OpenLayers.Control.ModifyFeature.DRAG;
        }
        var actions = this.getExtraActions(store.feature);

        if (geometryType.indexOf('Polygon') != -1) {
            actions.push(
                new Ext.menu.Item({
                    text: this.cutActionText,
                    handler: function() {
                        this.showCutWizard(store.feature);
                    },
                    scope: this
                })
            );
        }

        this.editorGrid = new GeoExt.ux.FeatureEditorGrid({
            store: store,
            nameField: 'label',
            forceValidation: true,
            allowSave: true,
            allowCancel: true,
            allowDelete: true,
            border: false,
            hideHeaders: true,
            viewConfig: {
                forceFit: true
            },
            modifyControlOptions: {
                vertexRenderIntent: 'vertices',
                mode: modifyControlMode
            },
            extraActions: actions,
            listeners: {
                done: function(panel, e) {
                    this.deactivateSnap();
                    var feature = e.feature;
                    this.save(feature);
                },
                cancel: function(panel, e) {
                    this.deactivateSnap();
                    var feature = e.feature, modified = e.modified;
                    panel.cancel();
                    this.closeEditing();
                    // we call cancel() ourselves so return false here
                    return false;
                },
                scope: this
            }
        });

        var first = false; // first time we show the popup
        if (!this.attributePopup) {
            first = true;
            this.attributePopup = new Ext.Window(Ext.apply({
                map: this.map,
                height: 150,
                width: 300,
                layout: 'vbox',
                layoutConfig: {
                    align: 'stretch',
                    pack: 'start'
                },
                defaults: {
                    flex: 1
                },
                title: 'Object #',
                closable: false,
                unpinnable: false,
                draggable: true,
                border: false,
                constrainHeader: true
            }, this.attributesWindowOptions));
        }
        if (!this.attributesWindowOptions.title) {
            var selectedLayerId = this.editorGrid.featureInfo.attributes.__layer_id__;
            var selectedLayerName = this.getEditableLayers()[selectedLayerId].item;
            this.attributePopup.setTitle(OpenLayers.i18n(selectedLayerName));
        }
        this.attributePopup.add(this.editorGrid);
        this.attributePopup.show();
        if (first) {
            this.attributePopup.anchorTo(this.win.el, 'tl-bl', [0, 5]);
        }
    },

    /** private: method[redrawWMSLayers]
     */
    redrawWMSLayers: function(id) {
        var tree = this.target.tools[this.layerTreeId].tree;
        tree.root.cascade(function(node) {
            if (node.attributes.layer_id == id) {
                node.layer.redraw(true);
            }
        });
    },

    /** private: method[save]
     *  Saves the modifications or addition to the server
     */
    save: function(feature) {
        var protocol = new OpenLayers.Protocol.HTTP({
            url: this.layersURL + feature.attributes.__layer_id__,
            format: new OpenLayers.Format.GeoJSON()
        });
        var self = this;
        var validationError = null;
        function callback(response) {
            if (response.priv.status == 403) {
                Ext.MessageBox.show({
                    msg: self.forbiddenText,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
            } else if (response.priv.status == 400) {
                var json = new OpenLayers.Format.JSON().read(
                    response.priv.responseText);
                if (json.validation_error) {
                    validationError = json.validation_error;
                }
            }
        }
        protocol.commit([feature], {
            create: {
                callback: callback
            },
            update: {
                callback: callback
            },
            'delete': {
                callback: callback
            },
            callback: function(response) {
                if (response.code === 1) {
                    this.closeEditing();
                    this.redrawWMSLayers(feature.attributes.__layer_id__);
                }
                else {
                    if (validationError !== null) {
                        Ext.MessageBox.alert(
                            self.titleValidationErrorText,
                            self.saveValidationErrorText + validationError);
                    } else {
                        Ext.MessageBox.alert(self.titleText, self.saveServerErrorText);
                    }
                }
            },
            scope: this
        });
    },

    /** private: method[initSnapping]
     *  Creates the snapping control and initializes data structures when
     *  snapping is enabled.
     */
    initSnapping: function() {
        if (this.snapLayers) {
            var options = Ext.apply(
                {},
                {
                    layer: this.editingLayer,
                    targets: []
                },
                this.snapOptions
            );

            this.snapControl = new OpenLayers.Control.Snapping(options);

            this.snapWMSProperties = {};
            for (var l in this.snapLayers) {
                if (this.snapLayers.hasOwnProperty(l)) {
                    this.snapLayers[l] = this.snapLayers[l] || {};
                    this.snapLayers[l].layer = null;
                    this.snapWMSProperties[l] = {
                        visibility: false,       // Whether the layer is visible
                        inRange: false,          // Whether the layer is in range
                        treeNodes: [],           // Tree nodes that have the WMS layer
                        url: this.mapserverUrl   // Map server url
                    };
                }
            }

            var treeNodes = this.snapTreeNodes;

            function browse(node, prop, local, parent) {
                for (var i = 0, leni = node.length; i < leni; i++) {
                    var child = node[i];
                    if (child.children) {
                        browse(child.children, prop, local);
                    } else {
                        if (child.childLayers) {
                            browse(child.childLayers, prop, local, child);
                        }
                        var name = child.name;
                        if (name in prop) {
                            if (child.url || (parent && parent.url)) {
                                prop[name].url = child.url || parent.url;
                            }
                            if (!local) {
                                prop[name].url +=
                                    (prop[name].url.indexOf('?') == -1 ? '?' : '&') +
                                    'EXTERNAL=true';
                            }
                            if (parent) {
                                treeNodes.push(parent.name);
                                prop[name].treeNodes.push(parent.name);
                            } else {
                                treeNodes.push(name);
                                prop[name].treeNodes.push(name);
                            }
                        }
                    }
                }
            }

            var tree = this.target.tools[this.layerTreeId].tree;

            browse(tree.themes.local, this.snapWMSProperties, true);

            if (tree.themes.external) {
                browse(tree.themes.external, this.snapWMSProperties, false);
            }

            this.map.events.on({
                zoomend: function() {
                    if (this.snapControl.active) {
                        this.checkSnapLayerInRange();
                    }
                },
                scope: this
            });
        }
    },

    /** private: method[activateSnap]
     */
    activateSnap: function() {
        if (this.snapControl && !this.snapControl.active) {
            var targets = [];

            this.checkSnapLayerVisibility();
            this.checkSnapLayerInRange();

            for (var l in this.snapWMSProperties) {
                if (this.snapWMSProperties.hasOwnProperty(l) &&
                    this.snapWMSProperties[l].visibility &&
                    this.snapWMSProperties[l].inRange) {
                    var target = this.getSnapTarget(l);
                    this.map.addLayer(target.layer);
                    targets.push(target);
                }
            }

            this.snapControl.setTargets(targets);
            this.snapControl.activate();
        }
    },

    /** private: method[deactivateSnap]
     */
    deactivateSnap: function() {
        if (this.snapControl && this.snapControl.active) {
            for (var i = 0, len = this.snapControl.targets.length; i < len; i++) {
                this.map.removeLayer(this.snapControl.targets[i].layer);
            }
            this.snapControl.setTargets([]);
            this.snapControl.deactivate();
        }
    },

    /** private: method[checkSnapLayerVisibility]
     */
    checkSnapLayerVisibility: function() {
        if (this.snapControl) {
            var nodeVisibilities = {};
            var toVisible = [];
            var toHidden = [];
            var tree = this.target.tools[this.layerTreeId].tree;

            Ext.each(
                this.snapTreeNodes,
                function(n) {
                    nodeVisibilities[n] = false;
                }
            );

            // Compute the visibility for the current tree nodes
            tree.root.cascade(function(node) {
                var name = node.attributes.name;
                if (name in nodeVisibilities) {
                    nodeVisibilities[name] = node.attributes.checked;
                }
            }, this);

            // Compute the visibility for the WMS layers
            for (var layer in this.snapWMSProperties) {
                if (this.snapWMSProperties.hasOwnProperty(layer)) {
                    var visibility = false;
                    Ext.each(
                        this.snapWMSProperties[layer].treeNodes,
                        function(l) {
                            visibility = visibility || nodeVisibilities[l];
                        }
                    );
                    if (visibility != this.snapWMSProperties[layer].visibility) {
                        this.snapWMSProperties[layer].visibility = visibility;
                        if (this.snapWMSProperties[layer].inRange) {
                            if (visibility) {
                                toVisible.push(layer);
                            } else {
                                toHidden.push(layer);
                            }
                        }
                    }
                }
            }

            this.updateSnapTargets(toVisible, toHidden);
        }
    },

    /** private: method[checkSnapLayerInRange]
     */
    checkSnapLayerInRange: function() {
        if (this.snapControl) {
            var tree = this.target.tools[this.layerTreeId].tree;
            var toVisible = [];
            var toHidden = [];
            var currentRes = this.map.getResolution();
            var nodeInRanges = {};

            function checkInRange(l, res) {
                if (!l.minResolutionHint && l.minScaleDenominator) {
                    l.minResolutionHint =
                        OpenLayers.Util.getResolutionFromScale(l.minScaleDenominator, units);
                }
                if (!l.maxResolutionHint && l.maxScaleDenominator) {
                    l.maxResolutionHint =
                        OpenLayers.Util.getResolutionFromScale(l.maxScaleDenominator, units);
                }
                return (!((l.minResolutionHint && res < l.minResolutionHint) ||
                    (l.maxResolutionHint && res > l.maxResolutionHint)));
            }

            Ext.each(
                this.snapTreeNodes,
                function(n) {
                    nodeInRanges[n] = false;
                }
            );

            // Compute the "inRange" for the current tree nodes
            tree.root.cascade(function(node) {
                var name = node.attributes.name;
                if (name in nodeInRanges) {
                    nodeInRanges[name] = checkInRange(node.attributes, currentRes);
                }
            }, this);

            // Compute the "inRange" for the WMS layers
            for (var layer in this.snapWMSProperties) {
                if (this.snapWMSProperties.hasOwnProperty(layer)) {
                    var inRange = false;
                    Ext.each(
                        this.snapWMSProperties[layer].treeNodes,
                        function(l) {
                            inRange = inRange || nodeInRanges[l];
                        }
                    );
                    if (inRange != this.snapWMSProperties[layer].inRange) {
                        this.snapWMSProperties[layer].inRange = inRange;
                        if (this.snapWMSProperties[layer].visibility) {
                            if (inRange) {
                                toVisible.push(layer);
                            } else {
                                toHidden.push(layer);
                            }
                        }
                    }
                }
            }

            this.updateSnapTargets(toVisible, toHidden);
        }
    },

    /** private: method[updateSnapTargets]
     */
    updateSnapTargets: function(toVisible, toHidden) {
        if (this.snapControl.active) {
            Ext.each(toVisible, function(name) {
                var target = this.getSnapTarget(name);
                this.map.addLayer(target.layer);
                this.snapControl.addTarget(target);
            }, this);

            Ext.each(toHidden, function(name) {
                var target = this.getSnapTarget(name);
                this.map.removeLayer(target.layer);
                this.snapControl.removeTarget(target);
            }, this);
        }
    },

    /** private: method[getSnapTarget]
     *  Allows to lazily create the WFS layers acting as snap targets.
     */
    getSnapTarget: function(name) {
        if (!this.snapLayers[name].layer) {
            var layer = new OpenLayers.Layer.Vector(
                "wfs-snap-target-" + name,
                {
                    displayInLayerSwitcher: false,
                    visibility: false,
                    strategies: [
                        new OpenLayers.Strategy.BBOX({
                            resFactor: this.snapLayers[name].resFactor || 1.0,
                            update: function() {
                                // Hack: the features would not be reloaded when
                                // the layer is not visible.
                                this.layer.visibility = true;
                                OpenLayers.Strategy.BBOX.prototype.update.apply(this, arguments);
                                this.layer.visibility = false;
                            },
                            merge: function() {
                                // Hack: do not call merge when the layer is not
                                // in the map
                                if (this.layer.map) {
                                    OpenLayers.Strategy.BBOX.prototype.merge.apply(this, arguments);
                                }
                            }
                        })
                    ],
                    protocol: new OpenLayers.Protocol.WFS({
                        version: "1.0.0",
                        srsName: this.map.getProjection(),
                        url: this.snapWMSProperties[name].url,
                        featureType: name,
                        featureNS: cgxp.WFS_FEATURE_NS || "http://mapserver.gis.umn.edu/mapserver"
                    })
                }
            );
            this.snapLayers[name].layer = layer;
            // Hack: the BBOX strategy expects a moveend event on the layer
            // which is not triggered when the layer is not visible
            this.map.events.on({
                "moveend": function() {
                    layer.events.triggerEvent("moveend");
                }
            });

        }

        return this.snapLayers[name];
    },

    /** private: method[showCutWizard]
     *  Displays the window to cut a polygon geometry with an other geometry.
     */
    showCutWizard: function(feature) {
        // temporarily set a new geometry on feature
        // removing and readding the feature prevent side effects with old
        // geometry not being cleared
        this.editingLayer.removeFeatures([feature]);
        var initialGeometry = feature.geometry;
        var geometry = feature.geometry.clone();
        feature.geometry = geometry;
        this.editingLayer.addFeatures([feature]);

        this.editorGrid.hide();
        // we don't want current feature to be unselected by
        // clickout
        this.mainSelectControl.deactivate();
        this.editorGrid.modifyControl.unselectFeature(feature);

        function onComputeDone(geometry) {
            // remove feature from editingLayer before updating the geometry
            this.editingLayer.removeFeatures([feature]);
            feature.geometry = geometry;
            // then readd the feature to editingLayer
            this.editingLayer.addFeatures([feature]);
            loadMask.hide();
        }

        function onComputeError() {
            // Do something
            loadMask.hide();
        }

        function cancel() {
            this.editingLayer.removeFeatures([feature]);
            feature.geometry = initialGeometry;
            this.editingLayer.addFeatures([feature]);
            closeWizard.call(this);
        }

        function validate() {
            feature.state = OpenLayers.State.INSERT ?
                OpenLayers.State.INSERT : OpenLayers.State.UPDATE;
            feature.layer.events.triggerEvent("featuremodified", {
                feature: feature
            });
            closeWizard.call(this);
        }

        function closeWizard() {
            this.editorGrid.show();
            this.attributePopup.remove(wizardPanel);
            // re-select the feature because it may have been unselected for
            // example if a new polygon was drawn
            this.editorGrid.modifyControl.selectFeature(feature);
            handler.deactivate();
            handler.destroy();
            selectControl.deactivate();
            selectControl.destroy();
            this.mainSelectControl.activate();
        }

        var self = this;
        var protocol = new OpenLayers.Protocol.HTTP({
            format: new OpenLayers.Format.GeoJSON(),
            read: function(options) {
                options = self.prepareProtocolOptions(options);
                OpenLayers.Protocol.HTTP.prototype.read.call(this, options);
            }
        });
        var selectControl = new cgxp.plugins.Editing.GetFeature({
            protocol: protocol
        });
        selectControl.events.on({
            "featureselected": function(e) {
                loadMask.show();
                var geomB = e.feature.geometry;
                this.computeDifference(feature.geometry, geomB,
                   onComputeDone, onComputeDone);
           },
           scope: this
        });
        this.map.addControl(selectControl);
        var handler = new OpenLayers.Handler.Polygon({
            map: this.map
        }, {
            done: OpenLayers.Function.bind(function(geometry) {
                loadMask.show();
                handler.deactivate();
                drawButton.toggle(false);
                this.computeDifference(feature.geometry, geometry,
                    onComputeDone, onComputeError);
            }, this)
        });

        var selectButton = new Ext.Button({
            iconCls: 'infotooltip',
            text: this.cutWizardSelectButtonText,
            handler: function() {
                handler.deactivate();
                selectButton.toggle(true);
                selectControl.activate();
                drawButton.toggle(false);
            },
            scope: this
        });

        // I can't use a GeoExt.Action here because we rely directly on the
        // handler instead of a control
        var drawButton = new Ext.Button({
            iconCls: 'gx-featureediting-draw-polygon',
            text: this.cutWizardDrawButtonText,
            enableToggle: true,
            handler: function(b) {
                if (b.pressed) {
                    handler.activate();
                    selectButton.toggle(false);
                    selectControl.deactivate();
                } else {
                    handler.deactivate();
                }
            },
            scope: this
        });

        var wizardPanel = new Ext.Panel({
            defaults: {
                style: {
                    padding: '5px'
                }
            },
            items: [{
                xtype: 'container',
                layout: 'hbox',
                layoutConfig: {
                    align: 'middle'
                },
                items: [{
                    xtype: 'box',
                    style: {
                        'font-weight': 'bold'
                    },
                    html: this.cutWizardTitle
                }, {
                    xtype: 'box',
                    html: '<span class="cut-help">'
                }]
            }, {
                xtype: 'container',
                html: this.cutWizardSubtitle
            }, {
                xtype: 'container',
                layout: 'hbox',
                layoutConfig: {
                    align: 'middle'
                },
                defaults: {
                    margins: '0 5 0 0'
                },
                items: [selectButton, {
                    xtype: 'box',
                    html: ' or '
                }, drawButton]
            }],
            bbar: ['->', {
                text: 'Cancel',
                handler: cancel,
                scope: this
            }, {
                text: 'OK',
                handler: validate,
                scope: this
            }]
        });
        this.attributePopup.add(wizardPanel);
        this.attributePopup.doLayout();
        var loadMask = new Ext.LoadMask(wizardPanel.body);
    },

    /** private: method[computeDifference]
     *  Sends request to difference service to the get the cut geometry back.
     */
    computeDifference: function(geomA, geomB, success, failure) {
        var geojson = new OpenLayers.Format.GeoJSON();
        geomA = Ext.util.JSON.decode(geojson.write(geomA));
        geomB = Ext.util.JSON.decode(geojson.write(geomB));

        Ext.Ajax.request({
            url: this.differenceServiceUrl,
            method: 'POST',
            jsonData: {
                geometries: [geomA, geomB]
            },
            success: function(result) {
                success.call(this,
                    geojson.read(result.responseText)[0].geometry);
            },
            failure: function() {
                failure.call(this);
            },
            scope: this
        });
    }
});

/** api: (define)
 *  module = cgxp.plugins.Editing
 *  class = GetFeature
 *
 *  It's a class inherited from OpenLayers.Control.GetFeature. The goal is to
 *  overrride the request method so that we can show a message when the request
 *  fails.
 */
cgxp.plugins.Editing.GetFeature = OpenLayers.Class(OpenLayers.Control.GetFeature, {
    request: function(bounds, options) {
        options = options || {};
        var filter = new OpenLayers.Filter.Spatial({
            type: this.filterType,
            value: bounds
        });

        // Set the cursor to "wait" to tell the user we're working.
        OpenLayers.Element.addClass(this.map.viewPortDiv, "olCursorWait");

        var response = this.protocol.read({
            maxFeatures: options.single === true ? this.maxFeatures : undefined,
            filter: filter,
            callback: function(result) {
                if (result.success()) {
                    if (result.features.length) {
                        if (options.single === true) {
                            this.selectBestFeature(result.features,
                                bounds.getCenterLonLat(), options);
                        } else {
                            this.select(result.features);
                        }
                    } else if(options.hover) {
                        this.hoverSelect();
                    } else {
                        this.events.triggerEvent("clickout");
                        if(this.clickout) {
                            this.unselectAll();
                        }
                    }
                }
                else {
                    Ext.MessageBox.alert(this.titleText,
                        cgxp.plugins.Editing.prototype.queryServerErrorText);
                }
                // Reset the cursor.
                OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
            },
            scope: this
        });
        if (options.hover === true) {
            this.hoverResponse = response;
        }
    }
});

Ext.preg(cgxp.plugins.Editing.prototype.ptype, cgxp.plugins.Editing);
