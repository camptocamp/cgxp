var mapPanel, map, attributePopup, editorGrid;
Ext.onReady(function() {
    Ext.QuickTips.init();
    var currentLayer;

    map = new OpenLayers.Map({ });
    map.addLayers([
        new OpenLayers.Layer('fake', {
            isBaseLayer: true,
            displayInLayerSwitcher: false
        }),
        new OpenLayers.Layer.WMS(
            "vmap0",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic'},
            {
                isBaseLayer: false
            }
        )
    ]);
    mapPanel = new GeoExt.MapPanel({
        region: 'center',
        map: map
    });
    var layerList = new GeoExt.tree.LayerContainer({
        layerStore: mapPanel.layers,
        leaf: false,
        expanded: true
    });

    var layerTree = new Ext.tree.TreePanel({
        border: false,
        rootVisible: false,
        root: layerList
    });

    var randomPointList = function(size) {
        var pointList = [];
        var x = Math.random() * 360 - 180;
        var y = Math.random() * 180 - 90;
        // at least 3 and up to 13 vertices
        var nb = Math.random() * 10 + 3;
        for(var p=0; p<nb; ++p) {
            var a = p * (2 * Math.PI) / (nb + 1);
            var r = Math.random(1) * size + size;
            var newPoint = new OpenLayers.Geometry.Point(x + (r * Math.cos(a)),
                                                         y + (r * Math.sin(a)));
            pointList.push(newPoint);
        }
        pointList.push(pointList[0]);
        return pointList;
    };
    var randomFeatures = function(size) {
        var features = [];
        var f = 0;
        while (f < 5) {
            // create a polygon feature from a linear ring of points
            var linearRing = new OpenLayers.Geometry.LinearRing(randomPointList(size));
            var feature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Polygon([linearRing]));
            features.push(feature); 
            f++;
        }
        return features;
    };
    // creating a fake (WMS-like) polygons layer
    var layer0 = new OpenLayers.Layer.Vector('Layer One', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeOpacity: 0.6,
                strokeColor: '#FF5599',
                fillColor: '#FF5599',
                fillOpacity: 0.5
            }
        })
    });
    layer0.attributeStoreConfig = { 
        fields: ["name", "type", "restriction", "label"],
        data: [{
            name: "symbol",
            label: "Symbol",
            type: {
                xtype: "combo",
                store: new Ext.data.ArrayStore({
                    fields: ['type'],
                    data: [['restaurant'], ['pub'], ['cafe']]
                }),
                displayField: 'type',
                valueField: 'type',
                mode: 'local',
                editable: false,
                forceSelection: true,
                triggerAction: 'all',
                selectOnFocus: true
            },
            value: "restaurant"
        }, {
            name: "name",
            type: "text",
            label: "Name"
        }]
    };
    layer0.addFeatures(randomFeatures(20));
    map.addLayer(layer0);

    var layer1 = new OpenLayers.Layer.Vector('Layer Two', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeOpacity: 0.6,
                strokeColor: '#55FF55',
                fillColor: '#55FF55',
                fillOpacity: 0.5
            }
        })
    });
    layer1.attributeStoreConfig = { 
        fields: ["name", "type", "restriction", "label"],
        data: [{
            name: "usage",
            label: "Usage",
            type: {
                xtype: "combo",
                store: new Ext.data.ArrayStore({
                    fields: ['type'],
                    data: [['industrial'], ['agricultural'], ['residential']]
                }),
                displayField: 'type',
                valueField: 'type',
                mode: 'local',
                editable: false,
                forceSelection: true,
                triggerAction: 'all',
                selectOnFocus: true
            },
            value: "agricultural"
        }, {
            name: "name",
            type: "text",
            label: "Name"
        }]
    };
    layer1.addFeatures(randomFeatures(10));
    map.addLayer(layer1);

    var layer2 = new OpenLayers.Layer.Vector('Africa Countries', {
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: 'world_factbk_simplified_africa.json',
            format: new OpenLayers.Format.GeoJSON()
        }),
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeOpacity: 0.6,
                strokeColor: '#AAAAAA',
                fillColor: '#CACACA',
                fillOpacity: 0.5,
                strokeWidth: 1
            }
        })
    });
    layer2.attributeStoreConfig = { 
        fields: ["name", "type", "restriction", "label"],
        data: [{
            name: "country",
            type: "text",
            label: "Country Name"
        }]
    };
    map.addLayer(layer2);

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
    var editingLayer = new OpenLayers.Layer.Vector(
        'editingLayer',
        {
            displayInLayerSwitcher: false,
            styleMap: editingStyleMap
        }
    );
    editingLayer.events.on({
        featureselected: function(e) {
        }
    });
    map.addLayers([editingLayer]);

    var store = new Ext.data.ArrayStore({
        fields: [
            'myId',
            'displayText',
            'handler',
            'layer'
        ],
        data: [
            [1, layer0.name, OpenLayers.Handler.Polygon, layer0],
            [2, layer1.name, OpenLayers.Handler.Polygon, layer1],
            [3, layer2.name, OpenLayers.Handler.Polygon, layer2],
        ]
    });
    var layerItems = ['<b class="menu-title">Choose a layer</b>'];
    store.each(function(r) {
        var control = new OpenLayers.Control.DrawFeature(
            editingLayer, 
            r.get('handler'),
            {
                featureAdded: function(feature) {
                    this.deactivate();
                    newFeatureBtn.toggle(false);
                    showAttributesEditingWindow(feature);
                }
            }
        );
        map.addControls([control]);
        layerItems.push(new Ext.menu.CheckItem({
            text: r.get('displayText'),
            group: 'digitize_layer',
            enableToggle: true,
            control: control,
            destLayer: r.get('layer'), // set the destination layer
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
        }));
    });

    var prefix = 'Digitize a new feature';
    var newFeatureBtn = new Ext.SplitButton({
        text: prefix, 
        enableToggle: true,
        allowDepress: true,
        activeItem: null, // the currently active menu item
        menuAlign: 'tr-br',
        listeners: {
            toggle: function(button, pressed) {
                if (!pressed) {
                    this.menu.items.each(function(item) {
                        if (item.control) {
                            item.control.deactivate();
                        }
                    });
                } else if (this.activeItem) {
                    closeEditing();
                    // ensure that the destLayer is visible
                    this.activeItem.destLayer.setVisibility(true);
                    currentLayer = this.activeItem.destLayer;
                    this.activeItem.control.activate();
                } else {
                    button.toggle(false);
                    button.showMenu();
                }
            }
        },
        menu: new Ext.menu.Menu({
            items: layerItems
        }),
        scope: this
    });

    function closeEditing() {
        // avoid reentrance
        if(!arguments.callee._in) {
            arguments.callee._in = true;
            if (attributePopup) {
                attributePopup.hide();
                attributePopup.removeAll();
            }
            editorGrid = null;
            editingLayer.removeFeatures(editingLayer.features);
            delete arguments.callee._in;
        }
    }

    // callback is called when the feature is saved (or deleted)
    function save(feature, callback) {
        // here, do something with the feature
        window.setTimeout(function() {
            if (feature.originalFeature) {
                currentLayer.removeFeatures([feature.originalFeature]);
            }
            if (feature.state != OpenLayers.State.DELETE) {
                Ext.example.msg('OK', 'The feature has been saved');
                currentLayer.addFeatures([feature.clone()]);
            } else {
                Ext.example.msg('OK', 'The feature has been deleted');
            }
            callback && callback.call();
        }, 500);
    }

    function showAttributesEditingWindow(feature) {
        var store = new GeoExt.data.AttributeStore(Ext.apply({
            feature: feature
        }, currentLayer.attributeStoreConfig));
        editorGrid = new GeoExt.ux.FeatureEditorGrid({
            nameField: "label",
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
                    var feature = e.feature, modified = e.modified;
                    save(feature, closeEditing);
                },
                cancel: function(panel, e) {
                    var feature = e.feature, modified = e.modified;
                    panel.cancel();
                    closeEditing();
                    // we call cancel() ourselves so return false here
                    return false;
                }
            }
        });

        var first = false; // first time we show the popup
        if (!attributePopup) {
            first = true;
            attributePopup = new Ext.Window({
                map: map,
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
        attributePopup.add(editorGrid);
        attributePopup.show();
        if (first) {
            attributePopup.anchorTo(win.el, 'tl-bl', [0, 5]);
        }
    }

    // control to simulate a server call to get info on a feature to be
    // modified
    var click = new OpenLayers.Control.Click({
        trigger: function(e) {
            var doCancel = function() {
                editorGrid && editorGrid.cancel();
                closeEditing();
                Ext.example.msg('Querying the server', '');
                window.setTimeout(OpenLayers.Function.bind(function() {
                    var lonlat = this.map.getLonLatFromViewPortPx(e.xy);
                    var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
                    var layers = this.map.layers;
                    for (var i=layers.length - 1; i >= 0; i--) { 
                        var layer = layers[i];
                        if (!layer.features || !layer.visibility) {
                            continue;
                        }
                        for (var f=0; f < layer.features.length; f++) {
                            var feature = layer.features[f];
                            if (point.intersects(feature.geometry)) {
                                this.onFeature(feature);
                                return;
                            }
                        }
                    }
                }, this), 500);
            };
            if(editorGrid && editorGrid.dirty) {
                Ext.Msg.show({
                    title: editorGrid.cancelMsgTitle,
                    msg: editorGrid.cancelMsg,
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.MessageBox.QUESTION,
                    fn: function(button) {
                        if(button === "yes") {
                            doCancel.call(click);
                        }
                    }
                });
            } else {
                doCancel.call(click);
            }
        },
        onFeature: function(feature) {
            if (feature) {
                var f = feature.clone();
                f.originalFeature = feature;
                editingLayer.addFeatures([f]);
                currentLayer = feature.layer;
                showAttributesEditingWindow(f);
            }
        }
    });
    map.addControls([click]);
    click.activate();

    var viewport = new Ext.Viewport({
        layout: 'fit',
        border: false,
        items: [mapPanel]
    });

    var win = new Ext.Window({
        width: 300,
        border: false,
        closable: false,
        plain: true,
        items: [{
            xtype: 'box',
            html: 'Click on the map to <b>edit existing features</b>, or<hr />'
        }, newFeatureBtn]
    });
    win.show();
    win.anchorTo(mapPanel.el, 'tl-tl', [55, 10]);

    var layersWin = new Ext.Window({
        title: "Layers",
        width: 350,
        border: false,
        closable: false,
        plain: true,
        collapsible: true,
        items: [layerTree]
    });
    layersWin.show();
    layersWin.anchorTo(mapPanel.el, 'tr-tr', [-10, 10]);
});

Ext.override(GeoExt.Action, {

   /**
    * Sets a new OpenLayer's control for this action
    * @param {OpenLayers.Control} control the control to set
    */
   setControl: function(control) {
       var isActive = this.control ? this.control.active : false;
       if(this.control) {
           this.unsetControl();
       }
       if(isActive) {
           control.activate();
       } else {
           control.deactivate();
       }

       control.events.on({
           activate: this.onCtrlActivate,
           deactivate: this.onCtrlDeactivate,
           scope: this
       });

       this.control = control;
   },

   /**
    * Unsets the control currently set on this action
    */
   unsetControl: function() {
       if(!this.control) {
           return;
       }

       if(this.control.events) {
           this.control.events.un({
               activate: this.onCtrlActivate,
               deactivate: this.onCtrlDeactivate,
               scope: this
           });
       }
       if(this.control.active) {
           this.control.deactivate();
       }
       this.control = null;
   }
});

OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        ); 
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.trigger
            }, this.handlerOptions
        );
    }
});
