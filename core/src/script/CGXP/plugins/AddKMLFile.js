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
 * @include CGXP/widgets/GoogleEarthPanel.js
 * @include Ext/examples/ux/fileuploadfield/FileUploadField.js
 * @include Ext/ux/base64.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = AddKMLFile
 *
 *  This plugin provides an "Add KML File" button that can be used to add a
 *  local KML file to both the 2D map and 3D Google Earth Plugin view (if
 *  present).  As most browsers do not permit Javascript to read local files,
 *  this requires an "echo" service to be running on the server that reflects a
 *  file back to the client.
 *
 *  TODO: Handle failures in the submit process.
 *
 *  TODO: Use the HTML5 File API when available to avoid sending the file to
 *  the server and back.
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: AddKMLFile(config)
 */
cgxp.plugins.AddKMLFile = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_googleearthview */
    ptype: "cgxp_addkmlfile",

    /** api: Echo URL */
    echoUrl: null,

    /** api: button text */
    buttonText: "Add KML File",

    /** api: wait message text */
    waitMsgText: "Loading...",

    /** private: method[addActions]
     */
    addActions: function() {

        var button = new Ext.ux.form.FileUploadField({
            buttonOnly: true,
            buttonText: this.buttonText,
            name: "file",
            listeners: {
                fileselected: Ext.createDelegate(this.onFileselected, this)
            }
        });
        this.form = new Ext.form.FormPanel({
            border: false,
            fileUpload: true,
            hideLabels: true,
            items: button,
            width: "auto"
        });

        return cgxp.plugins.AddKMLFile.superclass.addActions.apply(this, [this.form]);

    },

    onFileselected: function(button, value) {
        this.form.getForm().submit({
            url: this.echoUrl,
            waitMsg: this.waitMsgText,
            success: Ext.util.Functions.createDelegate(function(form, action) {

                var filename = action.result.filename;
                var kmlString = Ext.ux.base64.decode(action.result.data);

                // Add KML file to map
                var map = this.target.mapPanel.map;
                var kmlFormat = new OpenLayers.Format.KML({
                    extractStyles: true,
                    internalProjection: map.getProjectionObject()
                });
                var layer = new OpenLayers.Layer.Vector(filename);
                layer.addFeatures(kmlFormat.read(kmlString));
                map.addLayer(layer);

                // Add KML file to GoogleEarthPanel
                var googleEarthPanel = Ext.getCmp("googleearthpanel");
                if (googleEarthPanel) {
                    var gePlugin = googleEarthPanel.earth;
                    if (gePlugin) {
                        var kmlObject = gePlugin.parseKml(kmlString);
                        gePlugin.getFeatures().appendChild(kmlObject);
                    }
                }

                form.reset();

            }, this)
        });
    }

});

Ext.preg(cgxp.plugins.AddKMLFile.prototype.ptype, cgxp.plugins.AddKMLFile);
