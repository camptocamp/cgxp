/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux");

/*
 * @include GeoExt/data/AttributeStore.js
 * @include GeoExt/widgets/form.js
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = FeatureEditorGrid
 *  base_link = `Ext.grid.EditorGridPanel <http://www.dev.sencha.com/deploy/dev/docs/?class=Ext.grid.EditorGridPanel>`_
 */

/** api: constructor
 *  .. class:: FeatureEditorGrid(config)
 *
 *  A grid including the attributes of a feature and making the feature
 *  editable, using an ``OpenLayers.Control.ModifyFeature``.
 */
GeoExt.ux.FeatureEditorGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    /* begin i18n */
    /** api: config[actionsButtonText] ``String`` i18n */
    actionsButtonText: "Actions",
    /** api: config[actionsButtonTooltip] ``String`` i18n */
    actionsButtonTooltip: "More actions on this feature",

    /** api: config[deleteMsgTitle] ``String`` i18n */
    deleteMsgTitle: "Delete Feature?",
    /** api: config[deleteMsg]
     *  ``String`` i18n for the delete confirmation, no confirmation message
     *  will appear if not provided.
     */
    deleteMsg: "Are you sure you want to delete this feature?",
    /** api: config[deleteButtonText] ``String`` i18n */
    deleteButtonText: "Delete",
    /** api: config[deleteButtonTooltip] ``String`` i18n */
    deleteButtonTooltip: "Delete this feature",
    /** api: config[cancelMsgTitle] ``String`` i18n */
    cancelMsgTitle: "Cancel Editing?",
    /** api: config[cancelMsg]
     *  ``String`` i18n for the cancel confirmation,  no confirmation message
     *  will appear if not provided.
     */
    cancelMsg: "There are unsaved changes. Are you sure you want to cancel?",
    /** api: config[cancelButtonText] ``String`` i18n */
    cancelButtonText: "Cancel",
    /** api: config[cancelButtonTooltip] ``String`` i18n */
    cancelButtonTooltip: "Stop editing, discard changes",
    /** api: config[saveButtonText] ``String`` i18n */
    saveButtonText: "Save",
    /** api: config[saveButtonTooltip] ``String`` i18n */
    saveButtonTooltip: "Save changes",
    /** api: config[nameHeader] ``String`` i18n */
    nameHeader: "Name",
    /** api: config[valueHeader] ``String`` i18n */
    valueHeader: "Value",
    /* end i18n */

    /** api: config[feature]
     *  ``OpenLayers.Feature.Vector`` The feature to edit and display. This
     *  option ignored if a store is provided. Either this option or the
     *  "store" option should be set.
     */

    /** api: config[nameField]
     *  ``String`` The name of the store field associated to the "Name"
     *  column in the grid. Default is "name".
     */
    /** private: property[nameField]
     *  ``String``
     */
    nameField: "name",

    /** api: config[store]
     *  ``Ext.data.Store`` A store of records representing attributes,
     *  typically an :class:`GeoExt.data.AttributeStore` object with
     *  a vector feature set into it. If not provided one will be
     *  created based on the attributes of the provided feature.
     *  So either this option or the "feature" option should be set.
     */
    /** api: property[store]
     *  ``Ext.data.Store`` The attribute store. Read-only.
     */
    store: undefined,

    /** api: config[allowDelete]
     *  ``Boolean`` Set to true to provide a Delete button for deleting the
     *  feature. Default is false.
     */
    allowDelete: false,

    /** api: config[allowSave]
     *  ``Boolean`` Set to true to provide a Save button for saving the
     *  feature. Default is true.
     */
    allowSave: true,

    /** api: config[allowCancel]
     *  ``Boolean`` Set to true to provide a Cancel button for canceling
     *  the editing of feature. Default is true.
     */
    allowCancel: true,

    /** api: config[extraActions]
     * ``Array(Ext.menu.Item)`` List of items to put in the actions menu.
     */
    extraActions: undefined,

    /** api: config[extraColumns]
     *  ``Array`` Extra columns to use in this grid's column model.
     */
    extraColumns: undefined,

    /** private: property[modifyControl]
     *  ``OpenLayers.Control.ModifyFeature`` the control for geometry editing.
     */
    modifyControl: undefined,

    /**
     * public: property[modifyControlOptions]
     * ``Object`` options to be passed to the ModifyFeature control
     */
    modifyControlOptions: null,

    /** private: property[featureInfo]
     *  ``Object`` Where we store the original state (in a broad sense) of
     *   the feature, so we can undo changes if necessary.
     */
    featureInfo: undefined,

    /** private: property[cancelButton]
     *  ``Ext.Button``
     */
    cancelButton: undefined,

    /** private: property[saveButton]
     *  ``Ext.Button``
     */
    saveButton: undefined,

    /** private: property[deleteButton]
     *  ``Ext.Button``
     */
    deleteButton: undefined,

    /** api: property[dirty]
     *  ``Boolean`` This property is used by this grid to track
     *  whether the feature is modified. Read-only.
     */
    dirty: false,

    /** private: property[previous]
     *  ``Object`` Hold the current feature properties to be stashed on next
     *  featuremodified event.
     */
    previous: undefined,

    /** private: property[undoStack]
     *  ``Array`` Feature properties stack for undo functionality.
     */
    undoStack: [],

    // private config overrides
    clicksToEdit: 1,

    /** private: method[initComponent]
     */
    initComponent: function() {
        this.addEvents(

            /** api: events[cancel]
             *  Fires when the user cancels editing by clicking on the
             *  "Cancel" button.
             *
             *  Listener arguments:
             *  * panel - :class:`GeoExt.ux.FeatureEditorGrid` This grid.
             *  * e - ``Object`` An object with two properties: "feature",
             *    referencing the feature being edited, and "modified", a
             *    ``Boolean`` value specifying if the feature has been
             *    modified.
             */
            "cancel",

            /** api: events[done]
             *  Fires when the user finishes the editing either by clicking the
             *  "Save" button or when he clicks "Yes" in the modification
             *  cancel confirm dialog.
             *
             *  Listener arguments:
             *  * panel - :class:`GeoExt.ux.FeatureEditorGrid` This grid.
             *  * e - ``Object`` An object with two properties: "feature",
             *    referencing the feature being edited, and "modified", a
             *    ``Boolean`` value specifying if the feature has been
             *    modified.
             */
            "done"
        );

        // create an attribute store if none is provided
        if (!this.store) {
            var data = [], attributes = this.feature.attributes;
            for (var a in attributes) {
                if (attributes.hasOwnProperty(a)) {
                    data.push({
                        "name": a,
                        "type": typeof attributes[a]
                    });
                }
            }
            this.store = new GeoExt.data.AttributeStore({
                feature: this.feature,
                data: data
            });
        }

        var feature = this.store.feature;

        var items;

        // create bottom bar
        var deleteButtonConfig = {
            text: this.deleteButtonText,
            tooltip: this.deleteButtonTooltip,
            cls: 'x-delete-btn',
            hidden: !this.allowDelete,
            handler: this.deleteHandler,
            disabled: feature.state == OpenLayers.State.INSERT,
            scope: this
        };

        if (this.extraActions) {
            var menu = [new Ext.menu.Item(deleteButtonConfig)];

            var actionsButton = new Ext.Button({
                text: this.actionsButtonText,
                tooltip: this.actionsButtonTooltip,
                menu: menu.concat(this.extraActions)
            });
            items = [actionsButton];
        } else {
            items = [new Ext.Button(deleteButtonConfig)];
        }

        this.cancelButton = new Ext.Button({
            text: this.cancelButtonText,
            tooltip: this.cancelButtonTooltip,
            cls: 'x-cancel-btn',
            hidden: !this.allowCancel,
            handler: this.cancelHandler,
            scope: this
        });
        this.saveButton = new Ext.Button({
            text: this.saveButtonText,
            tooltip: this.saveButtonTooltip,
            cls: 'x-save-btn',
            hidden: !this.allowSave,
            handler: this.saveHandler,
            disabled: feature.state != OpenLayers.State.INSERT,
            scope: this
        });
        this.bbar = new Ext.Toolbar({
            items: items.concat([
                '->',
                this.cancelButton,
                this.saveButton
            ])
        });
        this.dirty = this.isDirty();

        // create column model
        var columns = [
            { header: this.nameHeader, dataIndex: this.nameField },
            new Ext.grid.Column({
                header: this.valueHeader,
                dataIndex: "value",
                editable: true,
                getEditor: this.getEditor.createDelegate(this),
                renderer: function(value, meta, record) {
                    if (Ext.isDate(value)) {
                        // remove ns prefix
                        var type = record.get('type').split(":").pop();
                        if (type == 'date') {
                            return value.format('Y-m-d');
                        }
                        else if (type == 'datetime') {
                            return value.format('c');
                        }
                    }
                    return value;
                }
            })
        ];
        if (this.extraColumns) {
            columns = columns.concat(this.extraColumns);
        }
        this.colModel = new Ext.grid.ColumnModel({
            columns: columns
        });

        // call parent to finish the initialization of the component
        GeoExt.ux.FeatureEditorGrid.superclass.initComponent.call(this);

        // store the initial state of the feature
        this.featureInfo = {
            geometry: feature.geometry.clone(),
            attributes: Ext.apply({}, feature.attributes),
            state: feature.state
        };

        // create modify feature control
        this.modifyControl = new OpenLayers.Control.ModifyFeature(
            feature.layer,
            Ext.apply({standalone: true}, this.modifyControlOptions)
        );
        feature.layer.map.addControl(this.modifyControl);
        this.modifyControl.activate();
        this.modifyControl.selectFeature(feature);

        // register a featuremodified listener on the layer
        feature.layer.events.on({
            featuremodified: this.onFeaturemodified,
            scope: this
        });

        // register an afteredit listener to change the
        // feature state
        this.on({
            "afteredit": function() {
                this.setFeatureState(this.featureInfo.state === OpenLayers.State.INSERT ?
                        OpenLayers.State.INSERT : OpenLayers.State.UPDATE);
                this.saveButton.setDisabled(!this.dirty);
            }
        });
        this.mon(this.selModel, 'beforecellselect', function(sm, rowIndex, colIndex) {
            if (colIndex === 0) {
                this.startEditing.defer(200, this, [rowIndex, 1]);
                return false;
            }
        }, this);

        this.stack(feature);

        var editorgrid = this;
        this.onKeyPress = function(evt) {
            var handled = false;
            switch (evt.keyCode) {
                case 90: // z
                    if (evt.metaKey || evt.ctrlKey) {
                        editorgrid.undo();
                        handled = true;
                    }
                    break;
            }
            if (handled) {
                OpenLayers.Event.stop(evt);
            }
        };
        OpenLayers.Event.observe(document, "keydown", this.onKeyPress);
    },

    /** private: method[isDirty]
     *  :return: ``Boolean`` True if dirty, false otherwise
     *
     *  Get the dirty state from the feature state.
     */
    isDirty: function() {
        return this.store.feature.state !== null;
    },

    /** private: method[onFeaturemodified]
     *  :param e: ``Object`` The event.
     *
     *  Called when a feature is modified in the layer.
     */
    onFeaturemodified: function(e) {
        if(e.feature === this.store.feature) {
            if (e.action == 'undo') {
                // Do nothing
            }
            else {
                if (this.isDirty()) {
                    this.stack(e.feature);
                    this.dirty = this.isDirty();
                }
            }
            this.saveButton.setDisabled(!this.dirty);
        }
    },

    /** private: method[stack]
     *  :param feature: ``OpenLayers.Feature`` The feature state to stack.
     *
     *  Stack feature state and properties for the undo functionality.
     */
    stack: function(feature) {
        if (this.previous !== null) {
            this.undoStack.push(this.previous);
        }
        this.previous = {
            geometry: feature.geometry.clone(),
            attributes: Ext.apply({}, feature.attributes),
            state: feature.state
        };
    },

    /** public: method[undo]
     *  :return: ``Boolean`` True if something have been undone, false otherwise.
     *
     *  Undo the last feature modification.
     */
    undo: function() {
        var previous = this.undoStack.pop();
        if (previous !== undefined) {

            // restore feature
            var feature = this.store.feature;

            var layer = feature.layer;
            // Remove feature from layer before changing its geometry
            // then re-add it later to prevent ghost rendering
            layer.removeFeatures([feature]);
            feature.geometry = previous.geometry.clone();
            feature.attributes = Ext.apply({}, previous.attributes);
            feature.state = previous.state;
            this.dirty = this.isDirty();
            layer.addFeatures([feature]);

            // refresh map
            var modifyControl = this.modifyControl;
            modifyControl.layer.drawFeature(feature, modifyControl.standalone ?
                undefined : 'select');
            modifyControl.resetVertices();

            // refresh grid
            this.store.each(function(record) {
                record.set('value', feature.attributes[record.get("name")]);
            });

            feature.layer.events.triggerEvent("featuremodified", {
                feature: feature,
                action: 'undo'
            });
            this.previous = previous;

            return true;
        }
        return false;
    },

    /** private: method[getEditor]
     *  :param rowIndex: ``Number``
     *  :return: ``Ext.grid.GridEditor``
     *
     *  Return a GridEditor object for a given row in the grid.
     */
    getEditor: function(rowIndex) {
        var record = this.store.getAt(rowIndex),
            config = GeoExt.form.recordToField(record, {
                minTextAreaMaxLength: 45
            });
        var field = (config) ?
            Ext.ComponentMgr.create(config) : new Ext.form.TextField();
        return new Ext.grid.GridEditor(field);
    },

    /** private: method[cancelHandler]
     *  :param e: {Object} Properties defined in this object are set in the
     *  "cancel" event.
     *
     *  Called when the "Cancel" button is clicked.
     */
    cancelHandler: function(e) {

        var _cancel = function() {
            e = Ext.applyIf({
                feature: this.store.feature,
                modified: this.dirty
            }, e);
            if (this.fireEvent("cancel", this, e) !== false) {
                this.cancel();
            }
        }.createDelegate(this);

        if (this.cancelMsg && this.dirty) {
            Ext.Msg.show({
                title: this.cancelMsgTitle,
                msg: this.cancelMsg,
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.QUESTION,
                fn: function(button) {
                    if (button === "yes") {
                        _cancel();
                    }
                }
            });
        } else {
            _cancel();
        }
    },

    /** private: method[cancel]
     *  Undo changes, gets the initial geometry, attributes and
     *  state back in the feature.
     */
    cancel: function() {
        var feature = this.store.feature, layer = feature.layer;

        // a bit of a hack here: we're about to set a new geometry
        // in the feature, and we cannot just do it and redraw the
        // feature as this will cause the renderer to draw two
        // shapes. So we force the renderer to unrender the shape
        // by using display: "none" in the style.

        layer.drawFeature(feature, {display: "none"});

        feature.geometry = this.featureInfo.geometry;
        feature.attributes = this.featureInfo.attributes;
        feature.state = this.featureInfo.state;
        this.dirty = this.isDirty();

        layer.drawFeature(feature);
    },

    /** private: method[deleteHandler]
     *  :param e: {Object} Properties defined in this object are set in the
     *  "done" event.
     *
     *  Called when the "Delete" button is clicked.
     */
    deleteHandler: function(e) {

        var _delete = function() {
            this.setFeatureState(OpenLayers.State.DELETE);
            e = Ext.applyIf({
                feature: this.store.feature,
                modified: this.dirty
            }, e);
            this.fireEvent("done", this, e);
        }.createDelegate(this);

        if (this.deleteMsg) {
            Ext.Msg.show({
                title: this.deleteMsgTitle,
                msg: this.deleteMsg,
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.QUESTION,
                fn: function(button) {
                    if (button === "yes") {
                        _delete();
                    }
                }
            });
        } else {
            _delete();
        }
    },

    /** private: method[saveHandler]
     *  :param e: {Object} Properties defined in this object are set in the
     *  "done" event.
     *
     *  Called when the "Save" button is clicked.
     */
    saveHandler: function(e) {
        e = Ext.applyIf({
            feature: this.store.feature,
            modified: this.dirty
        }, e);
        this.fireEvent("done", this, e);
    },

    /** private: method[setFeatureState]
     *  :param state: ``String`` The new state.
     *
     *  Set the state of the feature and trigger a featuremodified
     *  event on the layer.
     */
    setFeatureState: function(state) {
        var feature = this.store.feature, layer = feature.layer;
        var event = (state != feature.state);
        feature.state = state;
        this.dirty = this.isDirty();
        if(layer && layer.events) {
            if (event) {
                layer.events.triggerEvent("featuremodified", {
                    feature: feature,
                    action: 'setFeatureState'
                });
            }
            layer.drawFeature(feature);
        }
    },

    /** private: method[beforeDestroy]
     *  Private method called during the destroy sequence.
     */
    beforeDestroy: function() {
        OpenLayers.Event.stopObserving(document, "keydown", this.onKeyPress);

        GeoExt.ux.FeatureEditorGrid.superclass.beforeDestroy.apply(
            this, arguments);

        var layer = this.store.feature.layer;
        if (layer && layer.events) {
            layer.events.un({
                featuremodified: this.onFeaturemodified,
                scope: this
            });
        }

        // remove the line below when
        // http://trac.openlayers.org/ticket/2210 is fixed.
        this.modifyControl.deactivate();
        this.modifyControl.destroy();

        if (!this.initialConfig.store) {
            this.store.destroy();
        }
    }
});

/** api: xtype = gxux_featureeditorgrid */
Ext.reg("gxux_featureeditorgrid", GeoExt.ux.FeatureEditorGrid);
