/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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

Ext.namespace("cgxp.tools");

/**
 * Open an external url in a Ext windows
 * This is a replacement for the usual 'window.open(...)'
 */
cgxp.tools.openInfoWindow = function(url, title, width, height) {
    var content = {
        xtype: 'box',
        autoEl: {
            tag: 'iframe',
            src: url,
            align: 'left',
            scrolling: 'auto',
            frameborder: '0'
        }
    };
    cgxp.tools.openWindow(content, title, width, height);
};

/**
 * Generic Ext windows handler
 */
cgxp.tools.openWindow = function(content, title, width, height) {
    if (cgxp.tools.popupWindow) {
        cgxp.tools.popupWindow.destroy();
    }
    cgxp.tools.popupWindow = new Ext.Window({
        title: title,
        resizable: true,
        layout:'fit',
        constrainHeader: true,
        modal: false,
        width: width+15,
        height: height,
        items: content
    });

    cgxp.tools.popupWindow.show();
};
