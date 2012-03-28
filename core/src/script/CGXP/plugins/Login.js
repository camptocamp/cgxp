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
 * @requires CGXP/plugins/Panel.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Login
 */

/** api: (extends)
 *  cgxp/plugins/Panel.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Login(config)
 *
 *    Provides an action that opens a login form panel.
 */
cgxp.plugins.Login = Ext.extend(cgxp.plugins.Panel, {

    /** api: ptype = cgxp_login */
    ptype: "cgxp_login",

    /** api: config[loginURL]
     *  URL of the login service.
     */
    loginURL: null,

    /** api: config[logoutURL]
     *  URL of the logout service.
     */
    logoutURL: null,

    /** api: config[username]
     *  Username of currently logged in user.
     */
    username: null,

    button: null,
    loginForm: null,

    buttonText: "Login",
    buttonTooltipText: undefined,
    titleText: undefined,

    authenticationFailureText: "Impossible to connect.",
    loggedAsText: "Logged in as ${user}",
    logoutText: "Logout",
    usernameText: "Username",
    passwordText: "Password",

    outputConfig: {
        width: 250
    },

    /** api: method[addActions]
     */
    addActions: function() {
        if (this.username) {
            return cgxp.plugins.Login.superclass.addActions.apply(this, [[
                new Ext.Toolbar.TextItem({
                    text: OpenLayers.String.format(this.loggedAsText, {user : this.username})
                }),
                new Ext.Button({
                    text: this.logoutText,
                    handler: function() {
                        Ext.Ajax.request({
                            url: this.logoutURL,
                            success: function() {
                                window.location.href = window.location.href;
                            }
                        });
                    },
                    scope: this
                })
            ]]);
        } 
        else {
            return cgxp.plugins.Login.superclass.addActions.apply(this, arguments);
        }
    },

    /** api: method[addOutput]
     */
    addOutput: function() {
        this.button = new Ext.Button({
            text: this.buttonText,
            formBind: true,
            handler: this.submitForm,
            scope: this
        });

        this.loginForm = this.createLoginForm();
        return cgxp.plugins.Login.superclass.addOutput.call(this, this.loginForm);
    },

    createLoginForm: function() {
        return new Ext.FormPanel({
            labelWidth: 100,
            width: 230,
            unstyled: true,
            url: this.loginURL,
            defaultType: 'textfield',
            monitorValid: true,
            autoScroll: false,
            autoHeight: true,
            ctCls: 'no-background',
            defaults: {
                enableKeyEvents: true,
                listeners: {
                    specialkey: function(field, el) {
                        if (el.getKey() == Ext.EventObject.ENTER) {
                            this.submitForm();
                        }
                    },
                    scope: this
                }
            },
            items:[{
                fieldLabel: this.usernameText,
                name: 'login',
                applyTo: 'login',
                width: 120,
                allowBlank: false
            }, {
                fieldLabel: this.passwordText,
                name: 'password',
                applyTo: 'password',
                inputType: 'password',
                width: 120,
                allowBlank: false
            }, {
                xtype: 'box',
                ref: 'failureMsg',
                html: this.authenticationFailureText,
                hidden: true
            }],
            buttons:[this.button]
        });
    },

    submitForm: function() {
        this.button.setIconClass('loading');
        this.loginForm.getForm().submit({
            method: 'POST',
            success: function() {
                if (Ext.isIE) {
                    window.external.AutoCompleteSaveForm(this.loginForm.getForm().el.dom);
                }
                this.loginForm.getForm().el.dom.action = window.location.href;
                this.loginForm.getForm().standardSubmit = true;
                this.loginForm.getForm().submit();
            },
            failure: function(form, action) {
                this.button.setIconClass('');
                this.loginForm.getForm().reset();
                this.loginForm.failureMsg.show();
            },
            scope: this
        });
    }

});

Ext.preg(cgxp.plugins.Login.prototype.ptype, cgxp.plugins.Login);
