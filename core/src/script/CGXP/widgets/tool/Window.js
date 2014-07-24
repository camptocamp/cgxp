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
 * Class cgxp.tool.Window
 * An {Ext.Window} with specific configuration
 */
Ext.namespace('cgxp.tool');

cgxp.tool.Window = function(config) {

    this.renderTo = Ext.getBody();
    this.closeAction = 'hide';
    this.unstyled = true;
    this.resizable = false;
    this.shadow = false;
    this.cls = 'toolwindow';
    // call parent constructor
    cgxp.tool.Window.superclass.constructor.call(this, config);
};
Ext.extend(cgxp.tool.Window, Ext.Window, {});
