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
 * @requires CGXP/widgets/PermalinkProvider.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Permalink
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Permalink(config)
 *
 *    Provides an action that opens a window containing a permalink
 *    for the application.
 */
cgxp.plugins.Permalink = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_print */
    ptype: "cgxp_permalink",

    /** api: config[options]
     *  ``Object``
     *  parameters for the tool
     */
    options: null,

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
            }
        });

        var permalinkWindow = new Ext.Window({
            layout: 'fit',
            renderTo: Ext.getBody(),
            width: 400,
            closeAction: 'hide',
            plain: true,
            title: OpenLayers.i18n('Permalink.title'),
            items: permalinkTextField,
            buttons: [{
                text: OpenLayers.i18n('Permalink.openlink'),
                handler: function() {
                    window.open(permalinkTextField.getValue());
                    permalinkWindow.hide();
                }
            }, {
                text: OpenLayers.i18n('close'),
                handler: function() {
                    permalinkWindow.hide();
                }
            }]
        });

        // Registers a statechange listener to update the value
        // of the permalink text field.
        Ext.state.Manager.getProvider().on({
            statechange: function(provider) {
                link = provider.getLink();
                permalinkTextField.setValue(link);
            }
        });

        options = Ext.apply({
            allowDepress: false,
            iconCls: 'permalink',
            handler: function() {
                // reset the link in case the user deleted/modified it by error
                permalinkTextField.setValue(link);
                permalinkWindow.show();
            }
        }, this.options);
        
        var action = new Ext.Action(options);

        return cgxp.plugins.Permalink.superclass.addActions.apply(this, [action]);
    }
});

Ext.preg(cgxp.plugins.Permalink.prototype.ptype, cgxp.plugins.Permalink);

/**
 * Creates the permalink provider.
 */
Ext.state.Manager.setProvider(
    new cgxp.PermalinkProvider({encodeType: false})
);
