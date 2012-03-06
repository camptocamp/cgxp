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
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Panel
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Panel(config)
 *
 *    Provides an action that opens a Panel panel.
 */
cgxp.plugins.Panel = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_panel */
    ptype: "cgxp_panel",

    /** api: config[toggleGroup]
     *  The group this toggle button is member of.
     */
    toggleGroup: "maptools",
    /** api: config[actionTarget]
     *  Target for the action output.
     */
    actionTarget: null,

    /** api: config[buttonText]
     * Text visible on the toolbar button.
     */
    buttonText: "Button",
    /** api: config[buttonTooltipText]
     * Text visible on the button tooltip.
     */
    buttonTooltipText: "Tooltip",
    /** api: config[titleText]
     * Text visible as a panel title.
     */
    titleText: "Title",

    /** api: method[addActions]
     */
    addActions: function() {
        if (this.actionTarget) {
            var button = new Ext.Button({
                text: this.buttonText,
                tooltip: this.buttonTooltipText,
                enableToggle: true,
                toggleGroup: this.toggleGroup
            });
            var win;

            button.on('toggle', function(button) {
                if (button.pressed) {
                    if (win) {
                        win.show();
                    }
                    else {
                        this.outputConfig = Ext.apply({
                            title: this.titleText,
                            closable: true,
                            resizable: false,
                            unstyled: true,
                            cls: 'toolwindow'
                        }, this.outputConfig);

                        win = this.addOutput().ownerCt.ownerCt;

                        win.on('hide', function() {
                            button.toggle(false);
                        }, this);

                    }
                    // we suppose the button is in a toolbar
                    var toolbar = button.ownerCt;
                    win.anchorTo(toolbar.getEl(), 'tr-br');
                } else {
                    win.hide();
                }
            }, this);

            return cgxp.plugins.Panel.superclass.addActions.call(this, [button]);
        }
        else {
            return cgxp.plugins.Panel.superclass.addActions.apply(this, arguments);
        }
    },

    /** api: method[addActions]
     */
    addOutput: function(panel) {
        if (this.outputTarget) {
            // To be display correctly the plan componement should be in a panel.
            // And should be plain for the tool window.
            return cgxp.plugins.Panel.superclass.addOutput.call(this, {
                title: this.titleText,  
                items: [panel]
            });
        }
        else {
            // add window title and not closable
            this.outputConfig = Ext.apply({
                title: this.titleText,
                closable: false
            }, this.outputConfig);
            return cgxp.plugins.Panel.superclass.addOutput.call(this, panel);
        }
    }
});

Ext.preg(cgxp.plugins.Panel.prototype.ptype, cgxp.plugins.Panel);
