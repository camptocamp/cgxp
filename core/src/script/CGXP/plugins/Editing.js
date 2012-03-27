/**
 * Copyright (c) 2012 Camptocamp
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
 * @include OpenLayers/Protocol/HTTP.js
 * @include OpenLayers/Format/GeoJSON.js
 * @include OpenLayers/Control/GetFeature.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/Format/QueryStringFilter.js
 * @include GeoExt/data/AttributeStore.js
 * @include GeoExt.ux/FeatureEditorGrid.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Editing
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Editing(config)
 *
 *    Add an editing tool to the map.
 *
 *    This plugin works with the c2cgeoportal "layers" web service. It
 *    requires a :class:`cgxp.plugins.LayerTree` plugin in the viewer.
 *
 */
cgxp.plugins.Editing = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_editing */
    ptype: "cgxp_editing",

    /** api: config[layersURL]
     *  ``String``
     *  URL to the layers web service.
     */
    layersURL: null,

    /** api: config[layerTreeId]
     *  ``String``
     *  Id of the layertree tool.
     */
    layerTreeId: null,

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
     *  create button is pressed).
     */
    layerMenuText: 'Choose a layer',

    /** api: config[createBtnText]
     *  ``String``
     *  The text for the create button.
     */
    createBtnText: 'Create a new feature',

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.Editing.superclass.init.apply(this, arguments);

        this.map = this.target.mapPanel.map;
        this.addEditingLayer();
        this.createGetFeatureControl();

        this.newFeatureBtn = this.createNewFeatureBtn();
        var win = this.win = new Ext.Window({
            width: 300,
            border: false,
            closable: false,
            plain: true,
            resizable: false,
            disabled: true,
            items: [{
                xtype: 'box',
                html: this.helpText + '<hr />'
            }, this.newFeatureBtn]
        });
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
                tree.on({
                    checkchange: this.manageLayers,
                    scope: this
                });
            },
            scope: this
        });
    },

    /** private: manageLayers
     *  Checks if there are editable layers, enables or disables the editing
     *  window and updates the editable layers list in the create new feature
     *  button.
     */
    manageLayers: function() {
        var layers = this.getEditableLayers();
        var size = 0;
        var menu = this.newFeatureBtn.menu;
        menu.removeAll();
        menu.add('<b class="menu-title">' + this.layerMenuText + '</b>');
        for (var i in layers) {
            size++;
            this.getAttributesStore(layers[i].attributes.layer_id, null, (function(store, geometryType, layer) {
                menu.add(this.createMenuItem(layer, geometryType));
            }).createDelegate(this, [layers[i]], true));
        }
        this.win.setDisabled(size === 0);
        if (size === 0) {
            this.newFeatureBtn.toggle(false);
            this.newFeatureBtn.setText(this.createBtnText);
            this.closeEditing();
        }
    },

    /** private: method[addEditingLayer]
     */
    addEditingLayer: function() {
        var editingStyleMap = new OpenLayers.StyleMap({  
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
        var menu = new Ext.menu.Menu({});
        var newFeatureBtn = new Ext.SplitButton({
            text: this.createBtnText,
            enableToggle: true,
            allowDepress: true,
            activeItem: null, // the currently active menu item
            menuAlign: 'tr-br',
            listeners: {
                toggle: function(button, pressed) {
                    if (!pressed) {
                        button.menu.items.each(function(item) {
                            if (item.control) {
                                item.control.deactivate();
                            }
                        });
                    } else if (button.activeItem) {
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
                    this.newFeatureBtn.toggle(false);
                    f.attributes.__layer_id__ =
                        layer.attributes.layer_id;
                    var store = this.getAttributesStore(
                        layer.attributes.layer_id, f,
                        function(store) {
                            this.showAttributesEditingWindow(store);
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
        if(!arguments.callee._in) {
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

    /** private: method[createGetFeatureControl]
     */
    createGetFeatureControl: function() {
        var self = this;
        var baseURL = this.layersURL;
        var protocol = new OpenLayers.Protocol.HTTP({
            format: new OpenLayers.Format.GeoJSON(),
            read: function(options) {
                var layerIds = [];
                for (var i in self.getEditableLayers()) {
                    layerIds.push(i);
                }
                if (layerIds.length === 0) {
                    return;
                }
                options.url = baseURL + layerIds.join(',');
                // ensure that there's no unsaved modification before sending
                // the request.
                function doRead(options) {
                    self.editorGrid && self.editorGrid.cancel();
                    self.closeEditing();
                    OpenLayers.Protocol.HTTP.prototype.read.call(this, options);
                }
                if(self.editorGrid && self.editorGrid.dirty) {
                    Ext.Msg.show({
                        title: self.editorGrid.cancelMsgTitle,
                        msg: self.editorGrid.cancelMsg,
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.MessageBox.QUESTION,
                        fn: function(button) {
                            if(button === "yes") {
                                doRead.call(this, options);
                            }
                        },
                        scope: this
                    });
                } else {
                    doRead.call(this, options);
                }
            }
        });

        var control = new OpenLayers.Control.GetFeature({
            protocol: protocol
        });
        this.map.addControl(control);
        control.activate();
        control.events.on({
            'featureselected': function(e) {
                var f = e.feature;
                this.editingLayer.addFeatures([f]);
                var store = this.getAttributesStore(f.attributes.__layer_id__, f, function(store) {
                    this.showAttributesEditingWindow(store);
                });
            },
            scope: this
        });
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
            feature: feature
        });
        store.on({
            load: function() {
                var geometryType;
                var geomRegex = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
                store.each(function(r) {
                    var match = geomRegex.exec(r.get("type"));
                    if (match) {
                        geometryType = match[1];
                        store.remove(r);
                        return false;
                    }
                });
                callback.call(this, store, geometryType);
            },
            scope: this
        });
        store.load();
        return store;
    },

    /** private: method[showAttributesEditingWindow]
     */
    showAttributesEditingWindow: function(store) {
        this.editorGrid = new GeoExt.ux.FeatureEditorGrid({
            store: store,
            forceValidation: true,
            allowSave: true,
            allowCancel: true,
            allowDelete: true,
            border: false,
            hideHeaders: true,
            viewConfig: {
                forceFit: true,
                scrollOffset: 2 // the grid will never have scrollbars
            },
            modifyControlOptions: {
                vertexRenderIntent: 'vertices'
            },
            listeners: {
                done: function(panel, e) {
                    var feature = e.feature;
                    this.save(feature, this.closeEditing);
                },
                cancel: function(panel, e) {
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
            this.attributePopup = new Ext.Window({
                map: this.map,
                height: 150,
                width: 300,
                layout: 'fit',
                title: 'Object #',
                closable: false,
                unpinnable: false,
                draggable: true,
                border: false
            });
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
    save: function(feature, callback) {
        var protocol = new OpenLayers.Protocol.HTTP({
            url: this.layersURL + feature.attributes.__layer_id__,
            format: new OpenLayers.Format.GeoJSON()
        });
        protocol.commit([feature], {
            callback: function() {
                this.closeEditing();
                this.redrawWMSLayers(feature.attributes.__layer_id__);
            },
            scope: this
        });
    }
});

Ext.preg(cgxp.plugins.Editing.prototype.ptype, cgxp.plugins.Editing);
