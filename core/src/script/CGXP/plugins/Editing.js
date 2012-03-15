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

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Disclaimer
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Disclaimer(config)
 *
 */
cgxp.plugins.Editing = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_editing */
    ptype: "cgxp_editing",

    /** api: config[layersURL]
     * ``String`` URL to the layers web service
     * ie. for the getFeatures requests
     */
    layersURL: null,

    /** api: config[layerTreeId]
     *  ``String``
     *  Id of the layertree tool.
     */
    layerTreeId: null,

    /** private: property[editingLayer]
     * ``OpenLayers.Layer.Vector`` The vector editing layer
     */
    editingLayer: null,

    /** private: property[attributePopup]
     * ``Ext.Window`` The attributes editing popup
     */
    attributePopup: null,

    /** private: property[editorGrid]
     * ``GeoExt.ux.FeatureEditorGrid`` The feature editor grid.
     */
    editorGrid: null,

    /** private: property[attributeStores]
     * stroes the attributes stors by layer id.
     */
    attributeStores: null,

    /** private: property[win]
     *  ``Ext.Window`` The main window. The one that include the button to
     *  digitize a new feature.
     */
    win: null,

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.Editing.superclass.init.apply(this, arguments);

        this.map = this.target.mapPanel.map;
        this.addEditingLayer();
        this.createGetFeatureControl();

        var win = this.win = new Ext.Window({
            width: 300,
            border: false,
            closable: false,
            plain: true,
            resizable: false,
            items: [{
                xtype: 'box',
                html: OpenLayers.i18n('Click on the map to <b>edit existing features</b>, or') + '<hr />'
            }, this.createNewFeatureBtn()]
        });
        this.target.mapPanel.on({
            'render': function() {
                win.show();
                win.anchorTo.defer(100, win, [this.el, 'tl-tl', [55, 10]]);
            }
        });
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
        var portal = this.target;
        portal.on({
            ready: function() {
                var tree = portal.tools[this.layerTreeId].tree;
                tree.on({
                    addgroup: manageMenuItems.createDelegate(this),
                    removegroup: manageMenuItems.createDelegate(this)
                });
            },
            scope: this
        });

        var menu = new Ext.menu.Menu({});
        function manageMenuItems() {
            menu.removeAll();
            menu.add('<b class="menu-title">' + OpenLayers.i18n('Choose a layer') + '</b>');
            var layers = this.getEditableLayers();
            for (var i in layers) {
                menu.add(createMenuItem.call(this, layers[i]));
            }
        }
        function createMenuItem(layer) {
            // layer is the layer tree node
            var control = new OpenLayers.Control.DrawFeature(
                this.editingLayer,
                // FIXME
                OpenLayers.Handler.Polygon,
                {
                    featureAdded: OpenLayers.Function.bind(function(f) {
                        control.deactivate();
                        newFeatureBtn.toggle(false);
                        f.attributes.__layer_id__ = layer.attributes.layer_id;
                        var store = this.getAttributesStore(layer.attributes.layer_id, f, function(store) {
                            this.showAttributesEditingWindow(store);
                        });
                    }, this),
                    handlerOptions: {
                        multi: true
                    }
                }
            );
            this.map.addControls([control]);
            return new Ext.menu.CheckItem({
                text: layer.attributes.text,
                group: 'digitize_layer',
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
        }

        var prefix = OpenLayers.i18n('Digitize a new feature');
        var newFeatureBtn = new Ext.SplitButton({
            text: prefix, 
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
                options.url = baseURL + '/' + layerIds.join(',');
                // ensure that there's no unsaved modification before sending
                // the request.
                function doRead(options) {
                    self.editorGrid && self.editorGrid.cancel();
                    self.closeEditing();
                    Ext.example.msg('Querying the server', '');
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
     *  Triggers callback when response is received or immediately if data
     *  already exists. 
     */
    getAttributesStore: function(id, feature, callback) {
        if (!this.attributeStores) {
            this.attributeStores = {};
        }
        var store = this.attributeStores[id];
        if (!store) {
            store = new GeoExt.data.AttributeStore({
                url: this.layersURL + '/' + id + '/md.xsd',
                feature: feature
            });
            store.on({
                load: function() {
                    callback.call(this, store);
                },
                scope: this
            });
            store.load();
            this.attributeStores[id] = store;
        } else {
            store.feature = feature;
            callback.call(this, store);
        }
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
        if (!attributePopup) {
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
            url: this.layersURL + '/' + feature.attributes.__layer_id__,
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
