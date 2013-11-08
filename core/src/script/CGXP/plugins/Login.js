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
 * @requires plugins/Tool.js
 * @include CGXP/widgets/tool/Button.js
 * @include CGXP/widgets/tool/Window.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Login
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Login plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_login',
 *              actionTarget: 'center.tbar',
 *              toggleGroup: 'maptools',
 *      % if user:
 *              username: "${user.username}",
 *              isPasswordChanged: ${"true" if user.is_password_changed else "false"},
 *      % endif
 *              loginURL: "${request.route_url('login', path='')}",
 *              loginChangeURL: "${request.route_url('loginchange', path='')}",
 *              logoutURL: "${request.route_url('logout', path='')}",
 *              permalinkId: "permalink",
 *              enablePasswordChange: true,
 *              forcePasswordChange: true,
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Login(config)
 *
 *    Provides an action that opens a login form panel.
 */
cgxp.plugins.Login = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_login */
    ptype: "cgxp_login",

    /** api: config[toggleGroup]
     *  The group this toggle button is member of.
     */
    toggleGroup: null,

    /** api: config[loginURL]
     *  URL of the login service.
     */
    loginURL: null,

    /** api: config[loginChangeURL]
     *  URL of the login change service.
     */
    loginChangeURL: null,

    /** api: config[logoutURL]
     *  URL of the logout service.
     */
    logoutURL: null,

    /** api: config[username]
     *  Username of currently logged in user.
     */
    username: null,

    /** api: config[isPasswordChanged]
     *  ``Boolean``
     *  State if the user password has been changed.
     *  Only required if ``forcePasswordChange`` is enabled.
     *
     *  Default: false
     */
    isPasswordChanged: false,

    /** api: config[actionConfig]
     *  ``Object``
     *  Config object for the action created by this plugin.
     */
    actionConfig: null,

    /** api[config]: extraHtml
     *  ``String``
     *  Some extra HTML code to put below the login form (optional).
     */
    extraHtml: null,

    loginForm: null,
    loginWindow: null,
    actionButton: null,
    submitButton: null,

    /** api: config[permalinkId]
     *  ``String``
     *  Id of the permalink tool.
     *  You need to set an id in the permalink plugin config
     */
    permalinkId: null,

    /** api: config[ignoreExistingPermalink]
     *  ``Boolean``
     *  if set to true, existing permalink in url are ignored and the permalink 
     *  corresponding to the up-to-date state of the application is used.
     *
     *  Default: false
     */
    ignoreExistingPermalink: false,

    /** api: config[enablePasswordChange]
     *  ``Boolean``
     *  if set to true, a menu is enabled, allowing the user to change his
     *  password.
     * 
     *  Default: false
     */
    enablePasswordChange: false,

    /** api: config[forcePasswordChange]
     *  ``Boolean``
     *  if set to true, display a message reminding the user to change his 
     *  password (if he hasn't already).
     *  Require ``isPasswordChanged`` to be set.
     *
     *  Default: false
     */
    forcePasswordChange: false,

    /* i18n */
    authenticationFailureText: "Impossible to connect.",
    loggedAsText: "Logged in as ${user}",
    logoutText: "Logout",
    loginText: "Login",
    loginMenuText: "Account",
    changePasswordButtonText: "Submit",
    usernameText: "Username",
    passwordText: "Password",
    newPasswordText: "New Password",
    confirmNewPasswordText: "Confirm New Password",
    changePasswordText: "Change password",
    actionButtonTooltip: "Login/Logout",
    accountButtonTooltip: "Manage connection",
    pwdChangeOkTitle: "Password Changed",
    pwdChangeOkText: "The password change has been applied.",
    pwdChangeForceTitle: "Change Password",
    pwdChangeForceText: "You must change your password.",

    /** api: method[addActions]
     */
    addActions: function() {
        this.submitButton = new Ext.Button({
            text: this.loginText,
            formBind: true,
            handler: this.submitForm,
            scope: this
        });
        this.loginForm = this.createLoginForm();
        var items = [this.loginForm];

        if (this.extraHtml) {
            items.push({
                xtype: 'box',
                html: this.extraHtml
            });
        }

        this.loginWindow = new cgxp.tool.Window({
            width: 250,
            items: items,
            listeners: {
                show: function() {
                    this.loginForm.startMonitoring();
                },
                hide: function() {
                    this.loginForm.stopMonitoring();
                },
                scope: this
            }
        });
        this.loginWindow.render(Ext.getBody());

        if (this.username) {

            var simpleButtonConfig = Ext.apply({
                text: this.logoutText,
                tooltip: this.actionButtonTooltip,
                handler: function() {
                    Ext.Ajax.request({
                        url: this.logoutURL,
                        success: function() {
                            url = window.location.href;
                            url = url.replace(/#.*$/, '');
                            window.location.href = url;
                        }
                    });
                },
                scope: this
            }, this.actionConfig);

            getActionButton = function () {
                if (this.enablePasswordChange) {
                    if (!this.actionButton) {
                        this.actionButton = new Ext.Toolbar.SplitButton({
                            text: this.loginMenuText,
                            tooltip: this.accountButtonTooltip,
                            iconCls: 'useraccount',
                            handler: function (b, e) {
                                b.showMenu();
                            },
                            menu : {
                                items: [
                                    simpleButtonConfig,
                                    Ext.apply({
                                        text: this.changePasswordText,
                                        enableToggle: true,
                                        toggleGroup: this.toggleGroup,
                                        window: this.loginWindow,
                                        listeners: {
                                            'click': function() {
                                                this.toggleLoginWindow();
                                            },
                                            scope: this
                                        }
                                    }, this.actionConfig)
                                ]
                            },
                            scope: this
                        });
                    }
                } else {
                    if (!this.actionButton) {
                        this.actionButton = new Ext.Button(simpleButtonConfig);
                    }
                }
                return this.actionButton;
            }.createDelegate(this);

            this.toolbarItems = [
                new Ext.Toolbar.TextItem({
                    text: OpenLayers.String.format(this.loggedAsText, 
                        {user : this.username})
                }),
                getActionButton()
            ];
        } else {
            this.toolbarItems = new cgxp.tool.Button(Ext.apply({
                text: this.loginText,
                tooltip: this.actionButtonTooltip,
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                window: this.loginWindow
            }, this.actionConfig));
        }

        if (this.username && this.forcePasswordChange && !this.isPasswordChanged) {
            Ext.Msg.alert(this.pwdChangeForceTitle, this.pwdChangeForceText);
            this.toggleLoginWindow();
        }

        return cgxp.plugins.Login.superclass.addActions.apply(this, [this.toolbarItems]);
    },

    toggleLoginWindow: function() {
        this.togglePasswordChangeFields(true);
        if (!this.loginWindow.hidden) {
            this.loginWindow.hide();
        } else {
            this.loginWindow.show();
            var toolbar = this.getContainer(this.actionTarget);
            this.loginWindow.anchorTo(toolbar.getEl(), 'tr-br');
        }
    },

    togglePasswordChangeFields: function(show) {
        var l1 = ['login', 'password'];
        var l2 = ['newPassword', 'confirmNewPassword'];
        var f = this.loginForm.getForm();

        var showFields = function(l) {
            Ext.each(l, function(i) {
              var el = f.findField(i);
              el.allowBlank = false;
              el.show();
              el.enable();
            }, this);
        }
        var hideFields = function(l) {
            Ext.each(l, function(i) {
              var el = f.findField(i);
              el.allowBlank = true;
              el.hide();
              el.disable();
            }, this);
        }

        if (show) {
            hideFields(l1)
            showFields(l2);
            this.actionChangePassword = true;
            this.submitButton.setText(this.changePasswordButtonText);
            f.url = this.loginChangeURL;
        } else {
            hideFields(l2)
            showFields(l1);
            this.actionChangePassword = false;
            this.submitButton.setText(this.loginText);
            f.url = this.loginURL;
        }
    },

    createLoginForm: function() {

        var newPassword = new Ext.form.TextField({
            fieldLabel: this.newPasswordText,
            name: 'newPassword',
            applyTo: 'newPassword',
            inputType: 'password',
            width: 120,
            allowBlank: true,
            hidden: true
        });

        var newPasswordConfirm = new Ext.form.TextField({
            fieldLabel: this.confirmNewPasswordText,
            name: 'confirmNewPassword',
            applyTo: 'confirmNewPassword',
            inputType: 'password',
            width: 120,
            allowBlank: true,
            hidden: true,
            validator: function(value){
                if(newPassword.getValue() != value) {
                    return 'Error! Value not identical';
                } else {
                    return true;
                }
            }
        });

        return new Ext.FormPanel({
            labelWidth: 100,
            width: 230,
            unstyled: true,
            url: this.loginURL,
            defaultType: 'textfield',
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
            }, 
            newPassword,
            newPasswordConfirm,
            {
                xtype: 'box',
                cls: 'x-form-item login-failure-msg',
                ref: 'failureMsg',
                html: this.authenticationFailureText,
                hidden: true
            }],
            buttons:[this.submitButton]
        });
    },

    submitForm: function() {
        this.submitButton.setIconClass('loading');

        this.loginForm.getForm().submit({
            method: 'POST',
            success: function() {
                if (this.actionChangePassword) {
                    this.submitButton.setIconClass('');
                    this.loginWindow.hide();
                    Ext.Msg.alert(this.pwdChangeOkTitle, this.pwdChangeOkText);
                } else {
                    if (Ext.isIE) {
                        window.external.AutoCompleteSaveForm(
                            this.loginForm.getForm().el.dom);
                    }
                    /* this is needed to trigger the save password behavior in the 
                       browser, which only take into account normal form submit and
                       not ajax form submit, so we submit the form a 2nd time just 
                       to save the password */
                    this.loginForm.getForm().el.dom.action = this.getUrl();
                    this.loginForm.getForm().standardSubmit = true;
                    this.loginForm.getForm().submit();
                }
            },
            failure: function(form, action) {
                this.submitButton.setIconClass('');
                this.loginForm.getForm().reset();
                this.loginForm.failureMsg.show();
            },
            scope: this
        });
    },

    /**
     * return the url where the user is redirected after login
     * if the current url is already a permalink, use it as it is,
     * otherwise get the permalink
     */
    getUrl: function() {
        /* check if the current url is already a permalink (map_x exists) and 
           also check if all other other required parameters are set */
        var targetUrl;
        var currentUrl = window.location.href;

        if (this.permalinkId == null) {
            alert('permalinkId is missing in your login plugin config.');
            return currentUrl;
        }
        // map_x is used as an indicator of existing permalink
        if (!this.ignoreExistingPermalink && 
              window.location.search.indexOf('map_x') > -1) {
            targetUrl = currentUrl;
        } else {
            if (this.target.tools[this.permalinkId]) {
                targetUrl = this.target.tools[this.permalinkId].permalink;
            } else {
                alert('permalinkId not found, your permalink plugin "id" config' +
                      ' is either missing or wrong');
                targetUrl = currentUrl;
            }
        }
        return targetUrl;
    }

});

Ext.preg(cgxp.plugins.Login.prototype.ptype, cgxp.plugins.Login);
