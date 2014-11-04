/**
 * Copyright (c) 2011-2014 by Camptocamp SA
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
 *              loginFormTopCell: {
 *                  html: 'some content here',
 *                  xtype: 'panel',
 *                  unstyled: true,
 *                  height: 50
 *              }
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

    /** api: config[loginFormTopCell]
     *  ``Ext.Component`` containing some HTML code to place above the form
     *  of the login panel. Default is null. Not displayed in the password 
     *  change form.
     */
    loginFormTopCell: null,

    /** api: config[loginFormBottomCell]
     *  ``Ext.Component`` containing some HTML code to place below the form
     *  of the login panel. Default is null. Not displayed in the password 
     *  change form.
     */
    loginFormBottomCell: null,

    /** api: config[isIntranetAnonymous]
     *  ``Boolean`` True when an anonymous user is detected as coming from the
     *  intranet.
     *
     *  Default: false.
     */
    isIntranetAnonymous: false,

    /** private: property[mapMoved]
     *  The user moved the map.
     */
    mapMoved: false,

    /** api: config[toolbarItems]
     *  ``Array`` List of items shown in the toolbar for the login tool.
     *  
     *  Default: empty array.
     */
    toolbarItems: [],

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
    actionButtonTooltip: "Sign in / Sign out",
    accountButtonTooltip: "Manage connection",
    pwdChangeOkTitle: "Password Changed",
    pwdChangeOkText: "The password change has been applied.",
    pwdChangeKoTitle: "Password update has failed",
    pwdChangeForceTitle: "Change Password",
    pwdChangeForceText: "You must change your password.",

    /** private: method[addActions]
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
            // If available, add the username to the toolbar.
            this.toolbarItems.push(
                new Ext.Toolbar.TextItem({
                    text: OpenLayers.String.format(this.loggedAsText,
                        {user : this.username})
                })
            );
        }

        if (this.username && !this.isIntranetAnonymous) {
            // Add logout + account management buttons if user is actually
            // logged in (not for anonymous users with a default intranet
            // role).

            var logoutButtonConfig = Ext.apply({
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
                                    logoutButtonConfig,
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
                        this.actionButton = new Ext.Button(logoutButtonConfig);
                    }
                }
                return this.actionButton;
            }.createDelegate(this);

            this.toolbarItems.push(getActionButton());
        } else {
            this.toolbarItems.push(new cgxp.tool.Button(Ext.apply({
                text: this.loginText,
                tooltip: this.actionButtonTooltip,
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                window: this.loginWindow
            }, this.actionConfig)));
        }

        if (this.username && this.forcePasswordChange && !this.isPasswordChanged) {
            Ext.Msg.alert(this.pwdChangeForceTitle, this.pwdChangeForceText);
            this.toggleLoginWindow();
        }

        var self = this;
        setTimeout(function() {
            self.target.mapPanel.map.events.on({
                move: function() {
                    self.mapMoved = true;
                }
            });
        }, 1000);

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
            hideFields(l1);
            if (this.loginFormTopCell) {
                this.loginFormTopCellPanel.setVisible(false);
            }
            if (this.loginFormBottomCell) {
                this.loginFormBottomCellPanel.setVisible(false);
            }
            showFields(l2);
            this.actionChangePassword = true;
            this.submitButton.setText(this.changePasswordButtonText);
            f.url = this.loginChangeURL;
        } else {
            hideFields(l2);
            showFields(l1);
            if (this.loginFormTopCell) {
                this.loginFormTopCellPanel.setVisible(true);
            }
            if (this.loginFormBottomCell) {
                this.loginFormBottomCellPanel.setVisible(true);
            }
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
            validator: function(value) {
                if (newPassword.getValue() != value) {
                    return 'Error! Value not identical';
                } else {
                    return true;
                }
            }
        });

        var formItems = [
            {
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
            }
        ];
        if (this.loginFormTopCell) {
            this.loginFormTopCellPanel = new Ext.Panel(this.loginFormTopCell);
            formItems.unshift(this.loginFormTopCellPanel);
        }
        if (this.loginFormBottomCell) {
            this.loginFormBottomCellPanel = new Ext.Panel(this.loginFormBottomCell);
            formItems.push(this.loginFormBottomCellPanel);
        }

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
            items: formItems,
            buttons:[this.submitButton]
        });
    },

    submitForm: function() {
        this.submitButton.setIconClass('loading');

        this.loginForm.getForm().submit({
            method: 'POST',
            success: function(element, evt) {
                if (this.actionChangePassword) {
                    this.submitButton.setIconClass('');
                    this.loginWindow.hide();
                    var response = new OpenLayers.format.json.read(evt.response.responseText);
                    if (response.success) {
                        Ext.Msg.alert(this.pwdChangeOkTitle, this.pwdChangeOkText);
                    }
                    else {
                        Ext.Msg.alert(this.pwdChangeKoTitle, response.error);
                    }
                } else {
                    if (Ext.isIE) {
                        window.external.AutoCompleteSaveForm(
                            this.loginForm.getForm().el.dom);
                    }
                    /* this is needed to trigger the save password behavior in the 
                       browser, which only take into account normal form submit and
                       not ajax form submit, so we submit the form a 2nd time just 
                       to save the password */
                    if (this.mapMoved) {
                        this.loginForm.getForm().el.dom.action = this.getUrl();
                    }
                    else {
                        this.loginForm.getForm().el.dom.action = window.location.href;
                    }
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
