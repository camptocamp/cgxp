/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux");

/*
 * @include GeoExt/data/PrintPage.js
 * @include GeoExt/plugins/PrintExtent.js
 * @include GeoExt/plugins/PrintProviderField.js
 * @include GeoExt/plugins/PrintPageField.js
 */

/** api: (define)
 *  module = GeoExt.form
 *  class = SimplePrint
 *  base_link = `Ext.form.FormPanel <http://dev.sencha.com/deploy/dev/docs/?class=Ext.form.FormPanel>`_
 */

/** api: constructor
 *  .. class:: SimplePrint
 *
 *  An instance of this form creates a single print page. Layout, DPI, scale
 *  and rotation are configurable in the form. A Print button is also added to
 *  the form.
 */
GeoExt.ux.SimplePrint = Ext.extend(Ext.form.FormPanel, {

    /* begin i18n */
    /** api: config[layoutText] ``String`` i18n */
    layoutText: "Layout",
    /** api: config[dpiText] ``String`` i18n */
    dpiText: "DPI",
    /** api: config[scaleText] ``String`` i18n */
    scaleText: "Scale",
    /** api: config[rotationText] ``String`` i18n */
    rotationText: "Rotation",
    /** api: config[printText] ``String`` i18n */
    printText: "Print",
    /** api: config[creatingPdfText] ``String`` i18n */
    creatingPdfText: "Creating PDF...",
    /** api: config[printWaitingStatusText] ``String`` i18n */
    printWaitingStatusText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Your print will start in ' +
        '<tpl if="waitingTimeMin == 0">less than one minute</tpl>' +
        '<tpl if="waitingTimeMin == 1">about 1 minute</tpl>' +
        '<tpl if="waitingTimeMin &gt; 1">about {waitingTimeMin} minutes</tpl></tpl>',
    /** api: config[printRunningStatusText] ``String`` i18n */
    printRunningStatusText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Your print is running...</tpl>',
    /** api: config[downloadPdfText] ``String`` i18n */
    downloadPdfText: "Download",
    /** api: config[statusErrorText] ``String`` i18n */
    statusErrorText: "Error",
    /** api: config[includelegendText] ``String`` i18n */
    includelegendText: "Include legend",
    /** api: config[createPrintJobText] ``String`` i18n */
    createPrintJobText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Creating new print job...</tpl>',
    /* end i18n */

    /** api: config[printProvider]
     *  :class:`GeoExt.data.PrintProvider` The print provider this form
     *  is connected to.
     */

    /** api: config[mapPanel]
     *  :class:`GeoExt.MapPanel` The map panel that this form should be
     *  connected to.
     */

    /** api: config[layer]
     *  ``OpenLayers.Layer`` Layer to render page extents and handles
     *  to. Useful e.g. for setting a StyleMap. Optional, will be auto-created
     *  if not provided.
     */

    /** api: config[printOptions]
     *  ``Object`` Optional options for the printProvider's print command.
     */

    /** api: property[printOptions]
     *  ``Object`` Optional options for the printProvider's print command.
     */
    printOptions: null,

    /** api: config[hideUnique]
     *  ``Boolean`` If set to false, combo boxes for stores with just one value
     *  will be rendered. Default is true.
     */

    /** api: config[hideRotation]
     *  ``Boolean`` If set to true, the Rotation field will not be rendered.
     *  Default is false.
     */

    /** api: config[busyMask]
     *  ``Ext.LoadMask`` A LoadMask to use while the print document is
     *  prepared. Optional, will be auto-created with ``creatingPdfText` if
     *  not provided.
     */

    /** private: config[jobHeight]
     */
    jobHeight: 32,

    /** private: property[busyMask]
     *  ``Ext.LoadMask``
     */
    busyMask: null,

    /** private: property[runningPrintJobs]
     *  ``numbee``
     */
    runningPrintJobs: 0,

    /** api: config[printExtentOptions]
     *  ``Object`` Optional options for the `GeoExt.plugins.Print` plugin.
     */
    printExtentOptions: null,

    /** private: property[printExtent]
     *  :class:`GeoExt.plugins.PrintExtent`
     */
    printExtent: null,

    /** api: config[includeLegend]
     *  ``Boolean`` include the legend in the print.
     */

    /** api: property[includeLegend]
     *  ``Boolean`` include the legend in the print.
     */
    includeLegend: true,

    /** api: config[getLegendPanel]
     *  ``Function`` get the legend panel
     */
    getLegendPanel: function() { },

    /** api: property[printPage]
     *  :class:`GeoExt.data.PrintPage` The print page for this form. Useful
     *  e.g. for rotating handles when used in a style map context. Read-only.
     */
    printPage: null,

    /** api: config[comboOptions]
     *  ``Object`` Optional options for the comboboxes. If not provided, the
     *  following will be used:
     *
     *  .. code-block:: javascript
     *
     *      {
     *          typeAhead: true,
     *          selectOnFocus: true
     *      }
     */
    comboOptions: null,

    /** api: config[fieldsExtraClientConfiguration]
     *
     *  ``Object`` required to configure the fields, e.-g.:
     *
     *  .. code-block:: javascript
     *
     *      fieldsClientConfiguration: {
     *          "Template name": {
     *              "Attribute name": {
     *                  useTextArea: true, // For String type
     *                  fieldAttributes: {
     *                      label: "A value",
     *                      empty: "En empty text",
     *                      ...
     *                  }
     *              },
     *              "debug": {
     *                  ignore: true
     *              },
     *              ...
     *          },
     *          ...
     *      }
     */
    fieldsExtraClientConfiguration: {},

    /** private: attribute[progressPanel]
     *
     *  The panel used to manage job in progress, used with the version 3.
     */
    progressPanel: null,

    /** private: method[initComponent]
     */
    initComponent: function() {

        // This is a workaround for an Ext issue. When the SimplePrint
        // is an accordion's item an error occurs on expand if
        // the fbar is created later, i.e. outside initComponent. So the
        // problem triggers when the capabilities are loaded using
        // XHR. The workaround involves forcing the creation of
        // the fbar as part of initComponent.
        this.fbar = this.fbar || [];
        if (this.printProvider.supportProgress()) {
            this.progressPanel = new Ext.Panel({
                unstyled: true,
                width: "100%",
                layout: "vbox"
            });
        }
        this.printWaitingStatusTemplate = new Ext.XTemplate(this.printWaitingStatusText);
        this.printWaitingStatusTemplate.compile();
        this.printRunningStatusTemplate = new Ext.XTemplate(this.printRunningStatusText);
        this.printRunningStatusTemplate.compile();
        this.createPrintJobTemplate = new Ext.XTemplate(this.createPrintJobText);
        this.createPrintJobTemplate.compile();

        GeoExt.ux.SimplePrint.superclass.initComponent.call(this);

        this.printPage = new GeoExt.data.PrintPage({
            printProvider: this.printProvider
        });

        this.printExtent = new GeoExt.plugins.PrintExtent(Ext.applyIf({
            pages: [this.printPage],
            layer: this.layer
        }, this.printExtentOptions));

        if (!this.printProvider.supportProgress()) {
            if (!this.busyMask) {
                this.busyMask = new Ext.LoadMask(Ext.getBody(), {
                    msg: this.creatingPdfText
                });
            }

            this.printProvider.on({
                "beforeprint": this.busyMask.show,
                scope: this.busyMask
            });
            this.printProvider.on({
                "print": this.busyMask.hide,
                scope: this.busyMask
            });
        }

        this.printProvider.on({
            "layoutchange": this.initForm,
            scope: this,
            single: true
        });

        this.printProvider.on({
            "beforeprint": function(provider, map, pages, options) {
                options.legend = this.includeLegend ? this.getLegendPanel() : null;
            },
            "layoutchange": this.initForm,
            scope: this
        });

        //for accordion
        this.on('expand', this.showExtent, this);
        this.on('collapse', this.hideExtent, this);

        //for tabs
        this.on('activate', this.showExtent, this);
        this.on('deactivate', this.hideExtent, this);

        //for manual enable/disable
        this.on('enable', this.showExtent, this);
        this.on('disable', this.hideExtent, this);

        //for use in an Ext.Window with closeAction close
        this.on('destroy', this.hideExtent, this);
    },

    /** private: method[addAttribute]
     */
    addAttribute: function(attribute, fieldAttributes) {
        fieldAttributes = fieldAttributes || {};
        var item = {
            xtype: "textfield",
            name: attribute.name,
            fieldLabel: attribute.label || OpenLayers.i18n(attribute.name),
            emptyText: attribute.emptyText,
            plugins: new GeoExt.plugins.PrintProviderField({
                printProvider: this.printProvider
            }),
            autoCreate: {tag: "input", type: "text", size: "45", maxLength: "45"}
        };
        switch (attribute.type) {
            case "String":
                if (attribute.useTextArea === true || extraAttributes.useTextArea === true) {
                    Ext.apply(item, {
                        xtype: "textarea",
                        autoCreate: {tag: "textarea", maxLength: "100"}
                    });
                }
                break;
            case "Integer":
                Ext.apply(item, {
                    regex: /[1-9-]*/
                });
                break;
            case "Float":
                Ext.apply(item, {
                    regex: /[1-9-.]*/
                });
                break;
            case "Boolean":
                delete item.autoCreate;
                Ext.apply(item, {
                    xtype: "checkbox",
                    hideLabel: true,
                    boxLabel: attribute.label || OpenLayers.i18n(attribute.name)
                });
                break;
            case "LegendAttributeValue":
                delete item.autoCreate;
                delete item.plugins;
                Ext.apply(item, {
                    xtype: "checkbox",
                    name: "legend",
                    hideLabel: true,
                    fieldLabel: this.includelegendText,
                    boxLabel: this.includelegendText,
                    checked: this.includeLegend,
                    handler: function(cb, checked) {
                        this.includeLegend = checked;
                    },
                    scope: this
                });
                break;
            default:
                if (this.addCustomItem) {
                    this.addCustomItem(item, attribute, extraAttributes, fieldAttributes);
                }
                item = null;
                break;
        }
        if (item) {
            if (fieldAttributes.autoCreate) {
                Ext.apply(item.autoCreate, fieldAttributes.autoCreate);
                delete fieldAttributes.autoCreate;
            }
            Ext.apply(item, fieldAttributes);
            this.add(this.updateItem(item, attribute));
        }
    },

    /** private: method[initForm]
     *  Creates and adds items to the form.
     */
    initForm: function(printProvider, layout) {
        this.removeAll();

        this.mapPanel.initPlugin(this.printExtent);
        var showUnique = this.hideUnique === false;
        var cbOptions = this.comboOptions || {
            typeAhead: true,
            selectOnFocus: true
        };

        if (showUnique || printProvider.layouts.getCount() > 1) {
            this.add(Ext.apply({
                xtype: "combo",
                fieldLabel: this.layoutText,
                store: printProvider.layouts,
                forceSelection: true,
                displayField: "name",
                mode: "local",
                triggerAction: "all",
                plugins: new GeoExt.plugins.PrintProviderField({
                    printProvider: printProvider
                })
            }, cbOptions));
        }

        Ext.each(printProvider.getAttributes(), function(attribute) {
            templateExtraAttributes = this.fieldsExtraClientConfiguration[layout.data.name] || {};
            extraAttributes = templateExtraAttributes[attribute.name] || {};
            if (!extraAttributes.ignore) {
                this.addAttribute(attribute, extraAttributes.fieldAttributes);
            }
        }, this);

        if (showUnique || printProvider.dpis.getCount() > 1) {
            this.add(Ext.apply({
                xtype: "combo",
                fieldLabel: this.dpiText,
                store: printProvider.dpis,
                forceSelection: true,
                displayField: "name",
                mode: "local",
                triggerAction: "all",
                plugins: new GeoExt.plugins.PrintProviderField({
                    printProvider: printProvider
                })
            }, cbOptions));
        }
        if (showUnique || printProvider.scales.getCount() > 1) {
            this.add(Ext.apply({
                xtype: "combo",
                fieldLabel: this.scaleText,
                store: printProvider.scales,
                forceSelection: true,
                displayField: "name",
                mode: "local",
                triggerAction: "all",
                plugins: new GeoExt.plugins.PrintPageField({
                    printPage: this.printPage
                })
            }, cbOptions));
        }
        if (this.hideRotation !== true) {
            this.add(Ext.apply({
                xtype: "numberfield",
                fieldLabel: this.rotationText,
                name: "rotation",
                enableKeyEvents: true,
                plugins: new GeoExt.plugins.PrintPageField({
                    printPage: this.printPage
                })
            }));
        }

        this.addButton({
            text: this.printText,
            handler: this.print,
            scope: this
        });

        if (printProvider.supportProgress()) {
            this.add(this.progressPanel);
        }

        this.doLayout();

        if (this.autoFit === true) {
            this.onMoveend();
            this.mapPanel.map.events.on({
                "moveend": this.onMoveend,
                scope: this
            });
        }
    },

    /** private: method[print]
     *
     *  Do the print.
     */
    print: function() {
        if (this.printProvider.supportProgress()) {
            var self = this;
            var interval = null;
            var updateStatus;
            var statusComponent = new Ext.Panel({
                cls: "x-form-item print-job",
                width: "100%",
                height: this.jobHeight,
                html: this.createPrintJobTemplate.apply({
                    loading_icon: OpenLayers.Util.getImagesLocation() + '../loading.gif'
                }),
                unstyled: true
            });
            this.progressPanel.add(statusComponent);
            this.progressPanel.doLayout();
            this.progressPanel.setHeight(this.jobHeight * this.progressPanel.items.length);
            this.doLayout();
            this.runningPrintJobs++;
            var statusCallback = function(job, succes, currentStatus) {
                if (!succes) {
                    self.runningPrintJobs--;
                    statusComponent.update(self.statusErrorText);
                    statusComponent.el.dom.onclick = function(event) {
                        self.progressPanel.remove(statusComponent);
                        statusComponent.destroy();
                        statusComponent = null;
                        self.progressPanel.doLayout();
                        self.progressPanel.setHeight(self.jobHeight * self.progressPanel.items.length);
                        self.doLayout();
                    };
                    clearInterval(interval);
                    return;
                }
                if (currentStatus.done) {
                    self.runningPrintJobs--;
                    clearInterval(interval);
                    if (currentStatus.status == "error") {
                        statusComponent.update(currentStatus.error.replace(/\n/g, "<br />"));
                        statusComponent.el.dom.onclick = function(event) {
                            self.progressPanel.remove(statusComponent);
                            statusComponent.destroy();
                            statusComponent = null;
                            self.progressPanel.doLayout();
                            self.progressPanel.setHeight(self.jobHeight * self.progressPanel.items.length);
                            self.doLayout();
                        };
                        return;
                    }
                    self.progressPanel.remove(statusComponent);
                    statusComponent.destroy();
                    statusComponent = null;
                    self.progressPanel.doLayout();
                    self.progressPanel.setHeight(self.jobHeight * self.progressPanel.items.length);
                    self.doLayout();

                    self.printProvider.download(
                        self.printProvider.getDownloadURL(job)
                    );
                }
                else {
                    if (interval === null) {
                        interval = setInterval(updateStatus, 1000);
                    }
                    currentStatus.loading_icon = OpenLayers.Util.getImagesLocation() + '../loading.gif';

                    if (currentStatus.status == "error") {
                        statusComponent.update(currentStatus.error.replace(/\n/g, "<br />"));
                        statusComponent.el.dom.onclick = function(event) {
                            self.progressPanel.remove(statusComponent);
                            statusComponent.destroy();
                            statusComponent = null;
                            self.progressPanel.doLayout();
                            self.progressPanel.setHeight(self.jobHeight * self.progressPanel.items.length);
                            self.doLayout();
                        };
                        return;
                    }
                    else if (currentStatus.status == "waiting") {
                        currentStatus.waitingTimeMin = Math.round(currentStatus.waitingTime / 1000 / 60);
                        currentStatus.elapsedTimeMin = Math.round(currentStatus.elapsedTime / 1000 / 60);
                        statusComponent.update(
                            self.printWaitingStatusTemplate.apply(currentStatus)
                        );
                    }
                    else if (currentStatus.status == "running") {
                        currentStatus.elapsedTimeMin = Math.round(currentStatus.elapsedTime / 1000 / 60);
                        statusComponent.update(
                            self.printRunningStatusTemplate.apply(currentStatus)
                        );
                    }
                    else {
                        statusComponent.update(OpenLayers.i18n(currentStatus.status));
                    }
                }
            };
            var printCallback = function(job) {
                updateStatus = function() {
                    self.printProvider.getStatus(job, statusCallback);
                };
                updateStatus();
            };
            this.printExtent.print(this.printOptions, printCallback);
        }
        else {
            this.printExtent.print(this.printOptions);
        }
    },

    /** public: method[updateItem]
     *
     *  Override this method to customise the attributes form items.
     */
    updateItem: function(item, attribute) {
        return item;
    },

    /** public: method[addCustomItem]
     *
     *  Define this method to be able to manage unsupported types.
     *
     *  Arguments: item, attribute, extraAttributes, fieldAttributes
     */

    /** private: method[onMoveend]
     *  Handler for the map's moveend event
     */
    onMoveend: function() {
        this.printPage.fit(this.mapPanel.map, {mode: "screen"});
    },

    /** private: method[beforeDestroy]
     */
    beforeDestroy: function() {
        var printProvider = this.printExtent.printProvider;
        if (!printProvider.supportProgress()) {
            printProvider.un("beforePrint", this.busyMask.show, this.busyMask);
        }
        printProvider.un("print", this.busyMask.hide, this.busyMask);
        if(this.autoFit === true) {
            this.mapPanel.map.events.un({
                "moveend": this.onMoveend,
                scope: this
            });
        }
        GeoExt.ux.SimplePrint.superclass.beforeDestroy.apply(this, arguments);
    },

    /** private: method[showExtent]
     * Handler for the panel's expand/activate/enable event
     */
    showExtent: function() {
        this.printExtent.show();
    },

    /** private: method[hideExtent]
     * Handler for the panel's collapse/deactivate/disable/destroy event
     */
    hideExtent: function() {
        this.printExtent.hide();
    }
});

/** api: xtype = gxux_simpleprint */
Ext.reg("gxux_simpleprint", GeoExt.ux.SimplePrint);
