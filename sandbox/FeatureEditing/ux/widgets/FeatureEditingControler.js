/** api: (define)
 *  module = GeoExt.ux
 *  class = FeatureEditingControler
 *  base_link = `Ext.util.Observable <http://extjs.com/deploy/dev/docs/?class=Ext.util.Observable>`_
 */
Ext.namespace("GeoExt.ux");

// FIXME: add DeleteFeature control when available
/**
 * @include OpenLayers/Control/DrawFeature.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Control/SelectFeature.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Handler/Path.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Polygon.js
 * @include OpenLayers/Handler/RegularPolygon.js
 * @include OpenLayers/Lang.js
 * @include GeoExt/widgets/Action.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/Popup.js
 * @include FeatureEditing/ux/widgets/form/FeaturePanel.js
 * @include FeatureEditing/ux/widgets/plugins/CloseFeatureDialog.js
 * @include FeatureEditing/ux/widgets/plugins/ExportFeature.js
 * @include LayerManager/ux/data/Export.js
 * @include LayerManager/ux/data/Import.js
 */

/** api: constructor
 *  .. class:: FeatureEditingControler(config)
 *
 *      Create a FeatureEditing main controler.
 */
GeoExt.ux.FeatureEditingControler = Ext.extend(Ext.util.Observable, {

    /** api: property[map]
     *  ``OpenLayers.Map``  A configured map object.
     */
    map: null,

    /** api: config[drawControls]
     *  ``Array(OpenLayers.Control.DrawFeature)``
     *  An array of DrawFeature controls automatically created from the current
     *  activeLayer
     */
    drawControls: null,

    /** api: config[lastDrawControl]
     *  ``OpenLayers.Control.DrawFeature``
     *  The last active draw control.
     */
    lastDrawControl: null,

    /** api: config[deleteAllAction]
     *  ``Ext.Action``
     *  The action created to delete all features.
     */
    deleteAllAction: null,

    /** api: config[actions]
     *  ``Array(GeoExt.Action or Ext.Action)``
     *  An array of actions created from various controls or tasks that are to
     *  be added to a toolbar.
     */
    actions: null,

    /** api: config[featureControl]
     *  ``OpenLayers.Control.SelectFeature``
     *  The OpenLayers control responsible of selecting the feature by clicks
     *  on the screen and, optionnaly, edit feature geometry.
     */
    featureControl: null,

    /** api: config[modifyControl]
     *  ``OpenLayers.Control.ModifyFeature``
     *  The OpenLayers control responsible of modifying the feature.
     */
    modifyControl: null,

    /** api: config[layers]
     *  ``Array(OpenLayers.Layer.Vector)``
     *  An array of OpenLayers.Layer.Vector objects
     */
    layers: null,

    /** api: config[activeLayer]
     *  ``OpenLayers.Layer.Vector``  The current layer being edited.
     */
    activeLayer: null,

    /** api: config[featurePanel]
     *  ``GeoExt.ux.form.FeaturePanel``
     *  A reference to the FeaturePanel object created
     */
    featurePanel: null,

    /** api: config[featurePanelClass]
     * ``Class``
     * Name of the class to create an instance with. Defaults to
     * GeoExt.ux.form.FeaturePanel.
     */
    featurePanelClass: null,

    /** api: config[popup]
     *  ``GeoExt.Popup``
     *  A reference to the Popup object created
     */
    popup: null,

    /** private: property[useIcons]
     *  ``Boolean``
     *  If set to true, enables the use of image icons.  Must be combined with
     *  a .css (see in resources/css).
     */
    useIcons: true,

    /** api: config[downloadService]
     *  ``String``  URL used in order to use a server download service. The
     *              attributes "format" and "content" are sent (POST) to this
     *              service.
     */
    /** private: property[downloadService]
     *  ``String``  URL used in order to use a server download service. The
     *              attributes "format" and "content" are sent (POST) to this
     *              service.
     */
    downloadService: null,

    /** private: property[useDefaultAttributes]
     *  ``Boolean``
     *  If set to true, defaultAttributes are set to new features added with
     *  no attributes.
     */
    useDefaultAttributes: true,

    /** api: config[defaultAttributes]
     *  ``Array(String)``
     *  An array of attribute names to used when a blank feature is added
     *  to the map if useDefaultAttributes is set to true.
     */
    defaultAttributes: ['name','description'],

    /** api: config[defaultAttributesValues]
     *  ``Array(String|Number)``
     *  An array of attribute values to used when a blank feature is added
     *  to the map if useDefaultAttributes is set to true. This should match
     *  the defaultAttributes order.
     */
    defaultAttributesValues: [OpenLayers.i18n('no title'),''],

    /** private: property[autoSave]
     *  ``Boolean``
     *  If set to true, automatically saves modifications on specific kind of
     *  events.
     */
    autoSave: true,

    /** private: property[style]
     *  ``Object`` Feature style hash to use when creating a cosmetic layer.
     *   If none is defined, OpenLayers.Feature.Vector.style['default'] is used
     *   instead.
     */
    style: null,

    /** private: property[defaultStyle]
     *  ``Object`` Feature style hash to apply to the default
     *   OpenLayers.Feature.Vector.style['default'] if no style was specified.
     */
    defaultStyle: {
        fillColor: "#ff0000",
        strokeColor: "#ff0000"
    },

    /** api: config[layerOptions]
     *  ``Object``
     *  Options to be passed to the cosmetic OpenLayers.Layer.Vector
     *  constructor.
     */
    layerOptions: {},

    /** api: property[cosmetic]
     *  ``Boolean``
     *  If set to true, a blank OpenLayers.Layer.Vector object will be created
     *  and added to this controler.
     */
    cosmetic: false,

    /** api: config[fadeRatio]
     *  ``Numeric``
     *  The fade ratio to apply when features are not selected.
     */
    fadeRatio: 0.4,

    /** api: config[opacityProperties]
     *  ``Array(String)``
     *  The style properties refering to opacity.
     */
    opacityProperties: [
        "fillOpacity", "hoverFillOpacity",
        "strokeOpacity", "hoverStrokeOpacity"
    ],

    /** api: config[defaultOpacity]
     *  ``Numeric``
     *  Default opacity maximum value
     */
    defaultOpacity: 1,

    /** api: property['import']
     *  ``Boolean``
     *  If set to true, automatically creates and add Import(s) pluggins.
     */
    'import': true,

    /** api: property['export']
     *  ``Boolean``
     *  If set to true, automatically creates and add Export(s) pluggins.
     */
    'export': true,

    /** api: property['rotate']
     *  ``Boolean``
     *  If set to true, automatically creates and add a modifyFeature action
     *  in rotate mode only.
     */
    rotate: false,

    /** api: property[toggleGroup]
     *  ``String``
     *  The name of the group used for the buttons created.  If none is
     *  provided, it's set to this.map.id.
     */
    toggleGroup: null,

    /** api: property[popupOptions]
     *  ``Object``
     *  The options hash used when creating GeoExt.Popup objects.
     */
    popupOptions: {},

    /** api: property[selectControlOptions]
     *  ``Object``
     *  The options hash used when creating OpenLayers.Control.ModifyFeature
     */
    selectControlOptions: {},

    /** api: property[styler]
     *  ``Styler``
     *  The styler type to use in the FeaturePanel widget.
     */
    styler: null,

    /** private: method[constructor]
     *  Private constructor override.
     */
    constructor: function(config) {
        Ext.apply(this, config);

        this.addEvents([
            /** api: events[activelayerchanged]
             *  Triggered when the active layer is changed
             *
             *  Listener arguments:
             */
            "activelayerchanged"
        ]);

        this.drawControls = [];
        this.actions = [];
        this.layers = [];

        this.initMap();

        // Manage layers manually created
        if(config['layers'] != null) {
            this.addLayers(config['layers']);
            delete config['layers'];
        }

        // if set, automatically creates a "cosmetic" layer
        if(this.cosmetic === true) {
            var style = this.style || OpenLayers.Util.applyDefaults(
                this.defaultStyle, OpenLayers.Feature.Vector.style["default"]);
            var styleMap = new OpenLayers.StyleMap(style);
            var layerOptions = OpenLayers.Util.applyDefaults(
                this.layerOptions, {
                  styleMap: styleMap,
                  displayInLayerSwitcher: false
            });
            layer = new OpenLayers.Layer.Vector("Cosmetic", layerOptions);
            this.addLayers([layer]);
        }

        if(this.layers.length > 0) {
            this.setActiveLayer(this.layers[0]);
        }

        GeoExt.ux.FeatureEditingControler.superclass.constructor.apply(this, arguments);
    },

    /** private: method[addLayers]
     *  :param layers: ``Array(OpenLayers.Layer.Vector)``
     *  For each layers, add them with the addLayer method.
     */
    addLayers: function(layers) {
        for (var i = 0; i < layers.length; i++) {
            this.addLayer(layers[i]);
        }
    },

    /** private: method[addLayer]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Add layer to the map object, to this layers array and register some
     *  events for feature modification.
     */
    addLayer: function(layer) {
        if (!layer.map) {
            this.map.addLayer(layer);
        }
        this.layers.push(layer);

        layer.events.on({
            "beforefeatureselected": this.onBeforeFeatureSelect,
            "featureunselected": this.onFeatureUnselect,
            "featureselected": this.onFeatureSelect,
            "beforefeaturemodified": this.onModificationStart,
            "featuremodified": this.onModification,
            "afterfeaturemodified": this.onModificationEnd,
            "beforefeatureadded": this.onBeforeFeatureAdded,
            scope: this
        });
    },

    /** private: method[setActiveLayer]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Change activeLayer to this layer.
     */
    setActiveLayer: function(layer) {
        this.activeLayer = layer;
        this.fireEvent("activelayerchanged", this, layer);

        // 1st, destroy the old controls/actions

        // 2nd, create new ones from the current active layer
        this.initDrawControls(layer);
        this.initFeatureControl(layer);
        this.initDeleteAllAction();

        // 3rd, create import/export pluggins
        this.initImport();
        this.initExport();
    },

    /** private: method[initMap]
     *  Convenience method to make sure that the map object is correctly set.
     */
    initMap: function() {
        if (this.map instanceof GeoExt.MapPanel) {
            this.map = this.map.map;
        }

        if (!this.map) {
            this.map = GeoExt.MapPanel.guess().map;
        }

        // if no toggleGroup was defined, set to this.map.id
        if (!this.toggleGroup) {
            this.toggleGroup = this.map.id;
        }
    },

    /** private: method[initFeatureControl]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Create a ModifyFeature control linked to the passed layer and
     *  add it to the map.  An GeoExt.Action is also created and pushed to the
     *  actions array.
     */
    initFeatureControl: function(layer) {
        var control, actionOptions;

        var options = OpenLayers.Util.applyDefaults({
            selectFeature: function(feature) {
                var MF = OpenLayers.Control.ModifyFeature;
                this.mode = MF.RESHAPE | MF.DRAG;
                if (feature.attributes.isCircle){
                    this.mode = MF.RESIZE | MF.DRAG;
                }
                if (feature.attributes.isBox){
                    this.mode = MF.RESHAPE | MF.RESIZE & ~MF.RESHAPE | MF.DRAG;
                }
                MF.prototype.selectFeature.apply(this, arguments);
            },
            standalone: true
        }, this.selectControlOptions);
        var modifyControl = new OpenLayers.Control.ModifyFeature(
            layer,
            options
        );
        layer.map.addControls([modifyControl]);
        layer.events.on({
            featureselected: function(obj) {
                modifyControl.selectFeature(obj.feature);
            },
            featureunselected: function(obj) {
                modifyControl.unselectFeature(obj.feature);
            }
        });

        control = new OpenLayers.Control.SelectFeature(layer);

        control.events.on({
            activate: function() {
                modifyControl.activate();
            },
            deactivate: function() {
                modifyControl.deactivate();
            }
        });

        this.featureControl = control;
        this.modifyControl = modifyControl;

        actionOptions = {
            control: control,
            map: this.map,
            // button options
            toggleGroup: this.toggleGroup,
            allowDepress: false,
            pressed: false,
            tooltip: OpenLayers.i18n("Edit Feature"),
            // check item options
            group: this.toggleGroup,
            checked: false
        };

        if (this.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-editfeature";
        } else {
            actionOptions.text = OpenLayers.i18n("Edit Feature");
        }

        var action = new GeoExt.Action(actionOptions);

        this.actions.push(action);

        if (this.rotate) {
            var rotateControl = new OpenLayers.Control.ModifyFeature(layer, {
                mode: OpenLayers.Control.ModifyFeature.ROTATE
            });
            var rotateActionOptions = {
                control: rotateControl,
                map: this.map,
                toggleGroup: this.toggleGroup,
                allowDepress: false,
                pressed: false,
                tooltip: OpenLayers.i18n('Rotate Feature'),
                group: this.toggleGroup,
                checked: false
            };
            if (this.useIcons === true) {
                rotateActionOptions.iconCls = "gx-featureediting-rotatefeature";
            } else {
                rotateActionOptions.text = OpenLayers.i18n("Rotate Feature");
            }
            this.actions.push(new GeoExt.Action(rotateActionOptions));
        }
    },

    /** private: method[destroyFeatureControl]
     *  Destroy the current featureControl and all related objects.
     */
    destroyFeatureControl: function() {
    },

    /** private: method[initDrawControls]
     *  :param layer: ``OpenLayers.Layer.Vector``
     *  Create DrawFeature controls linked to the passed layer and
     *  depending on its geometryType property and add them to the map.
     *  GeoExt.Action are also created and pushed to the actions array.
     */
    initDrawControls: function(layer) {
        var control, handler, geometryTypes, geometryType,
                options, action, iconCls, actionOptions, tooltip;

        geometryTypes = [];

        if (OpenLayers.i18n(layer.geometryType)) {
            geometryTypes.push(OpenLayers.i18n(layer.geometryType));
        } else {
            geometryTypes.push(OpenLayers.i18n("Point"));
            geometryTypes.push(OpenLayers.i18n("Circle"));
            geometryTypes.push(OpenLayers.i18n("LineString"));
            geometryTypes.push(OpenLayers.i18n("Polygon"));
            geometryTypes.push(OpenLayers.i18n("Box"));
            geometryTypes.push(OpenLayers.i18n("Label"));
        }

        for (var i = 0; i < geometryTypes.length; i++) {
            options = {
                drawingLayer: layer,
                layerSegmentsOptions: null,
                accuracy: 3,
                handlerOptions: {
                    stopDown: true,
                    stopUp: true
                }
            };
            geometryType = geometryTypes[i];

            switch (geometryType) {
                case OpenLayers.i18n("LineString"):
                case OpenLayers.i18n("MultiLineString"):
                    handler = OpenLayers.Handler.Path;
                    iconCls = "gx-featureediting-draw-line";
                    tooltip = OpenLayers.i18n("Create line");
                    idControl = 'linestring';
                    break;
                case OpenLayers.i18n("Point"):
                case OpenLayers.i18n("MultiPoint"):
                    handler = OpenLayers.Handler.Point;
                    iconCls = "gx-featureediting-draw-point";
                    tooltip = OpenLayers.i18n("Create point");
                    idControl = 'point';
                    break;
                case OpenLayers.i18n("Circle"):
                    handler = OpenLayers.Handler.RegularPolygon;
                    options.handlerOptions.sides = 32;
                    options.handlerOptions.irregular = false;
                    iconCls = "gx-featureediting-draw-circle";
                    tooltip = OpenLayers.i18n("Create circle");
                    idControl = 'circle';
                    break;
                case OpenLayers.i18n("Polygon"):
                case OpenLayers.i18n("MultiPolygon"):
                    handler = OpenLayers.Handler.Polygon;
                    iconCls = "gx-featureediting-draw-polygon";
                    tooltip = OpenLayers.i18n("Create polygon");
                    idControl = 'polygon';
                    break;
                case OpenLayers.i18n("Box"):
                    handler = OpenLayers.Handler.RegularPolygon;
                    options.handlerOptions.sides = 4;
                    options.handlerOptions.irregular = true;
                    iconCls = "gx-featureediting-draw-box";
                    tooltip = OpenLayers.i18n("Create box");
                    idControl = 'polygon';
                    break;
                case OpenLayers.i18n("Label"):
                    handler = OpenLayers.Handler.Point;
                    iconCls = "gx-featureediting-draw-label";
                    tooltip = OpenLayers.i18n("Create label");
                    idControl = 'label';
                    break;
            }

            control = new OpenLayers.Control.DynamicMeasure(
                    handler, options);
            control.idControl = idControl;

            this.drawControls.push(control);

            if (geometryType == OpenLayers.i18n("Label")) {
                control.events.on({
                    "featureadded": this.onLabelAdded,
                    scope: this
                });
            }

            if (geometryType == OpenLayers.i18n("Circle")) {
                control.events.on({
                    "featureadded": this.onCircleAdded,
                    scope: this
                });
            }

            if (geometryType == OpenLayers.i18n("Box")) {
                control.events.on({
                    "featureadded": this.onBoxAdded,
                    scope: this
                });
            }

            control.events.on({
                "featureadded": this.onFeatureAdded,
                scope: this
            });

            actionOptions = {
                control: control,
                map: this.map,
                // button options
                toggleGroup: this.toggleGroup,
                allowDepress: false,
                pressed: false,
                tooltip: tooltip,
                // check item options
                group: this.toggleGroup,
                checked: false
            };

            // use icons or text for the display
            if (this.useIcons === true) {
                actionOptions.iconCls = iconCls;
            } else {
                actionOptions.text = geometryType;
            }

            action = new GeoExt.Action(actionOptions);

            this.actions.push(action);
        }
    },

    /** private: method[destroyDrawControls]
     *  Destroy all drawControls and all their related objects.
     */
    destroyDrawControls: function() {
        for (var i = 0; i < this.drawControls.length; i++) {
            this.drawControls[i].destroy();
        }
        this.drawControls = [];
    },

    /** private: method[initDeleteAllAction]
     *  Create a Ext.Action object that is set as the deleteAllAction property
     *  and pushed to te actions array.
     */
    initDeleteAllAction: function() {
        var actionOptions = {
            handler: this.deleteAllFeatures,
            scope: this,
            tooltip: OpenLayers.i18n('Delete all features')
        };

        if (this.useIcons === true) {
            actionOptions.iconCls = "gx-featureediting-delete";
        } else {
            actionOptions.text = OpenLayers.i18n('DeleteAll');
        }

        var action = new Ext.Action(actionOptions);

        this.deleteAllAction = action;
        this.actions.push(action);
    },

    /** private: method[deleteAllFeatures]
     *  Called when the deleteAllAction is triggered (button pressed).
     *  Destroy all features from all layers.
     */
    deleteAllFeatures: function() {
        Ext.MessageBox.confirm(OpenLayers.i18n('Delete All Features'), OpenLayers.i18n('Do you really want to delete all features ?'), function(btn) {
            if (btn == 'yes') {
                if (this.popup) {
                    this.popup.close();
                    this.popup = null;
                }

                for (var i = 0; i < this.layers.length; i++) {
                    this.layers[i].destroyFeatures();
                }
            }
        },
                this);
    },

    initImport: function(layer) {
        if(this['import'] === true) {
            var actionOptions = {
                handler: this.importFeatures,
                scope: this,
                tooltip: OpenLayers.i18n('Import KML')
            };

            if(this.useIcons === true) {
                actionOptions.iconCls = "gx-featureediting-import";
            } else {
                actionOptions.text = OpenLayers.i18n("Import");
            }

            var action = new Ext.Action(actionOptions);
            this.actions.push(action);
        }
    },

    importFeatures: function() {
        GeoExt.ux.data.Import.KMLImport(this.map, this.activeLayer);
    },

    initExport: function() {
        if(this['export'] === true) {
            var actionOptions = {
                handler: this.exportFeatures,
                scope: this,
                tooltip: OpenLayers.i18n('Export KML')
            };

            if(this.useIcons === true) {
                actionOptions.iconCls = "gx-featureediting-export";
            } else {
                actionOptions.text = OpenLayers.i18n("Export");
            }

            var action = new Ext.Action(actionOptions);
            this.actions.push(action);
        }
    },

    exportFeatures: function() {
        GeoExt.ux.data.Export.KMLExport(this.map, this.layers, null, this.downloadService);
    },

    /** private: method[selectFeature]
     *  Convenience method to select a feature depending on current feature
     *  control.
     */
    selectFeature: function(feature) {
        var control;

        switch (this.featureControl.CLASS_NAME) {
            case "OpenLayers.Control.SelectFeature":
                control = this.featureControl;
                break;
            case "OpenLayers.Control.DeleteFeature":
                control = this.featureControl.selectControl;
                break;
        }

        control.select.call(control, feature);
    },

    /** private: method[unselectFeature]
     *  Convenience method to unselect a feature depending on current feature
     *  control.
     */
    unselectFeature: function(feature) {
        var control;

        switch (this.featureControl.CLASS_NAME) {
            case "OpenLayers.Control.SelectFeature":
                control = this.featureControl;
                break;
            case "OpenLayers.Control.DeleteFeature":
                control = this.featureControl.selectControl;
                break;
        }

        control.unselect.call(control, feature);
    },

    /** private: method[getActiveDrawControl]
     *  :return: ``OpenLayers.Control.DrawFeature or false``
     *  Get the current active DrawFeature control.  If none is active, false
     *  is returned.
     */
    getActiveDrawControl: function() {
        var control = false;

        for (var i = 0; i < this.drawControls.length; i++) {
            if (this.drawControls[i].active) {
                control = this.drawControls[i];
                break;
            }
        }

        return control;
    },

    /** private: method[onLabelAdded]
     *  :param event: ``event``
     *  Called when a new label feature is added to the activeLayer.  Set a flag
     *  to let the controler know it's a label.
     */
    onLabelAdded: function(event) {
        var feature = event.feature;
        feature.isLabel = true;
    },

    /** private: method[onCircleAdded]
     *  :param event: ``event``
     *  Called when a new circle feature is added to the activeLayer.  Set a flag
     *  to let the controler know it's a circle.
     */
    onCircleAdded: function(event) {
        var feature = event.feature;
        feature.attributes.isCircle = true;
    },

    /** private: method[onBoxAdded]
     *  :param event: ``event``
     *  Called when a new box feature is added to the activeLayer.  Set a flag
     *  to let the controler know it's a box.
     */
    onBoxAdded: function(event) {
        var feature = event.feature;
        feature.attributes.isBox = true;
    },

    /** private: method[onFeatureAdded]
     *  :param event: ``event``
     *  Called when a new feature is added to the activeLayer.  Change the state
     *  of the feature to INSERT and select it.
     */
    onFeatureAdded: function(event) {
        var feature, drawControl;

        feature = event.feature;
        feature.state = OpenLayers.State.INSERT;

        drawControl = this.getActiveDrawControl();
        if (drawControl) {
            drawControl.deactivate();
            this.lastDrawControl = drawControl;
        }

        this.featureControl.activate();

        this.selectFeature.defer(1, this, [feature]);
    },

    /** private: method[onModificationStart]
     *  :param event: ``event``
     *  Called when a feature is selected.  Display a popup that contains the
     *  FeaturePanel.
     */
    onModificationStart: function(event) {
        var feature = (event.geometry) ? event : event.feature;

        // to keep the state before any modification, useful when hitting the
        // 'cancel' button
        /*
         if(feature.state != OpenLayers.State.INSERT){
         feature.myClone = feature.clone();
         feature.myClone.fid = feature.fid;
         }
         */

        // if the user clicked on an other feature while adding a new one,
        // deactivate the draw control.
        var drawControl = this.getActiveDrawControl();
        if (drawControl) {
            drawControl.deactivate();
            this.featureControl.activate();
        }

        if (!this.featureControl.active) {
            // Then active modifyFeatureControl is rotate only: no popup.
            return;
        }

        var options = {
            autoSave: this.autoSave,
            features: [feature],
            controler: this,
            useIcons: this.useIcons,
            styler: this.styler
        };

        if(this['export'] === true) {
            options['plugins'] = [new GeoExt.ux.ExportFeature(), new GeoExt.ux.CloseFeatureDialog()];
        }

        clazz = this.featurePanelClass || GeoExt.ux.form.FeaturePanel;
        this.featurePanel = new clazz(options);

        // display the popup
        popupOptions = {
            location: feature,
            // the following line is here for compatibility with
            // GeoExt < 1 (before changeset 2343)
            feature: feature,
            controler: this,
            items: [this.featurePanel]
        };
        popupOptions = OpenLayers.Util.applyDefaults(popupOptions,
                                                     this.popupOptions);
        popupOptions = OpenLayers.Util.applyDefaults(popupOptions, {
            title: OpenLayers.i18n('Edit Feature'),
            layout: 'fit',
            width: 280
        });

        var popup = new GeoExt.Popup(popupOptions);
        feature.popup = popup;
        this.popup = popup;
        popup.on({
            close: function(popup) {
                if (OpenLayers.Util.indexOf(this.activeLayer.selectedFeatures, popup.feature) > -1) {
                    this.unselectFeature(popup.feature);
                }
            },
            scope: this
        });
        popup.show();

    },

    /** private: method[onModification]
     *  :param event: ``event``
     */
    onModification: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        //we could execute commits here
    },

    /** private: method[onModificationEnd]
     *  :param event: ``event``
     */
    onModificationEnd: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        // or we could execute commits here also

        if (!feature) {
            return;
        }

        this.triggerAutoSave();

        if (feature.popup) {
            feature.popup.close();
            feature.popup = null;
        }

        this.reactivateDrawControl();
    },

    /** private: method[onBeforeFeatureAdded]
     *  :param event: ``event``
     *  Called when a new feature is added to the layer.
     */
    onBeforeFeatureAdded: function(event) {
        var feature = event.feature;
        this.parseFeatureStyle(feature);
        this.parseFeatureDefaultAttributes(feature);
    },

    /** private: method[parseFeatureStyle]
     */
    parseFeatureStyle: function(feature) {
        var symbolizer = this.activeLayer.styleMap.createSymbolizer(feature);
        feature.style = symbolizer;
    },

    /** private: method[parseFeatureDefaultAttributes]
     *  :param event: ``OpenLayers.Feature.Vector``
     *  Check if the feature has any attributes.  If not, add those defined in
     *  this.defaultAttributes.
     */
    parseFeatureDefaultAttributes: function(feature) {
        var hasAttributes;

        if(this.useDefaultAttributes === true) {
            hasAttributes = false;

            for (var key in feature.attributes) {
                hasAttributes = true;
                break;
            }

            if(!hasAttributes) {
                for(var i=0; i<this.defaultAttributes.length; i++) {
                    feature.attributes[this.defaultAttributes[i]] =
                        this.defaultAttributesValues[i];
                }
            }
        }
    },

    /** private: method[reactivateDrawControl]
     */
    reactivateDrawControl: function() {
        if (this.lastDrawControl && this.activeLayer.selectedFeatures.length === 0) {
            this.featureControl.deactivate();
            this.lastDrawControl.activate();
            this.lastDrawControl = null;
        }
    },

    /** private: method[triggerAutoSave]
     */
    triggerAutoSave: function() {
        if (this.autoSave) {
            this.featurePanel.triggerAutoSave();
        }
    },

    /** private: method[onBeforeFeatureSelect]
     *  :param event: ``event``
     *  Called before a feature is selected
     */
    onBeforeFeatureSelect: function(event) {
        var feature = (event.geometry) ? event : event.feature;

        // if it's the first feature that is selected
        if(feature.layer.selectedFeatures.length === 0) {
            this.applyStyles('faded', {'redraw': true});
        }
    },

    /** private: method[onFeatureUnselect]
     *  :param event: ``event``
     *  Called when a feature is unselected.
     */
    onFeatureUnselect: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        this.applyStyle(feature, 'faded', {'redraw': true});

        // if it's the last feature that is unselected
        if(feature.layer.selectedFeatures.length === 0) {
            this.applyStyles('normal', {'redraw': true});
        }
    },

    /** private: method[onFeatureSelect]
     *  :param event: ``event``
     *  Called when a feature is selected
     */
    onFeatureSelect: function(event) {
        var feature = (event.geometry) ? event : event.feature;
        this.applyStyle(feature, 'normal', {'redraw': true});
    },

    /** private: method[applyStyles]
     *  :param style: ``String`` Mandatory.  Can be "normal" or "faded".
     *  :param options: ``Object`` Object of options.
     *  Apply a specific style to all layers of this controler.  If
     *  'redraw': true was specified in the options, the layer is redrawn after.
     */
    applyStyles: function(style, options) {
        style = style || "normal";
        options = options || {};
        for(var i=0; i<this.layers.length; i++) {
            layer = this.layers[i];
            for(var j=0; j<layer.features.length; j++) {
                feature = layer.features[j];
                // don't apply any style to features coming from the
                // ModifyFeature control
                if(!feature._sketch) {
                    this.applyStyle(feature, style);
                }
            }

            if(options['redraw'] === true) {
                layer.redraw();
            }
        }
    },

    /** private: method[applyStyle]
     *  :param feature: ``OpenLayers.Feature.Vector``
     *  :param style: ``String`` Mandatory.  Can be "normal" or "faded".
     *  :param options: ``Object`` Object of options.
     *  Apply a specific style to a specific feature.  If 'redraw': true was
     *  specified in the options, the layer is redrawn after.
     */
    applyStyle: function(feature, style, options) {
        var fRatio;
        options = options || {};

        switch (style) {
          case "faded":
            fRatio = this.fadeRatio;
            break;
          default:
            fRatio = 1 / this.fadeRatio;
        }

        for(var i=0; i<this.opacityProperties.length; i++) {
            property = this.opacityProperties[i];
            if(feature.style!=null && feature.style[property]) {
                feature.style[property] *= fRatio;
            }
        }

        if(options['redraw'] === true) {
            feature.layer.drawFeature(feature);
        }
    },

    CLASS_NAME: "GeoExt.ux.FeatureEditingControler"
});

/* Copyright 2011-2013 Xavier Mamano, http://github.com/jorix/OL-DynamicMeasure
 * Published under MIT license. */

/**
 * @requires OpenLayers/Control/Measure.js
 * @requires OpenLayers/Rule.js
 * @requires OpenLayers/StyleMap.js
 */

/**
 * Class: OpenLayers.Control.DynamicMeasure
 * Allows for drawing of features for measurements.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Measure>
 */
OpenLayers.Control.DynamicMeasure = OpenLayers.Class(
                                                   OpenLayers.Control.Measure, {

    /**
     * APIProperty: accuracy
     * {Integer} Digits measurement accuracy, default is 5.
     */
    accuracy: 5,

    /**
     * APIProperty: persist
     * {Boolean} Keep the temporary measurement after the
     *     measurement is complete.  The measurement will persist until a new
     *     measurement is started, the control is deactivated, or <cancel> is
     *     called. Default is true.
     */
    persist: true,

    /**
     * APIProperty: styles
     * {Object} Alterations of the default styles of the points lines poligons
     *     and labels text, could use keys: "Point", "Line",
     *     "Polygon", "labelSegments", "labelHeading", "labelLength" and
     *     "labelArea". Default is <OpenLayers.Control.DynamicMeasure.styles>.
     */
    styles: null,

    /**
     * APIProperty: positions
     * {Object} Alterations of the default position of the labels, could use
     *     keys: "labelSegments" & "labelHeading", with values "start" "middle"
     *     and "end" refered of the current segment; and keys: "labelLength" &
     *     "labelArea" with additional values "center" (of the feature) and
     *     "initial" (initial point of the feature) and also mentioned previus
     *     values. Default is
     *     <OpenLayers.Control.DynamicMeasure.positions>.
     */
    positions: null,

    /**
     * APIProperty: maxSegments
     * {Integer|Null} Maximum number of visible segments measures, default is 1.
     *
     * To avoid soiling the track is desirable to reduce the number of visible
     *     segments.
     */
    maxSegments: 1,

    /**
     * APIProperty: maxHeadings
     * {Integer|Null} Maximum number of visible headings measures, default is 1.
     *
     * To avoid soiling the track is desirable to reduce the number of visible
     *     segments.
     */
    maxHeadings: 1,

    /**
     * APIProperty: layerSegmentsOptions
     * {Object} Any optional properties to be set on the
     *     layer of <layerSegments> of the lengths of the segments. If set to
     *     null the layer does not act.
     *
     *     If `styleMap` options is set then the key "labelSegments" of the
     *     `styles` option is ignored.
     */
    layerSegmentsOptions: undefined,

    /**
     * APIProperty: layerHeadingOptions
     * {Object} Any optional properties to be set on the
     *     layer of <layerHeading> of the angle of the segments. If set to
     *     null the layer does not act.  Default is null, set to {} to use a
     *     <layerHeading> to show headings.
     *
     *     If `styleMap` options is set then the key "labelHeading" of the
     *     `styles` option is ignored.
     */
    layerHeadingOptions: null,

    /**
     * APIProperty: layerLengthOptions
     * {Object} Any optional properties to be set on the
     *     layer of <layerLength> of the total length. If set to null the layer
     *     does not act.
     *
     *     If `styleMap` option is set then the key "labelLength" of the
     *     `styles` option is ignored.
     */
    layerLengthOptions: undefined,

    /**
     * APIProperty: layerAreaOptions
     * {Object} Any optional properties to be set on the
     *     layer of <layerArea> of the total area. If set to null the layer does
     *     not act.
     *
     *     If `styleMap` is set then the key "labelArea" of the `styles` option
     *     is ignored.
     */
    layerAreaOptions: undefined,

    /**
     * APIProperty: drawingLayer
     * {<OpenLayers.Layer.Vector>} Drawing layer to store the drawing when
     *     finished.
     */
    drawingLayer: null,

    /**
     * APIProperty: multi
     * {Boolean} Cast features to multi-part geometries before passing to the
     *     drawing layer, only used if declared a <drawingLayer>.
     * Default is false.
     */
    multi: false,

    /**
     * Property: layerSegments
     * {<OpenLayers.Layer.Vector>} The temporary drawing layer to show the
     *     length of the segments.
     */
    layerSegments: null,

    /**
     * Property: layerLength
     * {<OpenLayers.Layer.Vector>} The temporary drawing layer to show total
     *     length.
     */
    layerLength: null,

    /**
     * Property: layerArea
     * {<OpenLayers.Layer.Vector>} The temporary drawing layer to show total
     *     area.
     */
    layerArea: null,

    /**
     * Property: dynamicObj
     * {Object} Internal use.
     */
    dynamicObj: null,

    /**
     * Property: isArea
     * {Boolean} Internal use.
     */
    isArea: null,

    /**
     * Constructor: OpenLayers.Control.Measure
     *
     * Parameters:
     * handler - {<OpenLayers.Handler>}
     * options - {Object}
     *
     * Valid options:
     * accuracy - {Integer} Digits measurement accuracy, default is 5.
     * styles - {Object} Alterations of the default styles of the points lines
     *     poligons and labels text, could use keys: "Point",
     *     "Line", "Polygon", "labelSegments", "labelLength", "labelArea".
     * positions - {Object} Alterations of the default position of the labels.
     * handlerOptions - {Object} Used to set non-default properties on the
     *     control's handler. If `layerOptions["styleMap"]` is set then the
     *     keys: "Point", "Line" and "Polygon" of the `styles` option
     *     are ignored.
     * layerSegmentsOptions - {Object} Any optional properties to be set on the
     *     layer of <layerSegments> of the lengths of the segments. If
     *     `styleMap` is set then the key "labelSegments" of the `styles` option
     *     is ignored. If set to null the layer does not act.
     * layerLengthOptions - {Object} Any optional properties to be set on the
     *     layer of <layerLength> of the total length. If
     *     `styleMap` is set then the key "labelLength" of the `styles` option
     *     is ignored. If set to null the layer does not act.
     * layerAreaOptions - {Object} Any optional properties to be set on the
     *     layer of <layerArea> of the total area. If
     *     `styleMap` is set then the key "labelArea" of the `styles` option
     *     is ignored. If set to null the layer does not act.
     * layerHeadingOptions - {Object} Any optional properties to be set on the
     *     layer of <layerHeading> of the angle of the segments. If
     *     `styleMap` is set then the key "labelHeading" of the `styles` option
     *     is ignored. If set to null the layer does not act.
     * drawingLayer - {<OpenLayers.Layer.Vector>} Optional drawing layer to
     *     store the drawing when finished.
     * multi - {Boolean} Cast features to multi-part geometries before passing
     *     to the drawing layer
     */
    initialize: function(handler, options) {

        // Manage options
        options = options || {};

        // handlerOptions: persist & multi
        options.handlerOptions = OpenLayers.Util.extend(
            {persist: !options.drawingLayer}, options.handlerOptions
        );
        if (options.drawingLayer && !('multi' in options.handlerOptions)) {
            options.handlerOptions.multi = options.multi;
        }

        // * styles option
        if (options.drawingLayer) {
            var sketchStyle = options.drawingLayer.styleMap &&
                                 options.drawingLayer.styleMap.styles.temporary;
            if (sketchStyle) {
                options.handlerOptions
                                  .layerOptions = OpenLayers.Util.applyDefaults(
                    options.handlerOptions.layerOptions, {
                        styleMap: new OpenLayers.StyleMap({
                            'default': sketchStyle
                        })
                    }
                );
            }
        }
        var optionsStyles = options.styles || {};
        options.styles = optionsStyles;
        var defaultStyles = OpenLayers.Control.DynamicMeasure.styles;
        // * * styles for handler layer.
        if (!options.handlerOptions.layerOptions ||
            !options.handlerOptions.layerOptions.styleMap) {
            // use the style option for layerOptions of the handler.
            var style = new OpenLayers.Style(null, {rules: [
                new OpenLayers.Rule({symbolizer: {
                    'Point': OpenLayers.Util.applyDefaults(
                                optionsStyles.Point, defaultStyles.Point),
                    'Line': OpenLayers.Util.applyDefaults(
                                optionsStyles.Line, defaultStyles.Line),
                    'Polygon': OpenLayers.Util.applyDefaults(
                                optionsStyles.Polygon, defaultStyles.Polygon)
                }})
            ]});
            options.handlerOptions = options.handlerOptions || {};
            options.handlerOptions.layerOptions =
                                      options.handlerOptions.layerOptions || {};
            options.handlerOptions.layerOptions.styleMap =
                                    new OpenLayers.StyleMap({'default': style});
        }

        // * positions option
        options.positions = OpenLayers.Util.applyDefaults(
            options.positions,
            OpenLayers.Control.DynamicMeasure.positions
        );

        // force some handler options
        options.callbacks = options.callbacks || {};
        if (options.drawingLayer) {
            OpenLayers.Util.applyDefaults(options.callbacks, {
                create: function(vertex, feature) {
                    this.callbackCreate(vertex, feature);
                    this.drawingLayer.events.triggerEvent(
                        'sketchstarted', {vertex: vertex, feature: feature}
                    );
                },
                modify: function(vertex, feature) {
                    this.callbackModify(vertex, feature);
                    this.drawingLayer.events.triggerEvent(
                        'sketchmodified', {vertex: vertex, feature: feature}
                    );
                },
                done: function(geometry) {
                    this.callbackDone(geometry);
                    this.drawFeature(geometry);
                }
            });
        }
        OpenLayers.Util.applyDefaults(options.callbacks, {
            create: this.callbackCreate,
            point: this.callbackPoint,
            cancel: this.callbackCancel,
            done: this.callbackDone,
            modify: this.callbackModify,
            redo: this.callbackRedo,
            undo: this.callbackUndo
        });

        // do a trick with the handler to avoid blue background in freehand.
        var _self = this;
        var oldOnselectstart = document.onselectstart ?
                              document.onselectstart : OpenLayers.Function.True;
        var handlerTuned = OpenLayers.Class(handler, {
            down: function(evt) {
                document.onselectstart = OpenLayers.Function.False;
                return handler.prototype.down.apply(this, arguments);
            },
            up: function(evt) {
                document.onselectstart = oldOnselectstart;
                return handler.prototype.up.apply(this, arguments);
            },
            move: function(evt) {
                if (!this.mouseDown) {
                    document.onselectstart = oldOnselectstart;
                }
                return handler.prototype.move.apply(this, arguments);
            },
            mouseout: function(evt) {
                if (OpenLayers.Util.mouseLeft(evt, this.map.viewPortDiv)) {
                    if (this.mouseDown) {
                        document.onselectstart = oldOnselectstart;
                    }
                }
                return handler.prototype.mouseout.apply(this, arguments);
            },
            finalize: function() {
                document.onselectstart = oldOnselectstart;
                handler.prototype.finalize.apply(this, arguments);
            }
        }, {
            undo: function() {
                var undone = handler.prototype.undo.call(this);
                if (undone) {
                    this.callback('undo',
                                 [this.point.geometry, this.getSketch(), true]);
                }
                return undone;
            },
            redo: function() {
                var redone = handler.prototype.redo.call(this);
                if (redone) {
                    this.callback('redo',
                                 [this.point.geometry, this.getSketch(), true]);
                }
                return redone;
            }
        });
        // ... and call the constructor
        OpenLayers.Control.Measure.prototype.initialize.call(
                                                   this, handlerTuned, options);

        this.isArea = handler.prototype.polygon !== undefined; // duck typing
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.Measure.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: draw
     * This control does not have HTML component, so this method should
     *     be empty.
     */
    draw: function() {},

    /**
     * APIMethod: activate
     */
    activate: function() {
        var response = OpenLayers.Control.Measure.prototype.activate.apply(
                                                               this, arguments);
        if (response) {
            // Create dynamicObj
            this.dynamicObj = {};
            // Create layers
            var _optionsStyles = this.styles || {},
                _defaultStyles = OpenLayers.Control.DynamicMeasure.styles,
                _self = this;
            var _create = function(styleName, initialOptions) {
                if (initialOptions === null) {
                    return null;
                }
                var options = OpenLayers.Util.extend({
                    displayInLayerSwitcher: false,
                    calculateInRange: OpenLayers.Function.True
                    // ?? ,wrapDateLine: this.citeCompliant
                }, initialOptions);
                if (!options.styleMap) {
                    var style = _optionsStyles[styleName];

                    options.styleMap = new OpenLayers.StyleMap({
                        'default': OpenLayers.Util.applyDefaults(style,
                                                      _defaultStyles[styleName])
                    });
                }
                var layer = new OpenLayers.Layer.Vector(
                                   _self.CLASS_NAME + ' ' + styleName, options);
                _self.map.addLayer(layer);
                return layer;
            };
            this.layerSegments =
                            _create('labelSegments', this.layerSegmentsOptions);
            this.layerHeading =
                            _create('labelHeading', this.layerHeadingOptions);
            this.layerLength = _create('labelLength', this.layerLengthOptions);
            if (this.isArea) {
                this.layerArea = _create('labelArea', this.layerAreaOptions);
            }
        }
        return response;
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        var response = OpenLayers.Control.Measure.prototype.deactivate.apply(
                                                               this, arguments);
        if (response) {
            this.layerSegments && this.layerSegments.destroy();
            this.layerLength && this.layerLength.destroy();
            this.layerHeading && this.layerHeading.destroy();
            this.layerArea && this.layerArea.destroy();
            this.dynamicObj = null;
            this.layerSegments = null;
            this.layerLength = null;
            this.layerHeading = null;
            this.layerArea = null;
        }
        return response;
    },

    /**
     * APIMethod: setImmediate
     * Sets the <immediate> property. Changes the activity of immediate
     * measurement.
     */
    setImmediate: function(immediate) {
        this.immediate = immediate;
    },

    /**
     * Method: callbackCreate
     */
    callbackCreate: function() {
        var dynamicObj = this.dynamicObj;
        dynamicObj.drawing = false;
        dynamicObj.freehand = false;
        dynamicObj.fromIndex = 0;
        dynamicObj.countSegments = 0;
    },

    /**
     * Method: callbackCancel
     */
    callbackCancel: function() {
        this.destroyLabels();
    },

    /**
     * Method: callbackDone
     * Called when the measurement sketch is done.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry>}
     */
    callbackDone: function(geometry) {
        this.measureComplete(geometry);
        if (!this.persist) {
            this.destroyLabels();
        }
    },

    /**
     * Method: drawFeature
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry);
        var proceed = this.drawingLayer.events.triggerEvent(
            'sketchcomplete', {feature: feature}
        );
        if (proceed !== false) {
            feature.state = OpenLayers.State.INSERT;
            this.drawingLayer.addFeatures([feature]);
            this.featureAdded && this.featureAdded(feature);// for compatibility
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    /**
     * Method: callbackCancel
     */
    destroyLabels: function() {
        this.layerSegments && this.layerSegments.destroyFeatures(
                                                          null, {silent: true});
        this.layerLength && this.layerLength.destroyFeatures(
                                                          null, {silent: true});
        this.layerHeading && this.layerHeading.destroyFeatures(
                                                          null, {silent: true});
        this.layerArea && this.layerArea.destroyFeatures(null, {silent: true});
    },

    /**
     * Method: callbackPoint
     */
    callbackPoint: function(point, geometry) {
        var dynamicObj = this.dynamicObj;
        if (!dynamicObj.drawing) {
            this.destroyLabels();
        }
        if (!this.handler.freehandMode(this.handler.evt)) {
            dynamicObj.fromIndex = this.handler.getCurrentPointIndex() - 1;
            dynamicObj.freehand = false;
            dynamicObj.countSegments++;
        } else if (!dynamicObj.freehand) {
            // freehand has started
            dynamicObj.fromIndex = this.handler.getCurrentPointIndex() - 1;
            dynamicObj.freehand = true;
            dynamicObj.countSegments++;
        }

        this.measurePartial(point, geometry);
        dynamicObj.drawing = true;
    },

    /**
     * Method: callbackUndo
     */
    callbackUndo: function(point, feature) {
        var _self = this,
            undoLabel = function(layer) {
                if (layer) {
                    var features = layer.features,
                        lastSegmentIndex = features.length - 1,
                        lastSegment = features[lastSegmentIndex],
                        lastSegmentFromIndex = lastSegment.attributes.from,
                        lastPointIndex = _self.handler.getCurrentPointIndex();
                    if (lastSegmentFromIndex >= lastPointIndex) {
                        var dynamicObj = _self.dynamicObj;
                        layer.destroyFeatures(lastSegment);
                        lastSegment = features[lastSegmentIndex - 1];
                        dynamicObj.fromIndex = lastSegment.attributes.from;
                        dynamicObj.countSegments = features.length;
                    }
                }
            };
        undoLabel(this.layerSegments);
        undoLabel(this.layerHeading);
        this.callbackModify(point, feature, true);
    },

    /**
     * Method: callbackRedo
     */
    callbackRedo: function(point, feature) {
        var line = this.handler.line.geometry,
            currIndex = this.handler.getCurrentPointIndex();
        var dynamicObj = this.dynamicObj;
        this.showLabelSegment(
            dynamicObj.countSegments,
            dynamicObj.fromIndex,
            line.components.slice(dynamicObj.fromIndex, currIndex)
        );
        dynamicObj.fromIndex = this.handler.getCurrentPointIndex() - 1;
        dynamicObj.countSegments++;
        this.callbackModify(point, feature, true);
    },

    /**
     * Method: callbackModify
     */
    callbackModify: function(point, feature, drawing) {
        if (this.immediate) {
            this.measureImmediate(point, feature, drawing);
        }

        var dynamicObj = this.dynamicObj;
        if (dynamicObj.drawing === false) {
           return;
        }

        var line = this.handler.line.geometry,
            currIndex = this.handler.getCurrentPointIndex();
        if (!this.handler.freehandMode(this.handler.evt) &&
                                                          dynamicObj.freehand) {
            // freehand has stopped
            dynamicObj.fromIndex = currIndex - 1;
            dynamicObj.freehand = false;
            dynamicObj.countSegments++;
        }

        // total measure
        var totalLength = this.getBestLength(line);
        if (!totalLength[0]) {
           return;
        }
        var positions = this.positions,
            positionGet = {
            center: function() {
                var center = feature.geometry.getBounds().clone();
                center.extend(point);
                center = center.getCenterLonLat();
                return [center.lon, center.lat];
            },
            initial: function() {
                var initial = line.components[0];
                return [initial.x, initial.y];
            },
            start: function() {
                var start = line.components[dynamicObj.fromIndex];
                return [start.x, start.y];
            },
            middle: function() {
                var start = line.components[dynamicObj.fromIndex];
                return [(start.x + point.x) / 2, (start.y + point.y) / 2];
            },
            end: function() {
                return [point.x, point.y];
            }
        };
        if (this.layerLength) {
            this.showLabel(
                        this.layerLength, 1, 0, totalLength,
                        positionGet[positions['labelLength']](), 1);
        }
        if (this.isArea) {
            if (this.layerArea) {
                this.showLabel(this.layerArea, 1, 0,
                     this.getBestArea(feature.geometry),
                     positionGet[positions['labelArea']](), 1);
            }
            if (this.showLabelSegment(
                      1, 0, [line.components[0], line.components[currIndex]])) {
                dynamicObj.countSegments++;
            }
        }
        this.showLabelSegment(
            dynamicObj.countSegments,
            dynamicObj.fromIndex,
            line.components.slice(dynamicObj.fromIndex, currIndex + 1)
        );
    },

    /**
     * Function: showLabelSegment
     *
     * Parameters:
     * labelsNumber- {Integer} Number of the labels to be on the label layer.
     * fromIndex - {Integer} Index of the last point on the measured feature.
     * points - Array({<OpenLayers.Geometry.Point>})
     *
     * Returns:
     * {Boolean}
     */
    showLabelSegment: function(labelsNumber, fromIndex, _points) {
        var layerSegments = this.layerSegments,
            layerHeading = this.layerHeading;
        if (!layerSegments && !layerHeading) {
            return false;
        }
        // clone points
        var points = [],
            pointsLen = _points.length;
        for (var i = 0; i < pointsLen; i++) {
            points.push(_points[i].clone());
        }
        var from = points[0],
            to = points[pointsLen - 1],
            segmentLength =
                 this.getBestLength(new OpenLayers.Geometry.LineString(points)),
            positions = this.positions,
            positionGet = {
                start: function() {
                    return [from.x, from.y];
                },
                middle: function() {
                    return [(from.x + to.x) / 2, (from.y + to.y) / 2];
                },
                end: function() {
                    return [to.x, to.y];
                }
            },
            created = false;
        if (layerSegments) {
            created = this.showLabel(layerSegments, labelsNumber, fromIndex,
                            segmentLength,
                            positionGet[positions['labelSegments']](),
                            this.maxSegments);
        }
        if (layerHeading && segmentLength[0] > 0) {
            var heading = Math.atan2(to.y - from.y, to.x - from.x),
                bearing = 90 - heading * 180 / Math.PI;
            if (bearing < 0) {
                bearing += 360;
            }
            created = created || this.showLabel(layerHeading,
                            labelsNumber, fromIndex,
                            [bearing, '°'],
                            positionGet[positions['labelHeading']](),
                            this.maxHeadings);
        }
        return created;
    },

    /**
     * Function: showLabel
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Layer of the labels.
     * labelsNumber- {Integer} Number of the labels to be on the label layer.
     * fromIndex - {Integer} Index of the last point on the measured feature.
     * measure - Array({Float|String}) Measure provided by OL Measure control.
     * points - Array({Fload}) Array of x and y of the point to draw the label.
     * maxSegments - {Integer|Null} Maximum number of visible segments measures
     *
     * Returns:
     * {Boolean}
     */
    showLabel: function(
                     layer, labelsNumber, fromIndex, measure, xy, maxSegments) {
        var featureLabel, featureAux,
            features = layer.features;
        if (features.length < labelsNumber) {
        // add a label
            if (measure[0] === 0) {
                return false;
            }
            featureLabel = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(xy[0], xy[1]),
                {from: fromIndex}
            );
            this.setMesureAttributes(featureLabel.attributes, measure);
            layer.addFeatures([featureLabel]);
            if (maxSegments !== null) {
                var hide = (features.length - maxSegments) - 1;
                if (hide >= 0) {
                    featureAux = features[hide];
                    featureAux.style = {display: 'none'};
                    layer.drawFeature(featureAux);
                }
            }
            return true;
        } else {
        // update a label
            featureLabel = features[labelsNumber - 1];
            var geometry = featureLabel.geometry;
            geometry.x = xy[0];
            geometry.y = xy[1];
            geometry.clearBounds();
            this.setMesureAttributes(featureLabel.attributes, measure);
            layer.drawFeature(featureLabel);
            if (maxSegments !== null) {
                var show = (features.length - maxSegments);
                if (show >= 0) {
                    featureAux = features[show];
                    if (featureAux.style) {
                        delete featureAux.style;
                        layer.drawFeature(featureAux);
                    }
                }
            }
            return false;
        }
    },

    /**
     * Method: setMesureAttributes
     * Format measure[0] with digits of <accuracy>. Could internationalize the
     *     format customizing <OpenLayers.Number.thousandsSeparator> and
     *     <OpenLayers.Number.decimalSeparator>
     *
     * Parameters:
     * attributes - {object} Target attributes.
     * measure - Array({*})
     */
    setMesureAttributes: function(attributes, measure) {
        attributes.measure = OpenLayers.Number.format(
                           Number(measure[0].toPrecision(this.accuracy)), null);
        attributes.units = measure[1];
    },

    CLASS_NAME: 'OpenLayers.Control.DynamicMeasure'
});

/**
 * Constant: OpenLayers.Control.DynamicMeasure.styles
 * Contains the keys: "Point", "Line", "Polygon",
 *     "labelSegments", "labelHeading", "labelLength" and
 *     "labelArea" as a objects with style keys.
 */
OpenLayers.Control.DynamicMeasure.styles = {
    'Point': {
        pointRadius: 4,
        graphicName: 'square',
        fillColor: 'white',
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: '#333333'
    },
    'Line': {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: '#666666',
        strokeDashstyle: 'dash'
    },
    'Polygon': {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: '#666666',
        strokeDashstyle: 'solid',
        fillColor: 'white',
        fillOpacity: 0.3
    },
    labelSegments: {
        label: '${measure} ${units}',
        fontSize: '11px',
        fontColor: '#800517',
        fontFamily: 'Verdana',
        labelOutlineColor: '#dddddd',
        labelAlign: 'cm',
        labelOutlineWidth: 2
    },
    labelLength: {
        label: '${measure} ${units}\n',
        fontSize: '11px',
        fontWeight: 'bold',
        fontColor: '#800517',
        fontFamily: 'Verdana',
        labelOutlineColor: '#dddddd',
        labelAlign: 'lb',
        labelOutlineWidth: 3
    },
    labelArea: {
        label: '${measure}\n${units}²\n',
        fontSize: '11px',
        fontWeight: 'bold',
        fontColor: '#800517',
        fontFamily: 'Verdana',
        labelOutlineColor: '#dddddd',
        labelAlign: 'cm',
        labelOutlineWidth: 3
    },
    labelHeading: {
        label: '${measure} ${units}',
        fontSize: '11px',
        fontColor: '#800517',
        fontFamily: 'Verdana',
        labelOutlineColor: '#dddddd',
        labelAlign: 'cm',
        labelOutlineWidth: 3
    }
};

/**
 * Constant: OpenLayers.Control.DynamicMeasure.positions
 * Contains the keys: "labelSegments", "labelHeading",
 *     "labelLength" and "labelArea" as a strings with values 'start',
 *     'middle' and 'end' allowed for all keys (refered of last segment) and
 *     'center' and 'initial' (refered of the measured feature and only allowed
 *     for "labelLength" and "labelArea" keys)
 */
OpenLayers.Control.DynamicMeasure.positions = {
    labelSegments: 'middle',
    labelLength: 'end',
    labelArea: 'center',
    labelHeading: 'start'
};
