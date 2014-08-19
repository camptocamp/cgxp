/**
 * Copyright (c) 2012-2014 by Camptocamp SA
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
 * @requires ExtOverrides/WindowDD.js
 * @include GeoExt/widgets/MapPanel.js
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

Ext.namespace("cgxp.tools.notification");

/**
 * The notification element.
 */
cgxp.tools.notification.element = null;

/**
 * The notification timeout ID.
 */
cgxp.tools.notification.timeout = undefined;

/**
 * Shows the notification window
 */
cgxp.tools.notification.show = function(message, timeout, mapPanel) {
    if (cgxp.tools.notification.timeout) {
        window.clearTimeout(cgxp.tools.notification.timeout);
        cgxp.tools.notification.timeout = undefined;
    }
    if (!cgxp.tools.notification.element) {
        cgxp.tools.notification.element = Ext.DomHelper.append(
            mapPanel || GeoExt.MapPanel.guess().getEl(),
            { html: '<div class="featureswindow-notif"></div>' },
            true
        );
    }
    cgxp.tools.notification.element.dom.firstChild.innerHTML = message;
    cgxp.tools.notification.element.show();
    if (timeout) {
        cgxp.tools.notification.timeout = setTimeout(
            cgxp.tools.notification.close, timeout
        );
    }
};

/**
 * Close the notification window
 */
cgxp.tools.notification.close = function(message, timeout, mapPanel) {
    if (cgxp.tools.notification.element) {
        cgxp.tools.notification.element.fadeOut({ duration: 2, remove: false });
    }
    cgxp.tools.notification.timeout = undefined;
};

/**
 * A good modulo as in Python
 */
cgxp.tools.modulo = function(dividend, divisor) {
    return (dividend % divisor + divisor) % divisor;
};
