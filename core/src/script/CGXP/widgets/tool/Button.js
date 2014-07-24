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
 * Class cgxp.tool.Button
 * An {Ext.Button} with specific configuration
 *
 * This type of button takes at least the following config options:
 * window : a {cgxp.tool.Window} to show when the button is clicked.
 */

Ext.namespace("cgxp.tool");

cgxp.tool.Button = function(config) {
    // call parent constructor
    cgxp.tool.Button.superclass.constructor.call(this, config);
};

Ext.extend(cgxp.tool.Button, Ext.Button, {
    initComponent: function() {
        cgxp.tool.Button.superclass.initComponent.call(this, arguments);

        this.on('toggle', function(button) {
            if (button.pressed) {
                this.window.show();
                // we suppose the button is in a toolbar
                var toolbar = this.ownerCt;
                this.window.anchorTo(toolbar.getEl(), 'tr-br');
            } else {
                this.window.hide();
            }
        });
        this.window.on('hide', function() {
            this.toggle(false);
        }, this);
    }
});
