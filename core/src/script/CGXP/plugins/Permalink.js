/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 * @requires GeoExt/state/PermalinkProvider.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Permalink
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Permalink plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_permalink',
 *              actionTarget: 'center.tbar',
 *              shortenerCreateURL: "${request.route_url('shortener_create', path='')}" 
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Permalink(config)
 *
 *    Provides an action that opens a window containing a permalink
 *    for the application.
 *
 *
 *    Summary of the possible GET parameters:
 *
 *    ``map_x``: 
 *     - Horizontal coordinate (depending on used SRID) as center of the map. 
 *     - Example: &map_x=654321 
 * 
 *    ``map_y``: 
 *     - Vertical coordinate (depending on used SRID) as center of the map. 
 *     - Example: &map_y=123456 
 * 
 *    ``map_zoom``: 
 *     - Zoom level of the map. 
 *     - Example: &mapzoom=5 
 *
 *
 *    List of the others components that use GET parameters (See the corresponding
 *    component to learn more):
 *     - `cgxp.plugins.LayerTree <../plugins/LayerTree.html>`_
 *     - `cgxp.tree.LayerTree <../widgets/tree/LayerTree.html>`_
 *     - `cgxp.MapOpacitySlider <../widgets/MapOpacitySlider.html>`_
 *     - `cgxp.plugins.MapOpacitySlider <../plugins/MapOpacitySlider.html>`_
 *     - `cgxp.MapPanel <../widgets/MapPanel.html>`_
 *     - `cgxp.RedLiningPanel <../widgets/RedLiningPanel.html>`_
 *     - `cgxp.plugins.WFSPermalink <../plugins/WFSPermalink.html>`_
 */

cgxp.plugins.Permalink = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_permalink */
    ptype: "cgxp_permalink",

    /** api: config[actionConfig]
     *  ``Object``
     *  Configuration object for the action created by this plugin.
     */

    /** api: config[permalink]
     *  ``String``
     *  Allow other plugins to access the latest permalink.
     */
    permalink: '',

    /** api: config[email]
     *  ``Boolean``
     *  Display the optional email field, default is false.
     */
    email: false,

    /** api: config[shortenerCreateURL]
     *  ``String``
     *  The URL used to create the short URL.
     */

    /** private: property[viewShort]
     *  ``Boolean``
     *  A short url is displayed
     */
    viewShort: false,

    /** private: property[emailField]
     *  ``Ext.form.TextField``
     *  The email text field
     */

    /* i18n */
    toolTitle: "Show current permalink",
    windowTitle: "Permalink",
    openlinkText: "Open Link",
    closeText: "Close",
    incompatibleWithIeText: "Warning: this URL is too long for Microsoft Internet Explorer!",
    menuText: "Permalink",
    shortText: "Short URL",
    emailText: "E-mail (optional)",

    /** private: method[getLink]
     */
    getLink: function() {
        // generate a clean url to provide to the PermalinkProvider
        // to avoid recovering unvanted parameters from the url
        var base = window.location.protocol + "//" +
                        window.location.host +
                        window.location.pathname;
        var params = OpenLayers.Util.getParameters();
        if (params.debug !== undefined) {
            base = Ext.urlAppend(base, 'debug=' + params.debug);
        }
        return Ext.state.Manager.getProvider().getLink(base);
    },

    /** api: method[addActions]
     */
    addActions: function() {

        var link = '';

        var permalinkTextField = new Ext.form.TextField({
            hideLabel: true,
            autoHeight: true,
            listeners: {
                'focus': function() {
                    this.selectText();
                }
            },
            layout: 'fit',
            width: '97%'
        });

        var warningLabel = new Ext.Panel({
            html: this.incompatibleWithIeText,
            hidden: true,
            layout: 'fit',
            unstyled: true
        });

        var permalinkWindowConfig = {
            layout: 'form',
            renderTo: Ext.getBody(),
            width: 400,
            labelWidth: 120, 
            closeAction: 'hide',
            plain: true,
            title: this.windowTitle,
            cls: 'permalink',
            listeners: {
                scope: this,
                'hide': function() {
                    this.view_short = false;
                }
            },
            items: [
                permalinkTextField,
                warningLabel
            ],
            buttons: [{
                text: this.openlinkText,
                handler: function() {
                    window.open(permalinkTextField.getValue());
                    permalinkWindow.hide();
                }
            }, {
                text: this.closeText,
                handler: function() {
                    permalinkWindow.hide();
                }
            }]
        };
        if (this.shortenerCreateURL) {
            var shortButton = new Ext.Button({
                text: this.shortText,
                scope: this,
                handler: function() {
                    this.view_short = true;
                    var params = {
                        'url': this.getLink()
                    };
                    if (this.email && this.emailField.getValue() !== '') {
                        params.email = this.emailField.getValue();
                    }
                    Ext.Ajax.request({
                        url: this.shortenerCreateURL,
                        params: params,
                        success: function(response) {
                            var obj = Ext.util.JSON.decode(response.responseText);
                            permalinkTextField.setValue(obj.short_url);
                        }
                    });
                }
            });
            permalinkWindowConfig.buttons.push(shortButton);
            if (this.email) {
                this.emailField = new Ext.form.TextField({
                    fieldLabel: this.emailText
                });
                permalinkWindowConfig.items.push(this.emailField);
            }
        }
        var permalinkWindow = new Ext.Window(permalinkWindowConfig);

        // Registers a statechange listener to update the value
        // of the permalink text field.
        Ext.state.Manager.getProvider().on({
            statechange: function(provider) {
                if (!this.view_short) {
                    link = this.getLink();
                    permalinkTextField.setValue(link);
                    this.permalink = link;

                    var splittedURL = link.split(/\/+/g);
                    var path = "/" + splittedURL[splittedURL.length - 1];
                    // IE limits, see: http://support.microsoft.com/kb/208427
                    if (link.length > 2083 || path.length > 2048) {
                        warningLabel.show();
                    }
                    else {
                        warningLabel.hide();
                    }
                    permalinkWindow.doLayout();
                }
            },
            scope: this
        });

        var action = Ext.apply({
            allowDepress: false,
            iconCls: 'permalink',
            tooltip: this.toolTitle,
            menuText: this.menuText,
            handler: function() {
                if (permalinkWindow.hidden) {
                    // reset the link in case the user deleted/modified it by error
                    permalinkTextField.setValue(link);
                    permalinkWindow.show();
                }
            }
        }, this.actionConfig);

        return cgxp.plugins.Permalink.superclass.addActions.apply(this, [action]);
    }
});

Ext.preg(cgxp.plugins.Permalink.prototype.ptype, cgxp.plugins.Permalink);

/**
 * Creates the permalink provider.
 */
Ext.state.Manager.setProvider(
    new GeoExt.state.PermalinkProvider({encodeType: false})
);
